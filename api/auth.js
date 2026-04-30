const express  = require('express');
const cors     = require('cors');
const { getPool, getMemCache, setMemCache, clearMemCachePrefix, setEdgeCache } = require('./db');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'strataply_super_secret_key_123';

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
let authDbInitialized = false;
async function initAuthDb() {
  if (authDbInitialized) return;
  authDbInitialized = true;
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

    // 4. Seed primary manager — admin@strataply.com / admin123 (new canonical credentials)
    const adminEmail = 'admin@strataply.com';
    const adminPass  = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (id, name, email, password, role, department, createdAt)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (email) DO UPDATE SET password=$4, role='manager', name='System Manager', id=$1`,
      ['admin_strataply', 'System Manager', adminEmail, adminPass, 'manager', 'Management', Date.now()]
    );

    // 5. Keep legacy manager@strataply.com working (backward compat — never break existing login)
    const legacyManagerEmail = 'manager@strataply.com';
    const legacyManagerPass  = await bcrypt.hash('manager123', 10);
    await pool.query(
      `INSERT INTO users (id, name, email, password, role, createdAt)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (email) DO UPDATE SET password=$4, role='manager', id=$1, name='Operations Manager'`,
      ['manager_principal', 'Operations Manager', legacyManagerEmail, legacyManagerPass, 'manager', Date.now()]
    );

    // 6. Keep Jayanth's account — map old 'admin' role to 'executive'
    const jayanthEmail = 'Jayanth@gmail.com';
    const jayanthPass  = await bcrypt.hash('jayanth123', 10);
    await pool.query(
      `INSERT INTO users (id, name, email, password, role, createdAt)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (email) DO UPDATE SET id=$1, name='Jayanth', password=$4, role='executive'`,
      ['admin_jayanth', 'Jayanth', jayanthEmail, jayanthPass, 'executive', Date.now()]
    );

    // 7. Normalize any remaining 'admin' roles → 'executive' (safe, backward-compat migration)
    await pool.query(`UPDATE users SET role = 'executive' WHERE role = 'admin'`).catch(() => {});

    // 8. Data attribution migration — link orphaned records to legacy manager
    const attributionTargets = ['jobs', 'companies', 'prep_data', 'job_mela'];
    for (const table of attributionTargets) {
      await pool.query(
        `UPDATE ${table} SET createdByAdminId = 'manager_principal'
         WHERE createdByAdminId = 'system' OR createdByAdminId IS NULL OR createdByAdminId = 'admin_legacy'`
      ).catch(() => {});
    }

  } catch (err) {
    console.error('[Auth DB init error]', err.message);
    authDbInitialized = false; // Allow retry on next invocation
  }
}
initAuthDb();

// ── ROUTES ────────────────────────────────────────────────────────────────────

// POST login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    if (!user.isactive) {
      return res.status(403).json({ error: 'Account is disabled. Contact a Manager.' });
    }

    // Always use normalized role in token so frontend is never confused
    const normalizedRole = normalizeRole(user.role);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: normalizedRole, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    pool.query('UPDATE users SET lastLogin = $1 WHERE id = $2', [Date.now(), user.id]).catch(() => {});
    recordActivity(pool, { ...user, role: normalizedRole }, 'Auth', 'User Logged In', user.id).catch(() => {});

    res.json({
      token,
      user: { id: user.id, email: user.email, role: normalizedRole, name: user.name }
    });
  } catch (err) {
    console.error('[Login error]', err);
    res.status(500).json({ error: 'Server error' });
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

// GET role permissions (any authenticated user — each sees their own role's config)
app.get('/api/auth/permissions', authMiddleware, async (req, res) => {
  try {
    const cacheKey = 'role_perms_all';
    const cached = getMemCache(cacheKey, 30);
    if (cached) return res.json(cached);

    const { rows } = await pool.query('SELECT * FROM role_permissions ORDER BY role');
    const result = Array.isArray(rows) ? rows : [];
    setMemCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('[Permissions fetch error]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update role permissions (manager only)
app.put('/api/auth/permissions', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { role, can_post_job, can_edit_job, can_delete_job, can_view_applicants, can_manage_companies, can_manage_mela, can_manage_prep } = req.body;
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

module.exports = app;
