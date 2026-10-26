const express = require('express');
const { authMiddleware, managerMiddleware } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');
const { touchCandidateActivity } = require('../utils/accountGovernance');
const pool = require('../db');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'startaply_super_secret_key_123';

// ── DB INIT ──────────────────────────────────────────────
async function initAuthDb() {
  try {
    // 1. Create Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin', -- 'manager' or 'admin'
        isActive BOOLEAN DEFAULT TRUE,
        lastLogin BIGINT,
        lastLogout BIGINT,
        createdAt BIGINT
      )
    `);

    // 2. Add lastLogout column if it doesn't exist (Migration)
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS lastLogout BIGINT');
      await pool.query('ALTER TABLE candidates ADD COLUMN IF NOT EXISTS last_active_at BIGINT');
      await pool.query('ALTER TABLE candidates ADD COLUMN IF NOT EXISTS avatar TEXT');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT');
    } catch (e) { /* might already exist */ }

    // 2. Create Activity Logs Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        userId VARCHAR(50),
        userName TEXT,
        role TEXT,
        module TEXT,
        action TEXT,
        targetId TEXT,
        timestamp BIGINT
      )
    `);

    // 3. Removed legacy admins migration block as per user request

    // 4. Force-Reconcile Seeded Demo Credentials for All Roles
    const seedUsers = [
      { id: 'admin_principal', name: 'System Manager', email: 'admin@startaply.com', pass: 'admin123', role: 'manager' },
      { id: 'op_manager_demo', name: 'Operations Manager', email: 'manager@startaply.com', pass: 'manager123', role: 'operational_manager' },
      { id: 'op_executive_demo', name: 'Operations Executive', email: 'executive@startaply.com', pass: 'executive123', role: 'operational_executive' }
    ];

    for (const u of seedUsers) {
      const hashedPass = await bcrypt.hash(u.pass, 10);
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [u.email]);
      if (existing.rows.length > 0) {
        await pool.query(
          `UPDATE users SET role = $1, name = $2, password = $3 WHERE email = $4`,
          [u.role, u.name, hashedPass, u.email]
        );
      } else {
        await pool.query(
          `INSERT INTO users (id, name, email, password, role, createdAt) VALUES ($1, $2, $3, $4, $5, $6)`,
          [u.id, u.name, u.email, hashedPass, u.role, Date.now()]
        );
      }
    }

    // 5. DATA ATTRIBUTION MIGRATION (Link records to reconciled identity)
    try {
      const principalManagerId = 'admin_principal';
      await pool.query(`UPDATE jobs SET createdByAdminId = $1 WHERE createdByAdminId = 'system' OR createdByAdminId IS NULL OR createdByAdminId = 'admin_legacy' OR createdByAdminId = 'manager_principal' OR createdByAdminId = 'admin_jayanth'`, [principalManagerId]);
      await pool.query(`UPDATE companies SET createdByAdminId = $1 WHERE createdByAdminId = 'system' OR createdByAdminId IS NULL OR createdByAdminId = 'admin_legacy' OR createdByAdminId = 'manager_principal' OR createdByAdminId = 'admin_jayanth'`, [principalManagerId]);
      await pool.query(`UPDATE prep_data SET createdByAdminId = $1 WHERE createdByAdminId = 'system' OR createdByAdminId IS NULL OR createdByAdminId = 'admin_legacy' OR createdByAdminId = 'manager_principal' OR createdByAdminId = 'admin_jayanth'`, [principalManagerId]);
      await pool.query(`UPDATE job_mela SET createdByAdminId = $1 WHERE createdByAdminId = 'system' OR createdByAdminId IS NULL OR createdByAdminId = 'admin_legacy' OR createdByAdminId = 'manager_principal' OR createdByAdminId = 'admin_jayanth'`, [principalManagerId]);
      console.log('Operational Migration: Identity reconciliation complete.');
    } catch (e) {
      console.error('Operational Migration Error:', e.message);
    }

    // 6. ROLE PERMISSIONS TABLE INITIALIZATION
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS role_permissions (
          role TEXT PRIMARY KEY,
          can_post_job BOOLEAN DEFAULT TRUE,
          can_edit_job BOOLEAN DEFAULT TRUE,
          can_delete_job BOOLEAN DEFAULT TRUE,
          can_view_applicants BOOLEAN DEFAULT TRUE,
          can_manage_companies BOOLEAN DEFAULT TRUE,
          can_manage_mela BOOLEAN DEFAULT TRUE,
          can_manage_prep BOOLEAN DEFAULT TRUE,
          updated_at BIGINT
        )
      `);

      const defaultPerms = [
        ['manager',                true,  true,  true,  true,  true,  true,  true],
        ['operational_manager',    true,  true,  true,  true,  true,  true,  true],
        ['operational_executive',  true,  true,  true,  true,  true,  true,  true]
      ];
      for (const [r, post, edit, del, apps, comps, mela, prep] of defaultPerms) {
        await pool.query(
          `INSERT INTO role_permissions (role, can_post_job, can_edit_job, can_delete_job, can_view_applicants, can_manage_companies, can_manage_mela, can_manage_prep, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           ON CONFLICT (role) DO UPDATE SET can_delete_job = excluded.can_delete_job`,
          [r, post, edit, del, apps, comps, mela, prep, Date.now()]
        );
      }
      // Cleanup old roles if needed
      await pool.query(`DELETE FROM role_permissions WHERE role NOT IN ('manager', 'operational_manager', 'operational_executive')`);

      console.log('Operational Migration: Role permissions seeded successfully.');
    } catch (e) {
      console.error('Role Permissions Migration Error:', e.message);
    }

  } catch (err) {
    console.error('Auth DB init error:', err.message);
  }
}
initAuthDb();

const FALLBACK_SEED_USERS = [
  { id: 'admin_principal', name: 'System Manager', email: 'admin@startaply.com', pass: 'admin123', role: 'manager' },
  { id: 'op_manager_demo', name: 'Operations Manager', email: 'manager@startaply.com', pass: 'manager123', role: 'operational_manager' },
  { id: 'op_executive_demo', name: 'Operations Executive', email: 'executive@startaply.com', pass: 'executive123', role: 'operational_executive' }
];

// ── CANDIDATE SIGNUP ENDPOINT ─────────────────────────────
router.post('/signup', async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    city,
    linkedinUrl,
    whatsappSync = true,
    careerTrack,
    subTrack,
    qualification,
    skills,
    preferences = {}
  } = req.body;

  // 1. Mandatory Baseline Validation
  if (!name || name.trim().length < 3) {
    return res.status(400).json({ error: 'Full name is required and must be at least 3 characters.' });
  }

  const normalizedEmail = (email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const cleanPhone = (phone || '').replace(/\D/g, '');
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ error: 'A valid 10-digit mobile number is required.' });
  }

  // 2. Strict Password Policy Verification (Senior Security Spec)
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password does not meet strict security criteria (minimum 8 characters, uppercase, lowercase, number, and special character required).'
    });
  }

  // 3. Compulsory LinkedIn Profile Verification
  const cleanLinkedin = (linkedinUrl || '').trim();
  const linkedinRegex = /^(https?:\/\/)?([a-z0-9-]+\.)?linkedin\.com\/.+/i;
  if (!cleanLinkedin || !linkedinRegex.test(cleanLinkedin)) {
    return res.status(400).json({
      error: 'A verified LinkedIn profile URL is compulsory (e.g., https://www.linkedin.com/in/username).'
    });
  }

  // 4. Validate Career Track
  const validTracks = ['it', 'non-it', 'gig', 'others'];
  const sanitizedTrack = (careerTrack || 'it').toLowerCase();
  if (!validTracks.includes(sanitizedTrack)) {
    return res.status(400).json({ error: 'Invalid career track selected.' });
  }

  try {
    // 5. Duplicate Identity Check (Email & Phone)
    const existingCheck = await pool.query(
      'SELECT id, email, phone FROM candidates WHERE LOWER(email) = $1 OR phone = $2 LIMIT 1',
      [normalizedEmail, cleanPhone]
    );

    if (existingCheck.rows.length > 0) {
      const match = existingCheck.rows[0];
      if (match.email.toLowerCase() === normalizedEmail) {
        return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
      }
      return res.status(409).json({ error: 'An account with this mobile number already exists.' });
    }

    // 6. Secure Password Hashing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 7. Generate Distributed ID & Timestamps
    const candidateId = `cand_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = Date.now();

    // 8. DB Persistence
    const insertQuery = `
      INSERT INTO candidates (
        id, name, email, password, phone, city, linkedin_url,
        whatsapp_sync, career_track, sub_track, qualification,
        skills, preferences, status, avatar, created_at, updated_at,
        last_login, last_active_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19
      ) RETURNING id, name, email, phone, city, linkedin_url as "linkedinUrl",
                  whatsapp_sync as "whatsappSync", career_track as "careerTrack",
                  sub_track as "subTrack", qualification, skills, preferences,
                  status, avatar, created_at as "createdAt"
    `;

    const insertValues = [
      candidateId,
      name.trim(),
      normalizedEmail,
      hashedPassword,
      cleanPhone,
      (city || 'Bengaluru').trim(),
      cleanLinkedin,
      Boolean(whatsappSync),
      sanitizedTrack,
      (subTrack || '').trim(),
      (qualification || '').trim(),
      typeof skills === 'string' ? skills : Array.isArray(skills) ? skills.join(', ') : '',
      typeof preferences === 'object' ? JSON.stringify(preferences) : preferences,
      'REGISTERED',
      req.body.avatar || null,
      now,
      now,
      now,
      now
    ];

    const { rows } = await pool.query(insertQuery, insertValues);
    const candidate = rows[0];

    // 9. Sign Secure Session JWT
    const token = jwt.sign(
      {
        id: candidate.id,
        email: candidate.email,
        role: 'candidate',
        name: candidate.name,
        career_track: candidate.careerTrack
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 10. Realtime Operational Notification to Manager & Executive Panels
    if (req.io) {
      req.io.emit('DATA_UPDATED', {
        module: 'Candidates',
        action: 'signup',
        candidate: {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          careerTrack: candidate.careerTrack,
          subTrack: candidate.subTrack,
          createdAt: candidate.createdAt
        }
      });
    }

    // 11. Structured Audit Log
    await logActivity(
      candidate.id,
      candidate.name,
      'candidate',
      'Candidates',
      `New candidate registered: ${candidate.name} (${candidate.careerTrack.toUpperCase()})`,
      candidate.id
    ).catch(() => {});

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        city: candidate.city,
        linkedinUrl: candidate.linkedinUrl,
        whatsappSync: candidate.whatsappSync,
        careerTrack: candidate.careerTrack,
        subTrack: candidate.subTrack,
        qualification: candidate.qualification,
        skills: candidate.skills,
        preferences: candidate.preferences,
        status: candidate.status,
        avatar: candidate.avatar || null,
        role: 'candidate'
      }
    });
  } catch (err) {
    console.error('[Candidate Signup Error]', err);
    return res.status(500).json({ error: 'Server error processing registration. Please try again.' });
  }
});

// ── UNIFIED LOGIN ENDPOINT (STAFF & CANDIDATES) ───────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const normalizedIdentifier = email.trim().toLowerCase();

  try {
    // 1. Check Administrative Users (Manager, Op Manager, Op Executive)
    const { rows: userRows } = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = $1',
      [normalizedIdentifier]
    );

    if (userRows && userRows.length > 0) {
      if (!(await bcrypt.compare(password, userRows[0].password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!userRows[0].isactive) {
        return res.status(403).json({ error: 'Your account is currently disabled. Contact Operational Manager.' });
      }

      const user = userRows[0];
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Update last login
      await pool.query('UPDATE users SET lastLogin = $1 WHERE id = $2', [Date.now(), user.id]).catch(() => {});

      // Log Activity & Emit Update
      await logActivity(user.id, user.name, user.role, 'Auth', 'User Logged In', user.id).catch(() => {});
      if (req.io) req.io.emit('DATA_UPDATED', { module: 'Auth', action: 'login', userName: user.name });

      return res.json({
        token,
        user: { id: user.id, email: user.email, role: user.role, name: user.name, avatar: user.avatar || null }
      });
    }

    // 2. Check Candidate Roster (By Email or Phone)
    const cleanPhone = email.replace(/\D/g, '');
    const { rows: candRows } = await pool.query(
      'SELECT * FROM candidates WHERE LOWER(email) = $1 OR (phone = $2 AND $2 <> \'\') LIMIT 1',
      [normalizedIdentifier, cleanPhone]
    );

    if (candRows && candRows.length > 0) {
      const candidate = candRows[0];

      if (!(await bcrypt.compare(password, candidate.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        {
          id: candidate.id,
          email: candidate.email,
          role: 'candidate',
          name: candidate.name,
          career_track: candidate.career_track
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Update last login
      await pool.query('UPDATE candidates SET last_login = $1, last_active_at = $1 WHERE id = $2', [Date.now(), candidate.id]).catch(() => {});

      if (req.io) {
        req.io.emit('DATA_UPDATED', { module: 'Candidates', action: 'login', candidateName: candidate.name });
      }

      return res.json({
        token,
        user: {
          id: candidate.id,
          email: candidate.email,
          name: candidate.name,
          role: 'candidate',
          phone: candidate.phone,
          city: candidate.city,
          linkedinUrl: candidate.linkedin_url,
          whatsappSync: candidate.whatsapp_sync,
          careerTrack: candidate.career_track,
          subTrack: candidate.sub_track,
          qualification: candidate.qualification,
          skills: candidate.skills,
          preferences: candidate.preferences,
          status: candidate.status,
          avatar: candidate.avatar || null
        }
      });
    }

  } catch (dbErr) {
    console.warn('[Auth DB Query Warning]', dbErr.message);
  }

  // 3. Fallback to built-in staff accounts if DB is offline or account not found in DB
  const matched = FALLBACK_SEED_USERS.find(u => u.email.toLowerCase() === normalizedIdentifier);
  if (matched && matched.pass === password) {
    const token = jwt.sign(
      { id: matched.id, email: matched.email, role: matched.role, name: matched.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({
      token,
      user: { id: matched.id, email: matched.email, role: matched.role, name: matched.name }
    });
  }

  return res.status(401).json({ error: 'Invalid credentials. Please verify your email/phone and password.' });
});

router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const timestamp = Date.now();
    await pool.query('UPDATE users SET lastLogout = $1 WHERE id = $2', [timestamp, req.user.id]);

    // Log Activity & Emit Update
    await logActivity(req.user.id, req.user.name, req.user.role, 'Auth', 'User Logged Out', req.user.id);
    if (req.io) req.io.emit('DATA_UPDATED', { module: 'Auth', action: 'logout', userName: req.user.name });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// ── CANDIDATE PROFILE & PREFERENCES ───────────────────────

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    touchCandidateActivity(userId).catch(() => {});

    const { rows: candRows } = await pool.query(
      'SELECT id, name, email, phone, city, linkedin_url as "linkedinUrl", whatsapp_sync as "whatsappSync", career_track as "careerTrack", sub_track as "subTrack", qualification, skills, preferences, status, avatar, created_at as "createdAt", updated_at as "updatedAt" FROM candidates WHERE id = $1 OR LOWER(email) = LOWER($2) LIMIT 1',
      [userId, userEmail]
    );

    if (candRows && candRows.length > 0) {
      const cand = candRows[0];
      let parsedPrefs = cand.preferences;
      if (typeof parsedPrefs === 'string') {
        try { parsedPrefs = JSON.parse(parsedPrefs); } catch {}
      }
      return res.json({
        ...cand,
        preferences: parsedPrefs,
        role: 'candidate'
      });
    }

    res.json({ id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role });
  } catch (err) {
    console.error('[Get Profile Error]', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    touchCandidateActivity(userId).catch(() => {});
    const {
      name,
      phone,
      city,
      linkedinUrl,
      careerTrack,
      subTrack,
      qualification,
      skills,
      preferences,
      avatar
    } = req.body;

    const now = Date.now();
    const cleanPhone = phone !== undefined ? phone.replace(/\D/g, '') : null;
    const effectiveLinkedin = linkedinUrl !== undefined ? linkedinUrl : req.body.linkedin_url;
    const effectiveTrack = careerTrack !== undefined ? careerTrack : req.body.career_track;
    const effectiveSub = subTrack !== undefined ? subTrack : req.body.sub_track;
    const cleanLinkedin = effectiveLinkedin !== undefined ? (effectiveLinkedin || '').trim() : null;
    const serializedPrefs = typeof preferences === 'object' ? JSON.stringify(preferences) : preferences;

    // Check if user is in candidates table
    const { rows: existingCand } = await pool.query(
      'SELECT * FROM candidates WHERE id = $1 OR LOWER(email) = LOWER($2) LIMIT 1',
      [userId, userEmail]
    );

    if (existingCand && existingCand.length > 0) {
      const cand = existingCand[0];
      const updateQuery = `
        UPDATE candidates SET
          name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          city = COALESCE($3, city),
          linkedin_url = COALESCE($4, linkedin_url),
          career_track = COALESCE($5, career_track),
          sub_track = COALESCE($6, sub_track),
          qualification = COALESCE($7, qualification),
          skills = COALESCE($8, skills),
          preferences = COALESCE($9, preferences),
          avatar = CASE WHEN $10 IS NOT NULL THEN $10 ELSE avatar END,
          updated_at = $11,
          last_active_at = $11
        WHERE id = $12
        RETURNING id, name, email, phone, city, linkedin_url as "linkedinUrl",
                  whatsapp_sync as "whatsappSync", career_track as "careerTrack",
                  sub_track as "subTrack", qualification, skills, preferences,
                  status, avatar, created_at as "createdAt", updated_at as "updatedAt"
      `;

      const values = [
        name !== undefined ? name.trim() : null,
        cleanPhone,
        city !== undefined ? city.trim() : null,
        cleanLinkedin,
        effectiveTrack !== undefined ? (effectiveTrack || '').toLowerCase().trim() : null,
        effectiveSub !== undefined ? (effectiveSub || '').trim() : null,
        qualification !== undefined ? qualification.trim() : null,
        typeof skills === 'string' ? skills : Array.isArray(skills) ? skills.join(', ') : null,
        serializedPrefs !== undefined ? serializedPrefs : null,
        avatar !== undefined ? (avatar || null) : null,
        now,
        cand.id
      ];

      const { rows: updatedRows } = await pool.query(updateQuery, values);
      const updated = updatedRows[0];

      let parsedPrefs = updated.preferences;
      if (typeof parsedPrefs === 'string') {
        try { parsedPrefs = JSON.parse(parsedPrefs); } catch {}
      }

      const returnUser = {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        city: updated.city,
        linkedinUrl: updated.linkedinUrl,
        whatsappSync: updated.whatsappSync,
        careerTrack: updated.careerTrack,
        subTrack: updated.subTrack,
        qualification: updated.qualification,
        skills: updated.skills,
        preferences: parsedPrefs,
        role: 'candidate',
        status: updated.status,
        avatar: updated.avatar || null
      };

      if (req.io) {
        req.io.emit('DATA_UPDATED', {
          module: 'Candidates',
          action: 'update_preferences',
          candidate: returnUser
        });
      }

      await logActivity(
        updated.id,
        updated.name,
        'candidate',
        'Candidates',
        `Candidate updated preferences: ${updated.name} (${updated.careerTrack?.toUpperCase()} - ${updated.subTrack})`,
        updated.id
      ).catch(() => {});

      return res.json({
        success: true,
        user: returnUser
      });
    }

    // If user is a staff/admin user in users table
    if (name || avatar) {
      await pool.query('UPDATE users SET name = COALESCE($1, name), avatar = COALESCE($2, avatar) WHERE id = $3', [name ? name.trim() : null, avatar || null, userId]).catch(() => {});
    }

    return res.json({
      success: true,
      user: { ...req.user, name: name || req.user.name }
    });

  } catch (err) {
    console.error('[Update Profile Error]', err);
    res.status(500).json({ error: 'Failed to update profile preferences.' });
  }
});

// ── ADMIN MANAGEMENT (MANAGER ONLY) ───────────────────────

// GET all users
router.get('/users', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, role, isactive, lastlogin, createdat FROM users ORDER BY createdat DESC');
    res.json(rows);
  } catch (err) {
    console.warn('[AUTH /users fallback]', err.message);
    res.json(FALLBACK_SEED_USERS.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, isactive: true, createdat: Date.now() })));
  }
});

// CREATE new admin
router.post('/register', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = 'admin_' + Date.now();

    await pool.query(
      `INSERT INTO users (id, name, email, password, role, createdat) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, name, email, hashedPassword, role || 'admin', Date.now()]
    );

    await logActivity(req.user.id, req.user.name, req.user.role, 'Auth', `Created Admin: ${name} (${email})`, id);
    req.io.emit('DATA_UPDATED', { module: 'Auth' });

    res.status(201).json({ message: 'User created' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// TOGGLE user status
router.put('/users/:id/toggle', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    await pool.query('UPDATE users SET isactive = $1 WHERE id = $2', [isActive, id]);

    await logActivity(req.user.id, req.user.name, req.user.role, 'Auth', `Changed status for ${id} to ${isActive ? 'Active' : 'Disabled'}`, id);
    req.io.emit('DATA_UPDATED', { module: 'Auth' });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE user
router.delete('/users/:id', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });

    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    await logActivity(req.user.id, req.user.name, req.user.role, 'Auth', `Deleted User: ${id}`, id);
    req.io.emit('DATA_UPDATED', { module: 'Auth' });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET Activity Logs
router.get('/logs', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.warn('[AUTH /logs fallback]', err.message);
    res.json([]);
  }
});

// GET Dashboard Summary (accessible to all admins)
router.get('/dashboard-summary', authMiddleware, async (req, res) => {
  try {
    const [jobs, melas, companies, apps, candidates] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM jobs'),
      pool.query('SELECT COUNT(*) FROM job_mela'),
      pool.query('SELECT COUNT(*) FROM companies'),
      pool.query('SELECT COUNT(*) FROM applications'),
      pool.query('SELECT COUNT(*) FROM candidates').catch(() => ({ rows: [{ count: 0 }] }))
    ]);

    res.json({
      totalJobs: parseInt(jobs.rows[0]?.count || 0),
      totalApplications: parseInt(apps.rows[0]?.count || 0),
      totalCompanies: parseInt(companies.rows[0]?.count || 0),
      totalMelas: parseInt(melas.rows[0]?.count || 0),
      totalCandidates: parseInt(candidates.rows[0]?.count || 0)
    });
  } catch (err) {
    console.warn('[Dashboard Summary fallback]', err.message);
    res.json({ totalJobs: 0, totalApplications: 0, totalCompanies: 0, totalMelas: 0, totalCandidates: 0 });
  }
});

// GET Global Stats for Dashboard
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [jobs, melas, companies, apps, feedback] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM jobs'),
      pool.query('SELECT COUNT(*) FROM job_mela'),
      pool.query('SELECT COUNT(*) FROM companies'),
      pool.query('SELECT COUNT(*) FROM applications'),
      pool.query('SELECT COUNT(*) FROM feedback')
    ]);

    const todayMillis = new Date().setHours(0, 0, 0, 0);
    const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);

    // Aggregate Today Stats for Pulse
    const [todayJobs, todayPrep, todayMela, todayCompanies] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM jobs WHERE createdat >= $1', [todayMillis]),
      pool.query('SELECT COUNT(*) FROM prep_data WHERE createdat >= $1', [todayMillis]),
      pool.query('SELECT COUNT(*) FROM job_mela WHERE createdat >= $1', [todayMillis]),
      pool.query('SELECT COUNT(*) FROM companies WHERE createdat >= $1', [todayMillis])
    ]);

    // Detailed Admin Performance (Aggregated for Performance)
    let userFilter = '';
    let queryParams = [todayMillis, fourteenDaysAgo];
    if (req.user.role === 'operational_executive') {
      userFilter = 'WHERE u.id = $3';
      queryParams.push(req.user.id);
    } else if (req.user.role === 'operational_manager') {
      userFilter = `WHERE u.id = $3 OR u.role = 'operational_executive'`;
      queryParams.push(req.user.id);
    }

    const adminStats = await pool.query(`
      WITH
        job_counts AS (SELECT createdbyadminid as uid, COUNT(*) as count, COUNT(*) FILTER (WHERE createdat >= $1) as today FROM jobs GROUP BY uid),
        comp_counts AS (SELECT createdbyadminid as uid, COUNT(*) as count, COUNT(*) FILTER (WHERE createdat >= $1) as today FROM companies GROUP BY uid),
        prep_counts AS (SELECT createdbyadminid as uid, COUNT(*) as count, COUNT(*) FILTER (WHERE createdat >= $1) as today FROM prep_data GROUP BY uid),
        mela_counts AS (SELECT createdbyadminid as uid, COUNT(*) as count, COUNT(*) FILTER (WHERE createdat >= $1) as today FROM job_mela GROUP BY uid)

      SELECT
        u.id, u.name as "adminName", u.email, u.role, u.isactive as "isActive", u.lastlogin as "lastLogin", u.lastlogout as "lastLogout", u.createdat as "createdAt",
        COALESCE(j.count, 0) as "jobCountTotal",
        COALESCE(c.count, 0) as "companyCountTotal",
        COALESCE(p.count, 0) as "prepCountTotal",
        COALESCE(m.count, 0) as "melaCountTotal",
        COALESCE(j.today, 0) as "jobCountToday",
        COALESCE(c.today, 0) as "companyCountToday",
        COALESCE(p.today, 0) as "prepCountToday",
        COALESCE(m.today, 0) as "melaCountToday",
        (
           SELECT COALESCE(json_agg(day_stat), '[]'::json) FROM (
             SELECT TO_CHAR(TO_TIMESTAMP(createdat/1000), 'YYYY-MM-DD') as date, COUNT(*) as count
             FROM jobs WHERE createdbyadminid = u.id AND createdat >= $2
             GROUP BY date ORDER BY date DESC
           ) day_stat
        ) as "historicalJobs"
      FROM users u
      LEFT JOIN job_counts j ON u.id = j.uid
      LEFT JOIN comp_counts c ON u.id = c.uid
      LEFT JOIN prep_counts p ON u.id = p.uid
      LEFT JOIN mela_counts m ON u.id = m.uid
      ${userFilter}
      ORDER BY u.createdat DESC
    `, queryParams);

    res.json({
      totalJobs: parseInt(jobs.rows[0].count),
      totalApplications: parseInt(apps.rows[0].count),
      totalCompanies: parseInt(companies.rows[0].count),
      todayJobs: parseInt(todayJobs.rows[0].count),
      todayPrep: parseInt(todayPrep.rows[0].count),
      todayMela: parseInt(todayMela.rows[0].count),
      todayCompanies: parseInt(todayCompanies.rows[0].count),
      totalToday: parseInt(todayJobs.rows[0].count) + parseInt(todayPrep.rows[0].count) + parseInt(todayMela.rows[0].count),
      totalAdmins: adminStats.rows.length,
      adminProductivity: adminStats.rows.map(row => {
        const jCount = parseInt(row.jobCountTotal || row.jobcounttotal || 0);
        const cCount = parseInt(row.companyCountTotal || row.companycounttotal || 0);
        const pCount = parseInt(row.prepCountTotal || row.prepcounttotal || 0);
        const mCount = parseInt(row.melaCountTotal || row.melacounttotal || 0);

        const jToday = parseInt(row.jobCountToday || row.jobcounttoday || 0);
        const cToday = parseInt(row.companyCountToday || row.companycounttoday || 0);
        const pToday = parseInt(row.prepCountToday || row.prepcounttoday || 0);
        const mToday = parseInt(row.melaCountToday || row.melacounttoday || 0);

        const total = jCount + cCount + pCount + mCount;
        const today = jToday + cToday + pToday + mToday;

        return {
          ...row,
          jobCountTotal: jCount,
          companyCountTotal: cCount,
          prepCountTotal: pCount,
          melaCountTotal: mCount,
          jobCountToday: jToday,
          companyCountToday: cToday,
          prepCountToday: pToday,
          melaCountToday: mToday,
          lifetimeTotal: total,
          todayTotal: today
        };
      })
    });
  } catch (err) {
    console.warn('[AUTH STATS fallback]', err.message);
    res.json({
      totalJobs: 0,
      totalApplications: 0,
      totalCompanies: 0,
      todayJobs: 0,
      todayPrep: 0,
      todayMela: 0,
      todayCompanies: 0,
      totalToday: 0,
      totalAdmins: FALLBACK_SEED_USERS.length,
      adminProductivity: []
    });
  }
});

// GET current user permissions
router.get('/my-permissions', authMiddleware, async (req, res) => {
  try {
    const role = req.user?.role || 'operational_executive';
    if (role === 'manager' || req.user?.email === 'admin@startaply.com') {
      return res.json({
        role: 'manager',
        can_post_job: true,
        can_edit_job: true,
        can_delete_job: true,
        can_view_applicants: true,
        can_manage_companies: true,
        can_manage_mela: true,
        can_manage_prep: true
      });
    }

    const { rows } = await pool.query('SELECT * FROM role_permissions WHERE role = $1', [role]);
    if (rows && rows.length > 0) {
      return res.json(rows[0]);
    }

    const isOpManager = role === 'operational_manager';
    res.json({
      role,
      can_post_job: true,
      can_edit_job: true,
      can_delete_job: isOpManager,
      can_view_applicants: true,
      can_manage_companies: true,
      can_manage_mela: true,
      can_manage_prep: true
    });
  } catch (err) {
    console.warn('[my-permissions fallback]', err.message);
    res.json({
      role: req.user?.role || 'operational_executive',
      can_post_job: true,
      can_edit_job: true,
      can_delete_job: false,
      can_view_applicants: true,
      can_manage_companies: true,
      can_manage_mela: true,
      can_manage_prep: true
    });
  }
});

// GET role permissions
router.get('/permissions', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM role_permissions ORDER BY role');
    res.json(Array.isArray(rows) && rows.length > 0 ? rows : [
      { role: 'manager', can_post_job: true, can_edit_job: true, can_delete_job: true, can_view_applicants: true, can_manage_companies: true, can_manage_mela: true, can_manage_prep: true },
      { role: 'operational_manager', can_post_job: true, can_edit_job: true, can_delete_job: true, can_view_applicants: true, can_manage_companies: true, can_manage_mela: true, can_manage_prep: true },
      { role: 'operational_executive', can_post_job: true, can_edit_job: true, can_delete_job: false, can_view_applicants: true, can_manage_companies: true, can_manage_mela: true, can_manage_prep: true }
    ]);
  } catch (err) {
    console.warn('[Permissions fetch fallback]', err.message);
    res.json([
      { role: 'manager', can_post_job: true, can_edit_job: true, can_delete_job: true, can_view_applicants: true, can_manage_companies: true, can_manage_mela: true, can_manage_prep: true },
      { role: 'operational_manager', can_post_job: true, can_edit_job: true, can_delete_job: true, can_view_applicants: true, can_manage_companies: true, can_manage_mela: true, can_manage_prep: true },
      { role: 'operational_executive', can_post_job: true, can_edit_job: true, can_delete_job: false, can_view_applicants: true, can_manage_companies: true, can_manage_mela: true, can_manage_prep: true }
    ]);
  }
});

// PUT update role permissions (manager only)
router.put('/permissions', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { role, can_post_job, can_edit_job, can_delete_job, can_view_applicants, can_manage_companies, can_manage_mela, can_manage_prep } = req.body;
    const VALID_ROLES = ['manager', 'operational_manager', 'executive', 'admin'];
    if (!role || !VALID_ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role' });
    if (role === 'manager') return res.status(400).json({ error: 'Cannot restrict manager permissions' });

    await pool.query(
      `INSERT INTO role_permissions (role, can_post_job, can_edit_job, can_delete_job, can_view_applicants, can_manage_companies, can_manage_mela, can_manage_prep, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (role) DO UPDATE SET
         can_post_job=$2, can_edit_job=$3, can_delete_job=$4, can_view_applicants=$5,
         can_manage_companies=$6, can_manage_mela=$7, can_manage_prep=$8, updated_at=$9`,
      [role, !!can_post_job, !!can_edit_job, !!can_delete_job, !!can_view_applicants, !!can_manage_companies, !!can_manage_mela, !!can_manage_prep, Date.now()]
    );

    await logActivity(req.user.id, req.user.name, req.user.role, 'Auth', `Updated permissions for role: ${role}`, role);
    if (req.io) req.io.emit('DATA_UPDATED', { module: 'Auth' });

    res.json({ success: true });
  } catch (err) {
    console.error('[Permissions update error]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
