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
    await pool.query('ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS company TEXT');
    await pool.query('ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS google_map_link TEXT');
    await pool.query('ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS createdByAdminId TEXT DEFAULT \'system\'');
    await pool.query('ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS createdByAdminName TEXT DEFAULT \'System\'');
    await pool.query('ALTER TABLE job_mela ADD COLUMN IF NOT EXISTS updatedAt BIGINT');
    console.log('Job Mela table ensured');
    console.log('Job Mela table ensured');
  } catch (err) {
    console.error('Job Mela table init error:', err);
  }
}

initJobMelaDb();

const { authMiddleware, checkOwnership } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');

// GET all active job melas (Public)
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
        bannerImage: r.image,
        tickerText: r.tickertext,
        isActive: r.isactive,
        showPopup: r.showpopup,
        registrationLink: r.registration_link,
        company: r.company,
        googleMapLink: r.google_map_link,
        createdAt: Number(r.createdat),
        createdByAdminId: r.createdbyadminid,
        createdByAdminName: r.createdbyadminname
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin-specific view
router.get('/admin/list', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM job_mela';
    let params = [];
    if (req.user.role !== 'manager') {
      query += ' WHERE createdByAdminId = $1';
      params.push(req.user.id);
    }
    const { rows } = await pool.query(query, params);
    res.json(rows.sort((a,b) => b.createdat - a.createdat));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
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
        bannerImage: r.image,
        tickerText: r.tickertext,
        isActive: r.isactive,
        showPopup: r.showpopup,
        registrationLink: r.registration_link,
        company: r.company,
        googleMapLink: r.google_map_link,
        createdAt: Number(r.createdat),
        createdByAdminId: r.createdbyadminid,
        createdByAdminName: r.createdbyadminname
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create job mela
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, venue, date, time, image, bannerImage, tickerText, isActive, showPopup, registrationLink, company, googleMapLink } = req.body;
    const createdAt = Date.now();
    const finalImage = bannerImage || image || '';
    const { rows } = await pool.query(
      `INSERT INTO job_mela (title, description, venue, date, time, image, tickerText, isActive, showPopup, registration_link, company, google_map_link, createdAt, createdByAdminId, createdByAdminName)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [title, description, venue, date, time, finalImage, tickerText || '', isActive !== false, showPopup !== false, registrationLink || '', company || '', googleMapLink || '', createdAt, req.user.id, req.user.name]
    );

    await logActivity(req.user.id, req.user.name, req.user.role, 'Job Mela', `Created Event: ${title}`, rows[0].id);
    req.io.emit('DATA_UPDATED', { module: 'Job Mela' });

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update job mela
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: ex } = await pool.query('SELECT * FROM job_mela WHERE id=$1', [id]);
    if (!ex.length) return res.status(404).json({ message: 'Not found' });

    if (!checkOwnership(ex[0].createdbyadminid, req.user)) {
      return res.status(403).json({ error: 'Ownership required to edit this event' });
    }

    const { title, description, venue, date, time, image, bannerImage, tickerText, isActive, showPopup, registrationLink, company, googleMapLink } = req.body;
    const finalImage = bannerImage || image || '';
    const { rows } = await pool.query(
      `UPDATE job_mela SET title=$1, description=$2, venue=$3, date=$4, time=$5, image=$6, tickerText=$7, isActive=$8, showPopup=$9, registration_link=$10, company=$11, google_map_link=$12, updatedAt=$13
       WHERE id=$14 RETURNING *`,
      [title, description, venue, date, time, finalImage, tickerText || '', isActive, showPopup, registrationLink, company, googleMapLink, Date.now(), id]
    );

    await logActivity(req.user.id, req.user.name, req.user.role, 'Job Mela', `Updated Event: ${title}`, id);
    req.io.emit('DATA_UPDATED', { module: 'Job Mela' });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE job mela
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: ex } = await pool.query('SELECT * FROM job_mela WHERE id=$1', [id]);
    if (!ex.length) return res.status(404).json({ message: 'Not found' });

    if (!checkOwnership(ex[0].createdbyadminid, req.user)) {
      return res.status(403).json({ error: 'Ownership required to delete this event' });
    }

    await pool.query('DELETE FROM job_mela WHERE id = $1', [id]);
    
    await logActivity(req.user.id, req.user.name, req.user.role, 'Job Mela', `Deleted Event: ${ex[0].title}`, id);
    req.io.emit('DATA_UPDATED', { module: 'Job Mela' });

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
module.exports = router;
