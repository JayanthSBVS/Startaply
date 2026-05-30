const express = require('express');
const pool = require('../db');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');

// ── DB INIT ──────────────────────────────────────────────
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS live_ticker (
        id VARCHAR(255) PRIMARY KEY,
        text TEXT NOT NULL,
        createdAt BIGINT
      );
    `);
  } catch (err) {
    console.error('Error init live_ticker db:', err);
  }
}
initDb();

// ── ROUTES ───────────────────────────────────────────────

// GET all ticker items
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM live_ticker ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST new ticker item
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const id = String(Date.now());
    const createdAt = Date.now();

    const { rows } = await pool.query(
      `INSERT INTO live_ticker (id, text, createdAt) VALUES ($1, $2, $3) RETURNING *`,
      [id, text, createdAt]
    );

    await logActivity(req.user.id, req.user.name, req.user.role, 'Live Ticker', 'Added Ticker Item', id);
    if (req.io) req.io.emit('DATA_UPDATED', { module: 'Live Ticker' });

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE ticker item
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM live_ticker WHERE id=$1', [req.params.id]);
    await logActivity(req.user.id, req.user.name, req.user.role, 'Live Ticker', 'Deleted Ticker Item', req.params.id);
    if (req.io) req.io.emit('DATA_UPDATED', { module: 'Live Ticker' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
