const express = require('express');
const cors = require('cors');
const { getPool, getMemCache, setMemCache, clearMemCachePrefix } = require('./db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'startaply_super_secret_key_123';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

let isDbInitialized = false;

async function ensureDb() {
  if (isDbInitialized) return;
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS live_ticker (
      id VARCHAR(255) PRIMARY KEY,
      text TEXT NOT NULL,
      createdat BIGINT,
      createdbyadminid TEXT
    )
  `);
  isDbInitialized = true;
}

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Auth failed' }); }
};

// GET all ticker items (public)
app.get(['/api/live-ticker', '/api/live-ticker/'], async (req, res) => {
  try {
    await ensureDb();
    const cached = getMemCache('ticker_all', 30);
    if (cached) return res.json(cached);
    const pool = getPool();
    const { rows } = await pool.query(
      'SELECT id, text, createdat AS "createdAt", createdbyadminid AS "createdByAdminId" FROM live_ticker ORDER BY createdat DESC'
    );
    setMemCache('ticker_all', rows);
    res.json(rows);
  } catch (err) {
    console.error('[GET live-ticker]', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST add ticker item (auth required)
app.post(['/api/live-ticker', '/api/live-ticker/'], authMiddleware, async (req, res) => {
  try {
    await ensureDb();
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'text is required' });
    const id = String(Date.now());
    const adminId = req.user?.id || req.user?.email || 'admin';
    const pool = getPool();
    const { rows } = await pool.query(
      'INSERT INTO live_ticker (id, text, createdat, createdbyadminid) VALUES ($1,$2,$3,$4) RETURNING id, text, createdat AS "createdAt", createdbyadminid AS "createdByAdminId"',
      [id, text.trim(), Date.now(), adminId]
    );
    clearMemCachePrefix('ticker_all');
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[POST live-ticker error]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE ticker item
app.delete(['/api/live-ticker/:id', '/api/live-ticker/:id/'], authMiddleware, async (req, res) => {
  try {
    await ensureDb();
    const pool = getPool();
    await pool.query('DELETE FROM live_ticker WHERE id=$1', [req.params.id]);
    clearMemCachePrefix('ticker_all');
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE live-ticker]', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = app;
