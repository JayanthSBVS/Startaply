const express = require('express');
const { authMiddleware, managerMiddleware } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');
const pool = require('../db');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'strataply_super_secret_key_123';

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

    // 4. Force-Reconcile Operational Manager (Ensure ID and Role consistency)
    const managerEmail = 'manager@strataply.com';
    const managerPass = await bcrypt.hash('manager123', 10);
    const principalManagerId = 'manager_principal';
    
    // Check for existing manager by email
    const existingManager = await pool.query('SELECT id, role FROM users WHERE email = $1', [managerEmail]);
    
    if (existingManager.rows.length > 0) {
      const current = existingManager.rows[0];
      // If the ID or role is inconsistent, force reconcile
      if (current.id !== principalManagerId || current.role !== 'manager') {
        console.log(`Reconciling Manager Identity: ${current.id} -> ${principalManagerId}`);
        // 1. Update the user record (ID, role, name)
        await pool.query(
          `UPDATE users SET id = $1, role = 'manager', name = 'Operations Manager' WHERE email = $2`,
          [principalManagerId, managerEmail]
        );
      }
    } else {
      // Create from scratch if doesn't exist
      await pool.query(`
        INSERT INTO users (id, name, email, password, role, createdAt)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [principalManagerId, 'Operations Manager', managerEmail, managerPass, 'manager', Date.now()]);
    }

    // 5. DATA ATTRIBUTION MIGRATION (Link records to reconciled identity)
    try {
      await pool.query(`UPDATE jobs SET createdByAdminId = $1 WHERE createdByAdminId = 'system' OR createdByAdminId IS NULL OR createdByAdminId = 'admin_legacy'`, [principalManagerId]);
      await pool.query(`UPDATE companies SET createdByAdminId = $1 WHERE createdByAdminId = 'system' OR createdByAdminId IS NULL OR createdByAdminId = 'admin_legacy'`, [principalManagerId]);
      await pool.query(`UPDATE prep_data SET createdByAdminId = $1 WHERE createdByAdminId = 'system' OR createdByAdminId IS NULL OR createdByAdminId = 'admin_legacy'`, [principalManagerId]);
      await pool.query(`UPDATE job_mela SET createdByAdminId = $1 WHERE createdByAdminId = 'system' OR createdByAdminId IS NULL OR createdByAdminId = 'admin_legacy'`, [principalManagerId]);
      console.log('Operational Migration: Identity reconciliation complete.');
    } catch (e) {
      console.error('Operational Migration Error:', e.message);
    }

  } catch (err) {
    console.error('Auth DB init error:', err.message);
  }
}
initAuthDb();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!rows[0].isactive) {
      return res.status(403).json({ error: 'Your account is currently disabled. Contact Operational Manager.' });
    }

    const user = rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    await pool.query('UPDATE users SET lastLogin = $1 WHERE id = $2', [Date.now(), user.id]);

    res.json({ 
      token, 
      user: { id: user.id, email: user.email, role: user.role, name: user.name } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE users SET lastLogout = $1 WHERE id = $2', [Date.now(), req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// ── ADMIN MANAGEMENT (MANAGER ONLY) ───────────────────────

// GET all users
router.get('/users', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, role, isactive, lastlogin, createdat FROM users ORDER BY createdat DESC');
    console.log(`[AUTH] Fetched ${rows.length} users for manager: ${req.user.email}`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
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
    res.status(500).json({ error: 'Server error' });
  }
});

// GET Global Stats for Dashboard
router.get('/stats', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const stats = {};
    const [users, jobs, melas, companies, apps, feedback] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM jobs'),
      pool.query('SELECT COUNT(*) FROM job_mela'),
      pool.query('SELECT COUNT(*) FROM companies'),
      pool.query('SELECT COUNT(*) FROM applications'),
      pool.query('SELECT COUNT(*) FROM feedback')
    ]);

    // Daily trends (last 14 days)
    const now = Date.now();
    const fourteenDaysAgo = now - (14 * 24 * 60 * 60 * 1000);
    const todayMillis = new Date().setHours(0, 0, 0, 0);
    
    // Aggregate Today Stats for Pulse
    const [todayJobs, todayPrep, todayMela, todayCompanies] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM jobs WHERE createdat >= $1', [todayMillis]),
      pool.query('SELECT COUNT(*) FROM prep_data WHERE createdat >= $1', [todayMillis]),
      pool.query('SELECT COUNT(*) FROM job_mela WHERE createdat >= $1', [todayMillis]),
      pool.query('SELECT COUNT(*) FROM companies WHERE createdat >= $1', [todayMillis])
    ]);

    // Detailed Admin Performance (Today vs Lifetime across ALL modules)
    const adminStats = await pool.query(`
      SELECT 
        u.id, u.name as adminname, u.email, u.role, u.isactive, u.lastlogin, u.lastlogout, u.createdat,
        
        -- Lifetime Totals
        (SELECT COUNT(*) FROM jobs WHERE createdbyadminid = u.id) as job_count_total,
        (SELECT COUNT(*) FROM companies WHERE createdbyadminid = u.id) as company_count_total,
        (SELECT COUNT(*) FROM prep_data WHERE createdbyadminid = u.id) as prep_count_total,
        (SELECT COUNT(*) FROM job_mela WHERE createdbyadminid = u.id) as mela_count_total,
        
        -- Today's Totals
        (SELECT COUNT(*) FROM jobs WHERE createdbyadminid = u.id AND createdat >= $1) as job_count_today,
        (SELECT COUNT(*) FROM companies WHERE createdbyadminid = u.id AND createdat >= $1) as company_count_today,
        (SELECT COUNT(*) FROM prep_data WHERE createdbyadminid = u.id AND createdat >= $1) as prep_count_today,
        (SELECT COUNT(*) FROM job_mela WHERE createdbyadminid = u.id AND createdat >= $1) as mela_count_today,
        
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

        -- Totals
        (
          (SELECT COUNT(*) FROM jobs WHERE createdbyadminid = u.id) +
          (SELECT COUNT(*) FROM companies WHERE createdbyadminid = u.id) +
          (SELECT COUNT(*) FROM prep_data WHERE createdbyadminid = u.id) +
          (SELECT COUNT(*) FROM job_mela WHERE createdbyadminid = u.id)
        ) as lifetime_total,
        
        (
          (SELECT COUNT(*) FROM jobs WHERE createdbyadminid = u.id AND createdat >= $1) +
          (SELECT COUNT(*) FROM companies WHERE createdbyadminid = u.id AND createdat >= $1) +
          (SELECT COUNT(*) FROM prep_data WHERE createdbyadminid = u.id AND createdat >= $1) +
          (SELECT COUNT(*) FROM job_mela WHERE createdbyadminid = u.id AND createdat >= $1)
        ) as today_total

      FROM users u
      ORDER BY lifetime_total DESC
    `, [todayMillis, fourteenDaysAgo]);

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
      adminProductivity: adminStats.rows
    });
  } catch (err) {
    console.error('[AUTH STATS] Error:', err);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
});

module.exports = router;