const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'strataply_super_secret_key_123';

const { recordActivity } = require('./_shared');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const app = express();
app.use(cors());
app.use(express.json());

// ── MIDDLEWARE ───────────────────────────────────────────
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

// ── DB INIT (Migrations) ─────────────────────────────────
async function initAuthDb() {
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

    // Ensure manager account
    const managerEmail = 'manager@strataply.com';
    const managerPass = await bcrypt.hash('manager123', 10);
    const principalManagerId = 'manager_principal';
    
    await pool.query(
      `INSERT INTO users (id, name, email, password, role, createdAt)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET password = $4, role = 'manager', id = $1`,
      [principalManagerId, 'Operations Manager', managerEmail, managerPass, 'manager', Date.now()]
    );

    // Ensure Jayanth account
    const jayanthEmail = 'Jayanth@gmail.com';
    const jayanthPass = await bcrypt.hash('jayanth123', 10);
    const jayanthId = 'admin_jayanth';
    
    await pool.query(
      `INSERT INTO users (id, name, email, password, role, createdAt)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET password = $4, role = 'admin', id = $1`,
      [jayanthId, 'Jayanth', jayanthEmail, jayanthPass, 'admin', Date.now()]
    );

  } catch (err) { console.error('Auth DB init error:', err); }
}
initAuthDb();

// ── ROUTES ───────────────────────────────────────────────

app.post('/api/auth/register', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const id = 'admin_' + Date.now();
    await pool.query(
      `INSERT INTO users (id, name, email, password, role, createdAt) VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, name, email, hashed, role || 'admin', Date.now()]
    );
    await recordActivity(pool, req.user, 'Auth', `Registered new admin: ${name}`, id);
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Creation failed' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update lastLogin
    await pool.query('UPDATE users SET lastLogin = $1 WHERE id = $2', [Date.now(), user.id]);
    await recordActivity(pool, { ...user, role: user.role }, 'Auth', `User Logged In`, user.id);

    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/auth/stats', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const [jobs, melas, companies, apps, feedback] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM jobs'),
      pool.query('SELECT COUNT(*) FROM job_mela'),
      pool.query('SELECT COUNT(*) FROM companies'),
      pool.query('SELECT COUNT(*) FROM applications'),
      pool.query('SELECT COUNT(*) FROM feedback')
    ]);

    const now = Date.now();
    const fourteenDaysAgo = now - (14 * 24 * 60 * 60 * 1000);
    const todayMillis = new Date().setHours(0, 0, 0, 0);

    const [todayJobs, todayPrep, todayMela, todayCompanies] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM jobs WHERE createdat >= $1', [todayMillis]),
      pool.query('SELECT COUNT(*) FROM prep_data WHERE createdat >= $1', [todayMillis]),
      pool.query('SELECT COUNT(*) FROM job_mela WHERE createdat >= $1', [todayMillis]),
      pool.query('SELECT COUNT(*) FROM companies WHERE createdat >= $1', [todayMillis])
    ]);

    const adminStats = await pool.query(`
      SELECT 
        u.id, u.name as adminname, u.email, u.role, u.isactive,
        
        -- Lifetime Totals (Normalized column names)
        COALESCE((SELECT COUNT(*) FROM jobs WHERE createdbyadminid = u.id), 0) as job_count_total,
        COALESCE((SELECT COUNT(*) FROM companies WHERE createdbyadminid = u.id), 0) as company_count_total,
        COALESCE((SELECT COUNT(*) FROM prep_data WHERE createdbyadminid = u.id), 0) as prep_count_total,
        COALESCE((SELECT COUNT(*) FROM job_mela WHERE createdbyadminid = u.id), 0) as mela_count_total,
        
        -- Today's Totals
        COALESCE((SELECT COUNT(*) FROM jobs WHERE createdbyadminid = u.id AND createdat >= $1), 0) as job_count_today,
        COALESCE((SELECT COUNT(*) FROM companies WHERE createdbyadminid = u.id AND createdat >= $1), 0) as company_count_today,
        COALESCE((SELECT COUNT(*) FROM prep_data WHERE createdbyadminid = u.id AND createdat >= $1), 0) as prep_count_today,
        COALESCE((SELECT COUNT(*) FROM job_mela WHERE createdbyadminid = u.id AND createdat >= $1), 0) as mela_count_today,
        
        -- Historical Daily performance (last 14 days)
        (
           SELECT json_agg(day_stat) FROM (
             SELECT 
               TO_CHAR(TO_TIMESTAMP(createdat/1000), 'YYYY-MM-DD') as date, 
               COUNT(*) as count
             FROM jobs 
             WHERE createdbyadminid = u.id AND createdat >= $2
             GROUP BY date
             ORDER BY date DESC
           ) day_stat
        ) as historical_jobs,

        -- Total Combined (Calculating server-side to ensure accuracy)
        (
          COALESCE((SELECT COUNT(*) FROM jobs WHERE createdbyadminid = u.id), 0) +
          COALESCE((SELECT COUNT(*) FROM companies WHERE createdbyadminid = u.id), 0) +
          COALESCE((SELECT COUNT(*) FROM prep_data WHERE createdbyadminid = u.id), 0) +
          COALESCE((SELECT COUNT(*) FROM job_mela WHERE createdbyadminid = u.id), 0)
        ) as lifetime_total,
        
        (
          COALESCE((SELECT COUNT(*) FROM jobs WHERE createdbyadminid = u.id AND createdat >= $1), 0) +
          COALESCE((SELECT COUNT(*) FROM companies WHERE createdbyadminid = u.id AND createdat >= $1), 0) +
          COALESCE((SELECT COUNT(*) FROM prep_data WHERE createdbyadminid = u.id AND createdat >= $1), 0) +
          COALESCE((SELECT COUNT(*) FROM job_mela WHERE createdbyadminid = u.id AND createdat >= $1), 0)
        ) as today_total

      FROM users u
      ORDER BY lifetime_total DESC
    `, [todayMillis, fourteenDaysAgo]);

    // Normalize adminStats rows to handle PostgreSQL lowercase column names
    const normalizedAdminStats = adminStats.rows.map(r => ({
      id: r.id,
      adminName: r.adminname || r.name,
      email: r.email,
      role: r.role,
      isActive: r.isactive === true || r.isactive === 'true',
      jobCountTotal: parseInt(r.job_count_total || 0),
      companyCountTotal: parseInt(r.company_count_total || 0),
      prepCountTotal: parseInt(r.prep_count_total || 0),
      melaCountTotal: parseInt(r.mela_count_total || 0),
      jobCountToday: parseInt(r.job_count_today || 0),
      companyCountToday: parseInt(r.company_count_today || 0),
      prepCountToday: parseInt(r.prep_count_today || 0),
      melaCountToday: parseInt(r.mela_count_today || 0),
      historicalJobs: r.historical_jobs || [],
      lifetimeTotal: parseInt(r.lifetime_total || 0),
      todayTotal: parseInt(r.today_total || 0)
    }));

    res.json({
      totalJobs: parseInt(jobs.rows[0].count),
      totalApplications: parseInt(apps.rows[0].count),
      totalCompanies: parseInt(companies.rows[0].count),
      todayJobs: parseInt(todayJobs.rows[0].count),
      todayPrep: parseInt(todayPrep.rows[0].count),
      todayMela: parseInt(todayMela.rows[0].count),
      todayCompanies: parseInt(todayCompanies.rows[0].count),
      totalToday: parseInt(todayJobs.rows[0].count) + parseInt(todayPrep.rows[0].count) + parseInt(todayMela.rows[0].count),
      totalAdmins: normalizedAdminStats.length,
      adminProductivity: normalizedAdminStats
    });
  } catch (err) {
    console.error('Stats fetch err:', err);
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

// GET Activity Logs
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
    await recordActivity(pool, req.user, 'Auth', `Toggled Admin Status: ${id} to ${isActive ? 'Active' : 'Inactive'}`, id);
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
    await recordActivity(pool, req.user, 'Auth', `Revoked Admin Access: ${u[0]?.name || id}`, id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = app;

module.exports = app;
