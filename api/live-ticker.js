const express = require('express');
const cors = require('cors');
const { getPool, getMemCache, setMemCache, clearMemCachePrefix } = require('./db');
const jwt = require('jsonwebtoken');

const pool = getPool();
const JWT_SECRET = process.env.JWT_SECRET || 'startaply_super_secret_key_123';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

async function init() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS live_ticker (
        id VARCHAR(50) PRIMARY KEY,
        text TEXT NOT NULL,
        createdAt BIGINT,
        createdByAdminId TEXT
      )
    `);
  } catch (err) { console.error('[live-ticker init]', err.message); }
}
init();

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Auth failed' }); }
};

// GET all ticker items (public)
app.get('/api/live-ticker', async (req, res) => {
  try {
    const cached = getMemCache('ticker_all', 30);
    if (cached) return res.json(cached);
    const { rows } = await pool.query('SELECT * FROM live_ticker ORDER BY createdAt DESC');
    setMemCache('ticker_all', rows);
    res.json(rows);
  } catch (err) {
    console.error('[GET live-ticker]', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST add ticker item (auth required)
app.post('/api/live-ticker', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'text is required' });
    const id = String(Date.now());
    const { rows } = await pool.query(
      'INSERT INTO live_ticker (id, text, createdAt, createdByAdminId) VALUES ($1,$2,$3,$4) RETURNING *',
      [id, text.trim(), Date.now(), req.user.id]
    );
    clearMemCachePrefix('ticker_all');
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[POST live-ticker]', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE ticker item
app.delete('/api/live-ticker/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM live_ticker WHERE id=$1', [req.params.id]);
    clearMemCachePrefix('ticker_all');
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE live-ticker]', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = app;
