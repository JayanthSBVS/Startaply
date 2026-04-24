const express = require('express');
const cors = require('cors');
const { getPool, getMemCache, setMemCache, clearMemCachePrefix, setEdgeCache } = require('./db');

const pool = getPool();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

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
app.get('/api/hero-banners', async (req, res) => {
  try {
    const cached = getMemCache('banners_active', 120);
    if (cached) {
      setEdgeCache(res, 60, 300);
      return res.json(cached);
    }
    const { rows } = await pool.query('SELECT * FROM hero_banners ORDER BY createdAt DESC LIMIT 5');
    setMemCache('banners_active', rows);
    setEdgeCache(res, 60, 300);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST new hero banner
app.post('/api/hero-banners', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: 'Image is required' });

    const id = String(Date.now());
    const createdAt = Date.now();

    const { rows } = await pool.query(
      `INSERT INTO hero_banners (id, image, createdAt) VALUES ($1, $2, $3) RETURNING *`,
      [id, image, createdAt]
    );
    clearMemCachePrefix('banners_');
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE hero banner
app.delete('/api/hero-banners/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM hero_banners WHERE id=$1', [req.params.id]);
    clearMemCachePrefix('banners_');
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = app;
