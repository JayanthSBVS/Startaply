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

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) { res.status(401).json({ error: 'Auth failed' }); }
};

const managerMiddleware = (req, res, next) => {
  if (req.user?.role !== 'manager') return res.status(403).json({ error: 'Forbidden' });
  next();
};

// ── DB INIT ───────────────────────────────────────────────────────────────────
// Guard prevents re-execution on warm lambda invocations
let authDbInitialized = false;
async function initAuthDb() {
  if (authDbInitialized) return;
  authDbInitialized = true;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        isActive BOOLEAN DEFAULT TRUE,
        lastLogin BIGINT,
        lastLogout BIGINT,
        createdAt BIGINT
      )
    `);

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

    // Index for fast log queries
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_userId ON activity_logs(userId)`);

    // Ensure manager account
    const managerPass = await bcrypt.hash('manager123', 10);
    await pool.query(
      `INSERT INTO users (id, name, email, password, role, createdAt) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (email) DO UPDATE SET password=$4, role='manager', id=$1, name='Operations Manager'`,
      ['manager_principal', 'Operations Manager', 'manager@strataply.com', managerPass, 'manager', Date.now()]
    );

    // Ensure Jayanth account
    const jayanthPass = await bcrypt.hash('jayanth123', 10);
    await pool.query(
      `INSERT INTO users (id, name, email, password, role, createdAt) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (email) DO UPDATE SET password=$4, role='admin', id=$1, name='Jayanth'`,
      ['admin_jayanth', 'Jayanth', 'Jayanth@gmail.com', jayanthPass, 'admin', Date.now()]
    );

  } catch (err) {
    console.error('[Auth DB init error]', err);
    authDbInitialized = false; // Allow retry
  }
}
initAuthDb();

// ── ROUTES ────────────────────────────────────────────────────────────────────

// POST register (manager only)
app.post('/api/auth/register', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const id = 'admin_' + Date.now();
    await pool.query(
      `INSERT INTO users (id, name, email, password, role, createdAt) VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, name, email, hashed, role || 'admin', Date.now()]
    );
    recordActivity(pool, req.user, 'Auth', `Registered new admin: ${name}`, id).catch(() => {});
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Creation failed' }); }
});

// POST login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user  = rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Non-blocking updates
    pool.query('UPDATE users SET lastLogin = $1 WHERE id = $2', [Date.now(), user.id]).catch(() => {});
    recordActivity(pool, { ...user }, 'Auth', `User Logged In`, user.id).catch(() => {});

    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST logout
app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  try {
    pool.query('UPDATE users SET lastLogout = $1 WHERE id = $2', [Date.now(), req.user.id]).catch(() => {});
    recordActivity(pool, req.user, 'Auth', 'User Logged Out', req.user.id).catch(() => {});
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET stats (manager only) — optimised with CTE aggregation to avoid N correlated subqueries
app.get('/api/auth/stats', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    // Short-lived in-memory cache — manager stats don't need sub-second freshness
    const cacheKey = 'admin_stats';
    const cached   = getMemCache(cacheKey, 30); // 30-second cache
    if (cached) return res.json(cached);

    const now            = Date.now();
    const fourteenDaysAgo = now - (14 * 24 * 60 * 60 * 1000);
    const todayMillis    = new Date().setHours(0, 0, 0, 0);

    // ── Global counts in one round trip ─────────────────────────────────────
    const [jobs, melas, companies, apps, feedback] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM jobs'),
      pool.query('SELECT COUNT(*) FROM job_mela'),
      pool.query('SELECT COUNT(*) FROM companies'),
      pool.query('SELECT COUNT(*) FROM applications'),
      pool.query('SELECT COUNT(*) FROM feedback'),
    ]);

    const [todayJobs, todayPrep, todayMela, todayCompanies] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM jobs WHERE createdat >= $1', [todayMillis]),
      pool.query('SELECT COUNT(*) FROM prep_data WHERE createdat >= $1', [todayMillis]),
      pool.query('SELECT COUNT(*) FROM job_mela WHERE createdat >= $1', [todayMillis]),
      pool.query('SELECT COUNT(*) FROM companies WHERE createdat >= $1', [todayMillis]),
    ]);

    // ── Per-admin productivity via CTE aggregation (replaces correlated subqueries) ──
    // Instead of N×4 correlated subqueries per user, we do 4 GROUP BY aggregations
    // and join them — O(N) instead of O(N²).
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
        u.id, u.name, u.email, u.role,
        u.isactive, u.lastlogin, u.lastlogout, u.createdat,
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
      totalJobs:        parseInt(jobs.rows[0].count),
      totalApplications: parseInt(apps.rows[0].count),
      totalCompanies:   parseInt(companies.rows[0].count),
      todayJobs:        parseInt(todayJobs.rows[0].count),
      todayPrep:        parseInt(todayPrep.rows[0].count),
      todayMela:        parseInt(todayMela.rows[0].count),
      todayCompanies:   parseInt(todayCompanies.rows[0].count),
      totalToday:       parseInt(todayJobs.rows[0].count) + parseInt(todayPrep.rows[0].count) + parseInt(todayMela.rows[0].count),
      totalAdmins:      adminStats.rows.length,

      adminProductivity: adminStats.rows.map(row => ({
        id:               row.id,
        adminName:        row.name,
        email:            row.email,
        role:             row.role,
        isActive:         row.isactive,
        lastLogin:        row.lastlogin,
        lastLogout:       row.lastlogout,
        createdAt:        row.createdat,
        jobCountTotal:    parseInt(row.job_total  || 0),
        companyCountTotal: parseInt(row.comp_total || 0),
        prepCountTotal:   parseInt(row.prep_total  || 0),
        melaCountTotal:   parseInt(row.mela_total  || 0),
        jobCountToday:    parseInt(row.job_today   || 0),
        companyCountToday: parseInt(row.comp_today  || 0),
        prepCountToday:   parseInt(row.prep_today   || 0),
        melaCountToday:   parseInt(row.mela_today   || 0),
        historicalJobs:   row.historical_jobs || [],
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

// GET all users
app.get('/api/auth/users', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, role, isactive, lastlogin, createdat FROM users ORDER BY createdat DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET activity logs
app.get('/api/auth/logs', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// TOGGLE user status
app.put('/api/auth/users/:id/toggle', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    await pool.query('UPDATE users SET isactive = $1 WHERE id = $2', [isActive, id]);
    recordActivity(pool, req.user, 'Auth', `Toggled Admin Status: ${id} to ${isActive ? 'Active' : 'Inactive'}`, id).catch(() => {});
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE user
app.delete('/api/auth/users/:id', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    const { rows: u } = await pool.query('SELECT name FROM users WHERE id = $1', [id]);
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    recordActivity(pool, req.user, 'Auth', `Revoked Admin Access: ${u[0]?.name || id}`, id).catch(() => {});
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = app;  // Single export — duplicate removed
