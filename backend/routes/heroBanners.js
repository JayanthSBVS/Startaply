const express = require('express');
const pool = require('../db');
const router = express.Router();

// ── DB INIT ──────────────────────────────────────────────
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hero_banners (
        id VARCHAR(255) PRIMARY KEY,
        image TEXT NOT NULL,
        createdAt BIGINT
      );
    `);
  } catch (err) {
    console.error('Error init hero_banners db:', err);
  }
}
initDb();

// ── ROUTES ───────────────────────────────────────────────

// GET all active banners
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM hero_banners ORDER BY createdAt DESC LIMIT 5');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST new hero banner
router.post('/', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: 'Image is required' });

    const id = String(Date.now());
    const createdAt = Date.now();

    const { rows } = await pool.query(
      `INSERT INTO hero_banners (id, image, createdAt) VALUES ($1, $2, $3) RETURNING *`,
      [id, image, createdAt]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE hero banner
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM hero_banners WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
