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
        createdAt BIGINT
      )
    `);
    await pool.query(`ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS tickerText TEXT`);
    await pool.query(`ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS showPopup BOOLEAN DEFAULT TRUE`);
    await pool.query(`ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS company TEXT`);
    await pool.query(`ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS registrationLink TEXT`);
    await pool.query(`ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS bannerImage TEXT`);
    await pool.query(`ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS googleMapLink TEXT`);
  } catch (err) { console.error(err.message); }
}
init();

app.get('/api/job-mela/admin/list', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM job_mela ORDER BY createdAt DESC');
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

  app.post('/api/job-mela', async (req, res) => {
    try {
      const { title, description, venue, date, time, image, tickerText, isActive, showPopup, company, registrationLink, bannerImage, googleMapLink } = req.body;
      const { rows } = await pool.query(
        `INSERT INTO job_mela (title,description,venue,date,time,image,tickerText,isActive,showPopup,company,registrationLink,bannerImage,googleMapLink,createdAt)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
        [title, description, venue, date, time, image, tickerText, isActive !== false, showPopup !== false, company, registrationLink, bannerImage, googleMapLink, Date.now()]
      );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ message: 'Server error', detail: err.message }); }
});

  app.put('/api/job-mela/:id', async (req, res) => {
    try {
      const { title, description, venue, date, time, image, tickerText, isActive, showPopup, company, registrationLink, bannerImage, googleMapLink } = req.body;
      const { rows } = await pool.query(
        `UPDATE job_mela SET title=$1,description=$2,venue=$3,date=$4,time=$5,image=$6,tickerText=$7,isActive=$8,showPopup=$9,company=$10,registrationLink=$11,bannerImage=$12,googleMapLink=$13 WHERE id=$14 RETURNING *`,
        [title, description, venue, date, time, image, tickerText, isActive, showPopup, company, registrationLink, bannerImage, googleMapLink, req.params.id]
      );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.delete('/api/job-mela/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM job_mela WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = app;
