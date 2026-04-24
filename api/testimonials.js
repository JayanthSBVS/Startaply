const express = require('express');
const cors = require('cors');
const { getPool, getMemCache, setMemCache, clearMemCachePrefix, setEdgeCache } = require('./db');

const pool = getPool();

const app = express();
app.use(cors());
app.use(express.json());

pool.query(`
  CREATE TABLE IF NOT EXISTS testimonials (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT,
    tagline TEXT,
    description TEXT,
    photo TEXT,
    createdAt BIGINT
  )
`).catch(console.error);

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

app.post('/api/testimonials', async (req, res) => {
  try {
    const { name, tagline, description, photo } = req.body;
    const id = String(Date.now());
    const { rows } = await pool.query(
      'INSERT INTO testimonials (id,name,tagline,description,photo,createdAt) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [id, name, tagline, description, photo || '', Date.now()]
    );
    clearMemCachePrefix('testim_');
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.delete('/api/testimonials/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM testimonials WHERE id=$1', [req.params.id]);
    clearMemCachePrefix('testim_');
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = app;
