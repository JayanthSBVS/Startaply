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
        createdByAdminId TEXT
      )
    `);
    
    // Migrations
    const cols = ['tickerText', 'showPopup', 'company', 'registrationLink', 'bannerImage', 'googleMapLink', 'createdByAdminId'];
    for (const col of cols) {
      await pool.query(`ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS ${col} TEXT`);
    }
    
    // Assign existing data to Jayanth
    await pool.query(`UPDATE job_mela SET createdByAdminId = 'admin_jayanth' WHERE createdByAdminId IS NULL OR createdByAdminId = ''`);

  } catch (err) { console.error('jobMela init err:', err.message); }
}
init();

// ── AUTH MIDDLEWARE ───────────────────────────────────────────
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'strataply_super_secret_key_123';

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) { res.status(401).json({ error: 'Auth failed' }); }
};

function mapRow(r) {
  if (!r) return null;
  return {
    ...r,
    createdAt: Number(r.createdat || r.createdAt),
    isActive: r.isactive === true || r.isactive === 'true' || r.isActive === true,
    showPopup: r.showpopup === true || r.showpopup === 'true' || r.showPopup === true,
    createdByAdminId: r.createdbyadminid || r.createdByAdminId || ''
  };
}

app.get('/api/job-mela/admin/list', authMiddleware, async (req, res) => {
  try {
    const isManager = req.user.role === 'manager';
    let query = 'SELECT * FROM job_mela';
    let params = [];
    if (!isManager) {
      query += ' WHERE createdByAdminId = $1';
      params.push(req.user.id);
    }
    query += ' ORDER BY createdAt DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows.map(mapRow));
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/job-mela', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM job_mela ORDER BY createdAt DESC');
    res.json(rows.map(mapRow));
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/job-mela/active', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM job_mela WHERE isActive = true ORDER BY createdAt DESC LIMIT 1');
    res.json(mapRow(rows[0]) || null);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/job-mela', authMiddleware, async (req, res) => {
  try {
    const { title, description, venue, date, time, image, tickerText, isActive, showPopup, company, registrationLink, bannerImage, googleMapLink } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO job_mela (title,description,venue,date,time,image,tickerText,isActive,showPopup,company,registrationLink,bannerImage,googleMapLink,createdAt,createdByAdminId)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [title, description, venue, date, time, image, tickerText, isActive !== false, showPopup !== false, company, registrationLink, bannerImage, googleMapLink, Date.now(), req.user.id]
    );
    res.status(201).json(mapRow(rows[0]));
  } catch (err) { res.status(500).json({ message: 'Server error', detail: err.message }); }
});

app.put('/api/job-mela/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const isManager = req.user.role === 'manager';
    const { rows: ex } = await pool.query('SELECT createdByAdminId FROM job_mela WHERE id=$1', [id]);
    if (ex.length && !isManager && ex[0].createdbyadminid !== req.user.id) {
       return res.status(403).json({ error: 'Forbidden' });
    }

    const { title, description, venue, date, time, image, tickerText, isActive, showPopup, company, registrationLink, bannerImage, googleMapLink } = req.body;
    const { rows } = await pool.query(
      `UPDATE job_mela SET title=$1,description=$2,venue=$3,date=$4,time=$5,image=$6,tickerText=$7,isActive=$8,showPopup=$9,company=$10,registrationLink=$11,bannerImage=$12,googleMapLink=$13 
       WHERE id=$14 RETURNING *`,
      [title, description, venue, date, time, image, tickerText, isActive, showPopup, company, registrationLink, bannerImage, googleMapLink, id]
    );
    res.json(mapRow(rows[0]));
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.delete('/api/job-mela/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const isManager = req.user.role === 'manager';
    const { rows: ex } = await pool.query('SELECT createdByAdminId FROM job_mela WHERE id=$1', [id]);
    if (ex.length && !isManager && ex[0].createdbyadminid !== req.user.id) {
       return res.status(403).json({ error: 'Forbidden' });
    }
    await pool.query('DELETE FROM job_mela WHERE id=$1', [id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = app;

module.exports = app;
