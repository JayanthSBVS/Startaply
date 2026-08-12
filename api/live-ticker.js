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
  try {
    const pool = getPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS live_ticker (
        id VARCHAR(255) PRIMARY KEY,
        text TEXT NOT NULL,
        createdAt BIGINT,
        createdByAdminId TEXT
      )
    `);
    // Safe column migrations for both uppercase and lowercase column variants
    await pool.query(`ALTER TABLE live_ticker ADD COLUMN IF NOT EXISTS createdat BIGINT`).catch(() => {});
    await pool.query(`ALTER TABLE live_ticker ADD COLUMN IF NOT EXISTS createdbyadminid TEXT`).catch(() => {});
    await pool.query(`ALTER TABLE live_ticker ADD COLUMN IF NOT EXISTS "createdAt" BIGINT`).catch(() => {});
    await pool.query(`ALTER TABLE live_ticker ADD COLUMN IF NOT EXISTS "createdByAdminId" TEXT`).catch(() => {});
    isDbInitialized = true;
  } catch (err) {
    console.error('[live-ticker init warning]', err.message);
  }
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

    let rows = [];
    try {
      const dbRes = await pool.query('SELECT * FROM live_ticker');
      rows = dbRes.rows;
    } catch (e1) {
      rows = [];
    }

    const formatted = rows.map(r => ({
      id: String(r.id),
      text: String(r.text || ''),
      createdAt: Number(r.createdAt || r.createdat || Date.now()),
      createdByAdminId: String(r.createdByAdminId || r.createdbyadminid || 'admin')
    })).sort((a, b) => b.createdAt - a.createdAt);

    setMemCache('ticker_all', formatted);
    res.json(formatted);
  } catch (err) {
    console.error('[GET live-ticker error]', err);
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
    const now = Date.now();
    const pool = getPool();

    let insertedRow = null;
    try {
      const { rows } = await pool.query(
        'INSERT INTO live_ticker (id, text, createdat, createdbyadminid) VALUES ($1,$2,$3,$4) RETURNING *',
        [id, text.trim(), now, adminId]
      );
      insertedRow = rows[0];
    } catch (e1) {
      try {
        const { rows } = await pool.query(
          'INSERT INTO live_ticker (id, text, "createdAt", "createdByAdminId") VALUES ($1,$2,$3,$4) RETURNING *',
          [id, text.trim(), now, adminId]
        );
        insertedRow = rows[0];
      } catch (e2) {
        const { rows } = await pool.query(
          'INSERT INTO live_ticker (id, text) VALUES ($1,$2) RETURNING *',
          [id, text.trim()]
        );
        insertedRow = rows[0];
      }
    }

    const formatted = {
      id: String(insertedRow.id),
      text: String(insertedRow.text),
      createdAt: Number(insertedRow.createdAt || insertedRow.createdat || now),
      createdByAdminId: String(insertedRow.createdByAdminId || insertedRow.createdbyadminid || adminId)
    };

    clearMemCachePrefix('ticker_all');
    res.status(201).json(formatted);
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
    console.error('[DELETE live-ticker error]', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = app;
