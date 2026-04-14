const express = require('express');
const pool = require('../db');

const router = express.Router();

async function initJobMelaDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_mela (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        venue TEXT,
        date TEXT,
        time TEXT,
        image TEXT,
        tickerText TEXT,
        isActive BOOLEAN DEFAULT TRUE,
        showPopup BOOLEAN DEFAULT TRUE,
        registration_link TEXT,
        createdAt BIGINT
      )
    `);
    await pool.query('ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS tickerText TEXT');
    await pool.query('ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS showPopup BOOLEAN DEFAULT TRUE');
    await pool.query('ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS registration_link TEXT');
    console.log('Job Mela table ensured');
  } catch (err) {
    console.error('Job Mela table init error:', err);
  }
}

initJobMelaDb();

// GET all active job melas
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM job_mela ORDER BY createdAt DESC');
    res.json(rows.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        venue: r.venue,
        date: r.date,
        time: r.time,
        image: r.image,
        tickerText: r.tickertext,
        isActive: r.isactive,
        showPopup: r.showpopup,
        registrationLink: r.registration_link,
        createdAt: Number(r.createdat)
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET active mela for popup/ticker
router.get('/active', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM job_mela WHERE isActive = true ORDER BY createdAt DESC LIMIT 1');
    if (!rows[0]) return res.json(null);
    const r = rows[0];
    res.json({
        id: r.id,
        title: r.title,
        description: r.description,
        venue: r.venue,
        date: r.date,
        time: r.time,
        image: r.image,
        tickerText: r.tickertext,
        isActive: r.isactive,
        showPopup: r.showpopup,
        registrationLink: r.registration_link,
        createdAt: Number(r.createdat)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create job mela
router.post('/', async (req, res) => {
  try {
    const { title, description, venue, date, time, image, tickerText, isActive, showPopup, registrationLink } = req.body;
    const createdAt = Date.now();
    const { rows } = await pool.query(
      `INSERT INTO job_mela (title, description, venue, date, time, image, tickerText, isActive, showPopup, registration_link, createdAt)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [title, description, venue, date, time, image, tickerText, isActive !== false, showPopup !== false, registrationLink || '', createdAt]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /job-mela error:', err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

// PUT update job mela
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, venue, date, time, image, tickerText, isActive, showPopup, registrationLink } = req.body;
    const { rows } = await pool.query(
      `UPDATE job_mela SET title=$1, description=$2, venue=$3, date=$4, time=$5, image=$6, tickerText=$7, isActive=$8, showPopup=$9, registration_link=$10
       WHERE id=$11 RETURNING *`,
      [title, description, venue, date, time, image, tickerText, isActive, showPopup, registrationLink, id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE job mela
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM job_mela WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
