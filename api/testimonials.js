const express = require('express');
const cors = require('cors');
const { getPool, getMemCache, setMemCache, clearMemCachePrefix, setEdgeCache } = require('./db');

const pool = getPool();

const app = express();
app.use(cors());
app.use(express.json());

// Init tables
async function init() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT,
        tagline TEXT,
        description TEXT,
        photo TEXT,
        createdAt BIGINT,
        createdByAdminId TEXT
      )
    `);
    await pool.query(`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS createdByAdminId TEXT`);
  } catch (err) { console.error(err); }
}
init();

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

app.get('/api/testimonials/admin/list', authMiddleware, async (req, res) => {
  try {
    const isManager = req.user.role === 'manager';
    let query = 'SELECT * FROM testimonials';
    let params = [];
    if (!isManager) {
      query += ' WHERE createdByAdminId = $1';
      params.push(req.user.id);
    }
    query += ' ORDER BY createdAt DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/testimonials', async (req, res) => {
  try {
    const cached = getMemCache('testim_all', 120);
    if (cached) {
      setEdgeCache(res, 60, 300);
      return res.json(cached);
    }
    const { rows } = await pool.query('SELECT * FROM testimonials ORDER BY createdAt DESC');
    setMemCache('testim_all', rows);
    setEdgeCache(res, 60, 300);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/testimonials', authMiddleware, async (req, res) => {
  try {
    const { name, tagline, description, photo } = req.body;
    const id = String(Date.now());
    const { rows } = await pool.query(
      'INSERT INTO testimonials (id,name,tagline,description,photo,createdAt,createdByAdminId) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [id, name, tagline, description, photo || '', Date.now(), req.user.id]
    );
    clearMemCachePrefix('testim_');
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.delete('/api/testimonials/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const isManager = req.user.role === 'manager';
    const { rows: ex } = await pool.query('SELECT createdByAdminId FROM testimonials WHERE id=$1', [id]);
    if (ex.length && !isManager && ex[0].createdbyadminid !== req.user.id) {
       return res.status(403).json({ error: 'Forbidden' });
    }
    await pool.query('DELETE FROM testimonials WHERE id=$1', [id]);
    clearMemCachePrefix('testim_');
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = app;
