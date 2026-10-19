const express  = require('express');
const cors     = require('cors');
const { getPool, getMemCache, setMemCache, clearMemCachePrefix, setEdgeCache } = require('./db');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'startaply_super_secret_key_123';

const { recordActivity } = require('./_shared');

const pool = getPool();

const app = express();
app.use(cors());
app.use(express.json());

// ── ROLE HELPERS ──────────────────────────────────────────────────────────────
// 'admin' is the legacy name for 'executive'. Treat them identically server-side.
const normalizeRole = (role) => {
  if (!role) return 'executive';
  if (role === 'admin') return 'executive';
  return role; // 'manager', 'operational_manager', 'executive'
};

const VALID_ROLES = ['manager', 'operational_manager', 'executive'];

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Always normalize role so downstream code never sees 'admin'
    decoded.role = normalizeRole(decoded.role);
    req.user = decoded;
    next();
  } catch (err) { res.status(401).json({ error: 'Auth failed' }); }
};

const managerMiddleware = (req, res, next) => {
  if (req.user?.role !== 'manager') return res.status(403).json({ error: 'Forbidden: Manager access required' });
  next();
};

// ── DB INIT ───────────────────────────────────────────────────────────────────
let authDbPromise = null;
async function initAuthDb() {
  if (authDbPromise) return authDbPromise;
  authDbPromise = (async () => {
    try {
    // 1. Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'executive',
        department TEXT,
        mobile TEXT,
        joinedAt BIGINT,
        isActive BOOLEAN DEFAULT TRUE,
        lastLogin BIGINT,
        lastLogout BIGINT,
        createdAt BIGINT
      )
    `);

    // Safe column migrations (idempotent)
    const userCols = [
      ['lastLogout', 'BIGINT'],
      ['department', 'TEXT'],
      ['mobile', 'TEXT'],
      ['joinedAt', 'BIGINT'],
    ];
    for (const [col, type] of userCols) {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col} ${type}`).catch(() => {});
    }

    // 2. Activity logs
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
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC)`).catch(() => {});
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_userId ON activity_logs(userId)`).catch(() => {});

    // 3. Role permissions table — manager can configure per-role capabilities
    await pool.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role TEXT PRIMARY KEY,
        can_post_job BOOLEAN DEFAULT TRUE,
        can_edit_job BOOLEAN DEFAULT TRUE,
        can_delete_job BOOLEAN DEFAULT FALSE,
        can_view_applicants BOOLEAN DEFAULT TRUE,
        can_manage_companies BOOLEAN DEFAULT TRUE,
        can_manage_mela BOOLEAN DEFAULT TRUE,
        can_manage_prep BOOLEAN DEFAULT TRUE,
        updated_at BIGINT
      )
    `);

    // Seed default permissions for each role (ON CONFLICT DO NOTHING — never overwrite live config)
    const defaultPerms = [
      ['manager',              true,  true,  true,  true,  true,  true,  true],
      ['operational_manager',  true,  true,  true,  true,  true,  true,  true],
      ['operational_executive',true,  true,  false, true,  true,  true,  true],
      ['executive',            true,  true,  false, true,  true,  true,  true],
    ];
    for (const [role, post, edit, del, apps, companies, mela, prep] of defaultPerms) {
      await pool.query(
        `INSERT INTO role_permissions (role, can_post_job, can_edit_job, can_delete_job, can_view_applicants, can_manage_companies, can_manage_mela, can_manage_prep, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (role) DO NOTHING`,
        [role, post, edit, del, apps, companies, mela, prep, Date.now()]
      );
    }

    // 4. Seed demo accounts for all roles
    const seedUsers = [
      { id: 'admin_startaply', name: 'System Manager', email: 'admin@startaply.com', pass: 'admin123', role: 'manager' },
      { id: 'manager_startaply', name: 'Operations Manager', email: 'manager@startaply.com', pass: 'manager123', role: 'operational_manager' },
      { id: 'executive_startaply', name: 'Operations Executive', email: 'executive@startaply.com', pass: 'executive123', role: 'operational_executive' }
    ];

    for (const u of seedUsers) {
      const hashedPass = await bcrypt.hash(u.pass, 10);
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [u.email]);
      if (existing.rows.length > 0) {
        await pool.query(
          `UPDATE users SET role = $1, name = $2, password = $3 WHERE email = $4`,
          [u.role, u.name, hashedPass, u.email]
        ).catch(() => {});
      } else {
        await pool.query(
          `INSERT INTO users (id, name, email, password, role, department, createdAt) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [u.id, u.name, u.email, hashedPass, u.role, 'Operations', Date.now()]
        ).catch(() => {});
      }
    }

    // 7. Normalize any remaining 'admin' roles → 'executive' (safe, backward-compat migration)
    await pool.query(`UPDATE users SET role = 'executive' WHERE role = 'admin'`).catch(() => {});

    // 8. Data attribution migration — link orphaned records to legacy manager
    const attributionTargets = ['jobs', 'companies', 'prep_data', 'job_mela', 'testimonials'];
    for (const table of attributionTargets) {
      await pool.query(
        `UPDATE ${table} SET createdByAdminId = 'manager_principal'
         WHERE createdByAdminId = 'system' OR createdByAdminId IS NULL OR createdByAdminId = 'admin_legacy'`
      ).catch(() => {});
    }

    // 9. Candidates table for job seekers
    await pool.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        city TEXT,
        linkedin_url TEXT,
        whatsapp_sync BOOLEAN DEFAULT TRUE,
        career_track VARCHAR(50) DEFAULT 'it',
        sub_track VARCHAR(100),
        qualification TEXT,
        skills TEXT,
        preferences JSONB DEFAULT '{}'::jsonb,
        status VARCHAR(50) DEFAULT 'REGISTERED',
        created_at BIGINT,
        updated_at BIGINT,
        last_login BIGINT
      )
    `).catch(() => {});

    } catch (err) {
      console.error('[Auth DB init error]', err.message);
      authDbPromise = null; // Allow retry on next invocation
      throw err;
    }
  })();
  return authDbPromise;
}
initAuthDb().catch(() => {});

// ── ROUTES ────────────────────────────────────────────────────────────────────

// POST login - Unified for Administrative Staff and Candidates
app.post(['/api/auth/login', '/login'], async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const normalizedIdentifier = email.trim().toLowerCase();

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
        return res.status(403).json({ error: 'Account is disabled. Contact a Manager.' });
      }

      const user = userRows[0];
      const normalizedRole = normalizeRole(user.role);

      const token = jwt.sign(
        { id: user.id, email: user.email, role: normalizedRole, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      pool.query('UPDATE users SET lastLogin = $1 WHERE id = $2', [Date.now(), user.id]).catch(() => {});
      recordActivity(pool, { ...user, role: normalizedRole }, 'Auth', 'User Logged In', user.id).catch(() => {});

      return res.json({
        token,
        user: { id: user.id, email: user.email, role: normalizedRole, name: user.name }
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

      pool.query('UPDATE candidates SET last_login = $1 WHERE id = $2', [Date.now(), candidate.id]).catch(() => {});
      recordActivity(pool, { id: candidate.id, name: candidate.name, role: 'candidate' }, 'Auth', 'Candidate Logged In', candidate.id).catch(() => {});

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
          status: candidate.status
        }
      });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    console.error('[Login error]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST candidate signup
app.post(['/api/auth/signup', '/signup', '/api/auth/candidate/signup', '/candidate/signup'], async (req, res) => {
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

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password does not meet strict security criteria (minimum 8 characters, uppercase, lowercase, number, and special character required).'
    });
  }

  const cleanLinkedin = (linkedinUrl || '').trim();
  const linkedinRegex = /^(https?:\/\/)?([a-z0-9-]+\.)?linkedin\.com\/.+/i;
  if (!cleanLinkedin || !linkedinRegex.test(cleanLinkedin)) {
    return res.status(400).json({
      error: 'A verified LinkedIn profile URL is compulsory (e.g., https://www.linkedin.com/in/username).'
    });
  }

  try {
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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const candidateId = `cand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();

    const insertQuery = `
      INSERT INTO candidates (
        id, name, email, phone, password, city, linkedin_url, whatsapp_sync,
        career_track, sub_track, qualification, skills, preferences, status,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      ) RETURNING id, name, email, phone, city, linkedin_url as "linkedinUrl",
        whatsapp_sync as "whatsappSync", career_track as "careerTrack",
        sub_track as "subTrack", qualification, skills, preferences, status, created_at as "createdAt"
    `;

    const insertValues = [
      candidateId,
      name.trim(),
      normalizedEmail,
      cleanPhone,
      hashedPassword,
      (city || '').trim(),
      cleanLinkedin,
      !!whatsappSync,
      (careerTrack || 'it').toLowerCase(),
      (subTrack || '').trim(),
      (qualification || '').trim(),
      typeof skills === 'string' ? skills : Array.isArray(skills) ? skills.join(', ') : '',
      typeof preferences === 'object' ? JSON.stringify(preferences) : preferences,
      'REGISTERED',
      now,
      now
    ];

    const { rows } = await pool.query(insertQuery, insertValues);
    const candidate = rows[0];

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

    recordActivity(pool, { id: candidate.id, name: candidate.name, role: 'candidate' }, 'Candidates', `New candidate registered: ${candidate.name} (${candidate.careerTrack.toUpperCase()})`, candidate.id).catch(() => {});

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
        role: 'candidate'
      }
    });
  } catch (err) {
    console.error('[Candidate Signup Error]', err);
    return res.status(500).json({ error: 'Server error processing registration. Please try again.' });
  }
});

// GET profile
app.get(['/api/auth/profile', '/profile'], authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const { rows: candRows } = await pool.query(
      'SELECT id, name, email, phone, city, linkedin_url as "linkedinUrl", whatsapp_sync as "whatsappSync", career_track as "careerTrack", sub_track as "subTrack", qualification, skills, preferences, status, created_at as "createdAt", updated_at as "updatedAt" FROM candidates WHERE id = $1 OR LOWER(email) = LOWER($2) LIMIT 1',
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

// PUT profile
app.put(['/api/auth/profile', '/profile'], authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const {
      name,
      phone,
      city,
      linkedin_url,
      careerTrack,
      subTrack,
      qualification,
      skills,
      preferences
    } = req.body;

    const { rows: existing } = await pool.query(
      'SELECT * FROM candidates WHERE id = $1 OR LOWER(email) = LOWER($2) LIMIT 1',
      [userId, userEmail]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: 'Candidate profile not found' });
    }

    const current = existing[0];
    const updatedName = name !== undefined ? name.trim() : current.name;
    const updatedPhone = phone !== undefined ? phone.trim() : current.phone;
    const updatedCity = city !== undefined ? city.trim() : current.city;
    const updatedLinkedin = linkedin_url !== undefined ? linkedin_url.trim() : current.linkedin_url;
    const updatedTrack = careerTrack !== undefined ? careerTrack.toLowerCase().trim() : current.career_track;
    const updatedSubTrack = subTrack !== undefined ? subTrack.trim() : current.sub_track;
    const updatedQual = qualification !== undefined ? qualification.trim() : current.qualification;
    const updatedSkills = skills !== undefined ? skills : current.skills;
    const updatedPrefs = preferences !== undefined
      ? (typeof preferences === 'object' ? JSON.stringify(preferences) : preferences)
      : current.preferences;

    const updateQuery = `
      UPDATE candidates
      SET name = $1, phone = $2, city = $3, linkedin_url = $4,
          career_track = $5, sub_track = $6, qualification = $7,
          skills = $8, preferences = $9, updated_at = $10
      WHERE id = $11
      RETURNING id, name, email, phone, city, linkedin_url as "linkedinUrl",
        whatsapp_sync as "whatsappSync", career_track as "careerTrack",
        sub_track as "subTrack", qualification, skills, preferences, status, created_at as "createdAt", updated_at as "updatedAt"
    `;

    const { rows } = await pool.query(updateQuery, [
      updatedName, updatedPhone, updatedCity, updatedLinkedin,
      updatedTrack, updatedSubTrack, updatedQual,
      typeof updatedSkills === 'string' ? updatedSkills : Array.isArray(updatedSkills) ? updatedSkills.join(', ') : '',
      updatedPrefs, Date.now(), current.id
    ]);

    const updated = rows[0];
    let parsedPrefs = updated.preferences;
    if (typeof parsedPrefs === 'string') {
      try { parsedPrefs = JSON.parse(parsedPrefs); } catch {}
    }

    recordActivity(pool, { id: updated.id, name: updated.name, role: 'candidate' }, 'Candidates', `Candidate updated preferences: ${updated.name}`, updated.id).catch(() => {});

    return res.json({
      success: true,
      user: {
        ...updated,
        preferences: parsedPrefs,
        role: 'candidate'
      }
    });
  } catch (err) {
    console.error('[Update Profile Error]', err);
    res.status(500).json({ error: 'Failed to update candidate profile' });
  }
});

// POST logout
app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  try {
    pool.query('UPDATE users SET lastLogout = $1 WHERE id = $2', [Date.now(), req.user.id]).catch(() => {});
    recordActivity(pool, req.user, 'Auth', 'User Logged Out', req.user.id).catch(() => {});
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST register (manager only) — creates new team member
app.post('/api/auth/register', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { name, email, password, role, department, mobile, joinedAt } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });

    const finalRole = VALID_ROLES.includes(role) ? role : 'executive';
    const hashed = await bcrypt.hash(password, 10);
    const id = `user_${Date.now()}`;
    const joinTs = joinedAt ? new Date(joinedAt).getTime() : Date.now();

    await pool.query(
      `INSERT INTO users (id, name, email, password, role, department, mobile, joinedAt, createdAt)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, name, email, hashed, finalRole, department || '', mobile || '', joinTs, Date.now()]
    );
    clearMemCachePrefix('admin_stats');
    recordActivity(pool, req.user, 'Auth', `Created team member: ${name} (${finalRole})`, id).catch(() => {});
    res.status(201).json({ success: true, id });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    console.error('[Register error]', err);
    res.status(500).json({ error: 'Creation failed' });
  }
});

// PUT update user (manager only)
app.put('/api/auth/users/:id', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, department, mobile, joinedAt } = req.body;
    const finalRole = role && VALID_ROLES.includes(role) ? role : undefined;

    let setParts = [];
    let params = [];
    let idx = 1;
    if (name)       { setParts.push(`name=$${idx++}`);       params.push(name); }
    if (finalRole)  { setParts.push(`role=$${idx++}`);       params.push(finalRole); }
    if (department !== undefined) { setParts.push(`department=$${idx++}`); params.push(department); }
    if (mobile !== undefined)     { setParts.push(`mobile=$${idx++}`);     params.push(mobile); }
    if (joinedAt)   { setParts.push(`joinedAt=$${idx++}`);   params.push(new Date(joinedAt).getTime()); }

    if (!setParts.length) return res.status(400).json({ error: 'Nothing to update' });
    params.push(id);
    await pool.query(`UPDATE users SET ${setParts.join(', ')} WHERE id=$${idx}`, params);
    clearMemCachePrefix('admin_stats');
    recordActivity(pool, req.user, 'Auth', `Updated user profile: ${id}`, id).catch(() => {});
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// TOGGLE user status (manager only)
app.put('/api/auth/users/:id/toggle', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    await pool.query('UPDATE users SET isactive = $1 WHERE id = $2', [isActive, id]);
    clearMemCachePrefix('admin_stats');
    recordActivity(pool, req.user, 'Auth', `Toggled user status: ${id} → ${isActive ? 'Active' : 'Inactive'}`, id).catch(() => {});
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE user (manager only)
app.delete('/api/auth/users/:id', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    const { rows: u } = await pool.query('SELECT name, role FROM users WHERE id = $1', [id]);
    if (u.length && u[0].role === 'manager') {
      return res.status(400).json({ error: 'Cannot delete a Manager account' });
    }
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    clearMemCachePrefix('admin_stats');
    recordActivity(pool, req.user, 'Auth', `Deleted user: ${u[0]?.name || id}`, id).catch(() => {});
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET all users (manager only)
app.get('/api/auth/users', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, department, mobile, joinedAt, isactive, lastlogin, lastlogout, createdat
       FROM users ORDER BY createdat DESC`
    );
    // Normalize roles in response
    res.json(rows.map(r => ({ ...r, role: normalizeRole(r.role) })));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET activity logs (manager only)
app.get('/api/auth/logs', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 200');
    res.json(Array.isArray(rows) ? rows : []);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET active user's permissions
app.get('/api/auth/my-permissions', authMiddleware, async (req, res) => {
  try {
    const { getPermissions } = require('./_shared');
    const perms = await getPermissions(pool, req.user.role);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json(perms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

// GET role permissions (any authenticated user — each sees their own role's config)
app.get('/api/auth/permissions', authMiddleware, async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    await initAuthDb(); // Ensure tables are ready
    const { rows } = await pool.query('SELECT * FROM role_permissions ORDER BY role');
    const result = Array.isArray(rows) ? rows : [];
    res.json(result);
  } catch (err) {
    console.error('[Permissions fetch error]', err);
    res.status(500).json({
      error: 'Server error',
      details: err.message,
      code: err.code,
      hint: err.hint
    });
  }
});

// PUT update role permissions (manager only)
app.put('/api/auth/permissions', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { role, can_post_job, can_edit_job, can_delete_job, can_view_applicants, can_manage_companies, can_manage_mela, can_manage_prep } = req.body;
    if (!role || !VALID_ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role' });
    if (role === 'manager') return res.status(400).json({ error: 'Cannot restrict manager permissions' });

    const rolesToUpdate = (role === 'operational_executive' || role === 'executive')
      ? ['operational_executive', 'executive']
      : [role];

    for (const r of rolesToUpdate) {
      await pool.query(
        `INSERT INTO role_permissions (role, can_post_job, can_edit_job, can_delete_job, can_view_applicants, can_manage_companies, can_manage_mela, can_manage_prep, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (role) DO UPDATE SET
           can_post_job=$2, can_edit_job=$3, can_delete_job=$4, can_view_applicants=$5,
           can_manage_companies=$6, can_manage_mela=$7, can_manage_prep=$8, updated_at=$9`,
        [r, !!can_post_job, !!can_edit_job, !!can_delete_job, !!can_view_applicants, !!can_manage_companies, !!can_manage_mela, !!can_manage_prep, Date.now()]
      );
    }
    clearMemCachePrefix('role_perms');
    recordActivity(pool, req.user, 'Auth', `Updated permissions for role: ${role}`, role).catch(() => {});
    res.json({ success: true });
  } catch (err) {
    console.error('[Permissions update error]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET global stats (manager only)
app.get('/api/auth/stats', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const cacheKey = 'admin_stats';
    const cached   = getMemCache(cacheKey, 30);
    if (cached) return res.json(cached);

    const now             = Date.now();
    const fourteenDaysAgo = now - (14 * 24 * 60 * 60 * 1000);
    const todayMillis     = new Date().setHours(0, 0, 0, 0);

    const [jobs, melas, companies, apps] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM jobs'),
      pool.query('SELECT COUNT(*) FROM job_mela'),
      pool.query('SELECT COUNT(*) FROM companies'),
      pool.query('SELECT COUNT(*) FROM applications'),
    ]);

    const [todayJobs, todayPrep, todayMela, todayCompanies] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM jobs WHERE createdat >= $1', [todayMillis]),
      pool.query('SELECT COUNT(*) FROM prep_data WHERE createdat >= $1', [todayMillis]),
      pool.query('SELECT COUNT(*) FROM job_mela WHERE createdat >= $1', [todayMillis]),
      pool.query('SELECT COUNT(*) FROM companies WHERE createdat >= $1', [todayMillis]),
    ]);

    const adminStats = await pool.query(`
      WITH
        job_counts AS (
          SELECT createdbyadminid as admin_id,
            COUNT(*) FILTER (WHERE createdat >= $1) as today,
            COUNT(*) as total
          FROM jobs GROUP BY createdbyadminid
        ),
        company_counts AS (
          SELECT createdbyadminid as admin_id,
            COUNT(*) FILTER (WHERE createdat >= $1) as today,
            COUNT(*) as total
          FROM companies GROUP BY createdbyadminid
        ),
        prep_counts AS (
          SELECT createdbyadminid as admin_id,
            COUNT(*) FILTER (WHERE createdat >= $1) as today,
            COUNT(*) as total
          FROM prep_data GROUP BY createdbyadminid
        ),
        mela_counts AS (
          SELECT createdbyadminid as admin_id,
            COUNT(*) FILTER (WHERE createdat >= $1) as today,
            COUNT(*) as total
          FROM job_mela GROUP BY createdbyadminid
        ),
        historical_jobs AS (
          SELECT createdbyadminid as admin_id,
            COALESCE(json_agg(day_stat ORDER BY day_stat->>'date' DESC), '[]'::json) as history
          FROM (
            SELECT createdbyadminid,
              json_build_object(
                'date', TO_CHAR(TO_TIMESTAMP(createdat/1000), 'YYYY-MM-DD'),
                'count', COUNT(*)
              ) as day_stat
            FROM jobs
            WHERE createdat >= $2
            GROUP BY createdbyadminid, TO_CHAR(TO_TIMESTAMP(createdat/1000), 'YYYY-MM-DD')
          ) sub
          GROUP BY createdbyadminid
        )
      SELECT
        u.id, u.name, u.email, u.role, u.department,
        u.isactive, u.lastlogin, u.lastlogout, u.createdat, u.joinedat,
        COALESCE(j.today,  0) as job_today,    COALESCE(j.total,  0) as job_total,
        COALESCE(c.today,  0) as comp_today,   COALESCE(c.total,  0) as comp_total,
        COALESCE(p.today,  0) as prep_today,   COALESCE(p.total,  0) as prep_total,
        COALESCE(m.today,  0) as mela_today,   COALESCE(m.total,  0) as mela_total,
        COALESCE(h.history, '[]'::json) as historical_jobs
      FROM users u
      LEFT JOIN job_counts     j ON j.admin_id = u.id
      LEFT JOIN company_counts c ON c.admin_id = u.id
      LEFT JOIN prep_counts    p ON p.admin_id = u.id
      LEFT JOIN mela_counts    m ON m.admin_id = u.id
      LEFT JOIN historical_jobs h ON h.admin_id = u.id
      ORDER BY (COALESCE(j.total,0) + COALESCE(c.total,0) + COALESCE(p.total,0) + COALESCE(m.total,0)) DESC
    `, [todayMillis, fourteenDaysAgo]);

    const result = {
      totalJobs:         parseInt(jobs.rows[0].count),
      totalApplications: parseInt(apps.rows[0].count),
      totalCompanies:    parseInt(companies.rows[0].count),
      todayJobs:         parseInt(todayJobs.rows[0].count),
      todayPrep:         parseInt(todayPrep.rows[0].count),
      todayMela:         parseInt(todayMela.rows[0].count),
      todayCompanies:    parseInt(todayCompanies.rows[0].count),
      totalToday:        parseInt(todayJobs.rows[0].count) + parseInt(todayPrep.rows[0].count) + parseInt(todayMela.rows[0].count),
      totalAdmins:       adminStats.rows.length,

      adminProductivity: adminStats.rows.map(row => ({
        id:               row.id,
        adminName:        row.name,
        email:            row.email,
        role:             normalizeRole(row.role),
        department:       row.department || '',
        isActive:         row.isactive,
        lastLogin:        row.lastlogin,
        lastLogout:       row.lastlogout,
        createdAt:        row.createdat,
        joinedAt:         row.joinedat,
        jobCountTotal:    parseInt(row.job_total  || 0),
        companyCountTotal: parseInt(row.comp_total || 0),
        prepCountTotal:   parseInt(row.prep_total  || 0),
        melaCountTotal:   parseInt(row.mela_total  || 0),
        jobCountToday:    parseInt(row.job_today   || 0),
        companyCountToday: parseInt(row.comp_today  || 0),
        prepCountToday:   parseInt(row.prep_today   || 0),
        melaCountToday:   parseInt(row.mela_today   || 0),
        historicalJobs:   Array.isArray(row.historical_jobs) ? row.historical_jobs : [],
        lifetimeTotal:    parseInt(row.job_total||0) + parseInt(row.comp_total||0) + parseInt(row.prep_total||0) + parseInt(row.mela_total||0),
        todayTotal:       parseInt(row.job_today||0) + parseInt(row.comp_today||0) + parseInt(row.prep_today||0) + parseInt(row.mela_today||0),
      })),
    };

    setMemCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('[Stats fetch err]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET dashboard summary (all admins)
app.get('/api/auth/dashboard-summary', authMiddleware, async (req, res) => {
  try {
    const cacheKey = 'dashboard_summary_all';
    const cached = getMemCache(cacheKey, 30);
    if (cached) return res.json(cached);

    const [jobsCount, appsCount, compsCount, melasCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM jobs'),
      pool.query('SELECT COUNT(*) FROM applications'),
      pool.query('SELECT COUNT(*) FROM companies'),
      pool.query('SELECT COUNT(*) FROM job_mela')
    ]);

    const JOBS_SELECT_LIGHT = `id, createdAt, title, company, location, type, isVisible`;
    const [recentJobs, recentApps] = await Promise.all([
      pool.query(`SELECT ${JOBS_SELECT_LIGHT} FROM jobs ORDER BY createdAt DESC LIMIT 5`),
      pool.query(`SELECT id, name, jobTitle, companyName, appliedAt FROM applications ORDER BY appliedAt DESC LIMIT 5`)
    ]);

    const result = {
      totalJobs: parseInt(jobsCount.rows[0].count),
      totalApplications: parseInt(appsCount.rows[0].count),
      totalCompanies: parseInt(compsCount.rows[0].count),
      totalMelas: parseInt(melasCount.rows[0].count),
      recentJobs: recentJobs.rows,
      recentApplications: recentApps.rows
    };

    setMemCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('[Summary fetch err]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET current user permissions
app.get(['/api/auth/my-permissions', '/api/auth/my-permissions/'], authMiddleware, async (req, res) => {
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
app.get(['/api/auth/permissions', '/api/auth/permissions/'], authMiddleware, async (req, res) => {
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
app.put(['/api/auth/permissions', '/api/auth/permissions/'], authMiddleware, managerMiddleware, async (req, res) => {
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

    res.json({ success: true });
  } catch (err) {
    console.error('[Permissions update error]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = app;
