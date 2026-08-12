const express = require('express');
const cors = require('cors');
const { getPool, getMemCache, setMemCache, clearMemCachePrefix } = require('./db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'startaply_super_secret_key_123';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// In-memory fallback store for zero-downtime resilience
let inMemoryTicker = [];
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
    await pool.query(`ALTER TABLE live_ticker ADD COLUMN IF NOT EXISTS createdat BIGINT`).catch(() => {});
    await pool.query(`ALTER TABLE live_ticker ADD COLUMN IF NOT EXISTS createdbyadminid TEXT`).catch(() => {});
    await pool.query(`ALTER TABLE live_ticker ADD COLUMN IF NOT EXISTS "createdAt" BIGINT`).catch(() => {});
    await pool.query(`ALTER TABLE live_ticker ADD COLUMN IF NOT EXISTS "createdByAdminId" TEXT`).catch(() => {});
    isDbInitialized = true;
  } catch (err) {
    console.warn('[live-ticker DB init warning]', err.message);
  }
}

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { 
    res.status(401).json({ error: 'Auth failed' }); 
  }
};

// GET all ticker items (public)
app.get(['/api/live-ticker', '/api/live-ticker/', '/live-ticker'], async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    await ensureDb();
    let rows = [];
    try {
      const pool = getPool();
      const dbRes = await pool.query('SELECT * FROM live_ticker');
      rows = dbRes.rows || [];
    } catch (dbErr) {
      console.warn('[live-ticker DB fetch fallback]', dbErr.message);
      rows = inMemoryTicker;
    }

    const formatted = (rows && rows.length > 0 ? rows : inMemoryTicker).map(r => ({
      id: String(r.id || Date.now()),
      text: String(r.text || ''),
      createdAt: Number(r.createdAt || r.createdat || Date.now()),
      createdByAdminId: String(r.createdByAdminId || r.createdbyadminid || 'admin')
    })).sort((a, b) => b.createdAt - a.createdAt);

    setMemCache('ticker_all', formatted);
    return res.json(formatted);
  } catch (err) {
    console.error('[GET live-ticker error]', err);
    // Never return 500 — return fallback array
    return res.json(inMemoryTicker);
  }
});

// POST add ticker item (auth required)
app.post(['/api/live-ticker', '/api/live-ticker/', '/live-ticker'], authMiddleware, async (req, res) => {
  try {
    await ensureDb();
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'text is required' });

    const id = String(Date.now());
    const adminId = req.user?.id || req.user?.email || 'admin';
    const now = Date.now();
    const newEntry = { id, text: text.trim(), createdAt: now, createdByAdminId: adminId };

    // Push to in-memory fallback array first
    inMemoryTicker.unshift(newEntry);

    // Attempt DB persistence
    try {
      const pool = getPool();
      await pool.query(
        'INSERT INTO live_ticker (id, text, createdat, createdbyadminid) VALUES ($1,$2,$3,$4)',
        [id, text.trim(), now, adminId]
      ).catch(async () => {
        await pool.query(
          'INSERT INTO live_ticker (id, text, "createdAt", "createdByAdminId") VALUES ($1,$2,$3,$4)',
          [id, text.trim(), now, adminId]
        );
      });
    } catch (dbErr) {
      console.warn('[live-ticker DB insert fallback]', dbErr.message);
    }

    clearMemCachePrefix('ticker_all');
    return res.status(201).json(newEntry);
  } catch (err) {
    console.error('[POST live-ticker error]', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE ticker item
app.delete(['/api/live-ticker/:id', '/api/live-ticker/:id/', '/live-ticker/:id'], authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    inMemoryTicker = inMemoryTicker.filter(item => String(item.id) !== String(id));

    try {
      await ensureDb();
      const pool = getPool();
      await pool.query('DELETE FROM live_ticker WHERE id=$1', [id]);
    } catch (dbErr) {
      console.warn('[live-ticker DB delete fallback]', dbErr.message);
    }

    clearMemCachePrefix('ticker_all');
    return res.json({ success: true });
  } catch (err) {
    console.error('[DELETE live-ticker error]', err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = app;
