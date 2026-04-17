const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'strataply_super_secret_key_123';

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

// Init tables
async function init() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_mela (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL, description TEXT, venue TEXT,
        date TEXT, time TEXT, image TEXT, tickerText TEXT,
        isActive BOOLEAN DEFAULT TRUE, showPopup BOOLEAN DEFAULT TRUE,
        createdAt BIGINT,
        createdByAdminId TEXT,
        createdByAdminName TEXT
      )
    `);
    await pool.query(`ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS createdByAdminId TEXT`);
    await pool.query(`ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS createdByAdminName TEXT`);
    await pool.query(`ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS tickerText TEXT`);
    await pool.query(`ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS showPopup BOOLEAN DEFAULT TRUE`);
    await pool.query(`ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS company TEXT`);
    await pool.query(`ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS registrationLink TEXT`);
    await pool.query(`ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS bannerImage TEXT`);
    await pool.query(`ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS googleMapLink TEXT`);
  } catch (err) { console.error(err.message); }
}
init();

app.get('/api/job-mela/admin/list', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM job_mela';
    let params = [];
    if (req.user.role === 'admin') {
      query += ' WHERE createdByAdminId = $1';
      params.push(req.user.id);
    }
    query += ' ORDER BY createdAt DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/job-mela', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM job_mela ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/job-mela/active', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM job_mela WHERE isActive = true ORDER BY createdAt DESC LIMIT 1');
    res.json(rows[0] || null);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/job-mela', authMiddleware, async (req, res) => {
  try {
    const { title, description, venue, date, time, image, tickerText, isActive, showPopup, company, registrationLink, bannerImage, googleMapLink } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO job_mela (title,description,venue,date,time,image,tickerText,isActive,showPopup,company,registrationLink,bannerImage,googleMapLink,createdAt,createdByAdminId,createdByAdminName)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [title, description, venue, date, time, image, tickerText, isActive !== false, showPopup !== false, company, registrationLink, bannerImage, googleMapLink, Date.now(), req.user.id, req.user.name]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ message: 'Server error', detail: err.message }); }
});

app.put('/api/job-mela/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role === 'admin') {
      const { rows } = await pool.query('SELECT createdByAdminId FROM job_mela WHERE id=$1', [id]);
      if (rows.length && rows[0].createdbyadminid !== req.user.id) {
        return res.status(403).json({ error: 'Permission denied' });
      }
    }
    
    const { title, description, venue, date, time, image, tickerText, isActive, showPopup, company, registrationLink, bannerImage, googleMapLink } = req.body;
    const { rows } = await pool.query(
      `UPDATE job_mela SET title=$1,description=$2,venue=$3,date=$4,time=$5,image=$6,tickerText=$7,isActive=$8,showPopup=$9,company=$10,registrationLink=$11,bannerImage=$12,googleMapLink=$13 WHERE id=$14 RETURNING *`,
      [title, description, venue, date, time, image, tickerText, isActive, showPopup, company, registrationLink, bannerImage, googleMapLink, id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.delete('/api/job-mela/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role === 'admin') {
      const { rows } = await pool.query('SELECT createdByAdminId FROM job_mela WHERE id=$1', [id]);
      if (rows.length && rows[0].createdbyadminid !== req.user.id) {
        return res.status(403).json({ error: 'Permission denied' });
      }
    }
    await pool.query('DELETE FROM job_mela WHERE id=$1', [id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = app;
