const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const { recordActivity } = require('./_shared');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const app = express();
app.use(cors());
app.use(express.json());

async function init() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prep_data (
        id VARCHAR(50) PRIMARY KEY,
        heading TEXT,
        jobType TEXT,
        content TEXT,
        createdAt BIGINT,
        contentType TEXT DEFAULT 'article',
        fileUrl TEXT,
        question TEXT,
        answer TEXT,
        createdByAdminId TEXT
      )
    `);
    
    // Migrations
    const cols = ['contentType', 'fileUrl', 'question', 'answer', 'createdByAdminId'];
    for (const col of cols) {
      await pool.query(`ALTER TABLE prep_data ADD COLUMN IF NOT EXISTS ${col} TEXT`);
    }

    // Assign existing data to Jayanth
    await pool.query(`UPDATE prep_data SET createdByAdminId = 'admin_jayanth' WHERE createdByAdminId IS NULL OR createdByAdminId = ''`);

  } catch (err) {
    console.error('prepData init error:', err.message);
  }
}
init();

// ── AUTH MIDDLEWARE ───────────────────────────────────────────
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'strataply_super_secret_key_123';

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) { res.status(401).json({ error: 'Auth failed' }); }
};

function mapRow(r) {
  if (!r) return null;
  return {
    ...r,
    createdAt: Number(r.createdat || r.createdAt),
    contentType: r.contenttype || r.contentType || 'article',
    fileUrl: r.fileurl || r.fileUrl || '',
    jobType: r.jobtype || r.jobType || '',
    createdByAdminId: r.createdbyadminid || r.createdByAdminId || ''
  };
}

app.get('/api/prep-data/admin/list', authMiddleware, async (req, res) => {
  try {
    const isManager = req.user.role === 'manager';
    let query = 'SELECT * FROM prep_data';
    let params = [];
    if (!isManager) {
      query += ' WHERE createdByAdminId = $1';
      params.push(req.user.id);
    }
    query += ' ORDER BY createdAt DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows.map(mapRow));
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/prep-data', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM prep_data ORDER BY createdAt DESC');
    res.json(rows.map(mapRow));
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/prep-data', authMiddleware, async (req, res) => {
  try {
    const { heading, jobType, content, contentType, fileUrl, question, answer } = req.body;
    const id = String(Date.now());
    const type = contentType || 'article';
    const { rows } = await pool.query(
      `INSERT INTO prep_data (id, heading, jobType, content, contentType, fileUrl, question, answer, createdAt, createdByAdminId)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, heading || question || '', jobType || 'IT Jobs', content || answer || '', type, fileUrl || '', question || '', answer || content || '', Date.now(), req.user.id]
    );
    await recordActivity(pool, req.user, 'Preparation', `Added prep material: ${heading || 'New Content'}`, id);
    res.json(mapRow(rows[0]));
  } catch (err) {
    console.error('prepData POST error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/prep-data/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const isManager = req.user.role === 'manager';
    const { rows: ex } = await pool.query('SELECT createdByAdminId FROM prep_data WHERE id=$1', [id]);
    if (ex.length && !isManager && ex[0].createdbyadminid !== req.user.id) {
       return res.status(403).json({ error: 'Forbidden' });
    }
    await pool.query('DELETE FROM prep_data WHERE id=$1', [id]);
    await recordActivity(pool, req.user, 'Preparation', `Deleted prep material ID: ${id}`, id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = app;
