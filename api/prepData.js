const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const app = express();
app.use(cors());
app.use(express.json());

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'strataply_super_secret_key_123';

// ── MIDDLEWARE ───────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) { res.status(401).json({ error: 'Auth failed' }); }
};

async function init() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prep_data (
        id VARCHAR(50) PRIMARY KEY,
        heading TEXT,
        jobType TEXT,
        content TEXT,
        createdAt BIGINT,
        createdByAdminId TEXT,
        createdByAdminName TEXT
      )
    `);
    await pool.query(`ALTER TABLE prep_data ADD COLUMN IF NOT EXISTS createdByAdminId TEXT`);
    await pool.query(`ALTER TABLE prep_data ADD COLUMN IF NOT EXISTS createdByAdminName TEXT`);
    await pool.query(`ALTER TABLE prep_data ADD COLUMN IF NOT EXISTS contentType TEXT DEFAULT 'article'`);
    await pool.query(`ALTER TABLE prep_data ADD COLUMN IF NOT EXISTS fileUrl TEXT`);
    await pool.query(`ALTER TABLE prep_data ADD COLUMN IF NOT EXISTS question TEXT`);
    await pool.query(`ALTER TABLE prep_data ADD COLUMN IF NOT EXISTS answer TEXT`);
  } catch (err) {
    console.error('prepData init error:', err.message);
  }
}
init();

app.get('/api/prep-data/admin/list', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM prep_data';
    let params = [];
    if (req.user.role === 'admin') {
      query += ' WHERE createdByAdminId = $1';
      params.push(req.user.id);
    }
    query += ' ORDER BY createdAt DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/prep-data', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM prep_data ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/prep-data', authMiddleware, async (req, res) => {
  try {
    const { heading, jobType, content, contentType, fileUrl, question, answer } = req.body;
    const id = String(Date.now());
    const type = contentType || 'article';
    const { rows } = await pool.query(
      `INSERT INTO prep_data (id, heading, jobType, content, contentType, fileUrl, question, answer, createdAt, createdByAdminId, createdByAdminName)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [id, heading || question || '', jobType || 'IT Jobs', content || answer || '', type, fileUrl || '', question || '', answer || content || '', Date.now(), req.user.id, req.user.name]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('prepData POST error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/prep-data/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role === 'admin') {
      const { rows } = await pool.query('SELECT createdByAdminId FROM prep_data WHERE id=$1', [id]);
      if (rows.length && rows[0].createdbyadminid !== req.user.id) {
        return res.status(403).json({ error: 'Permission denied' });
      }
    }
    await pool.query('DELETE FROM prep_data WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = app;
