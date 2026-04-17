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

async function init() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prep_data (
        id VARCHAR(50) PRIMARY KEY,
        heading TEXT,
        jobType TEXT,
        content TEXT,
        createdAt BIGINT
      )
    `);
    // Add new columns if they don't exist (safe migration)
    await pool.query(`ALTER TABLE prep_data ADD COLUMN IF NOT EXISTS contentType TEXT DEFAULT 'article'`);
    await pool.query(`ALTER TABLE prep_data ADD COLUMN IF NOT EXISTS fileUrl TEXT`);
    await pool.query(`ALTER TABLE prep_data ADD COLUMN IF NOT EXISTS question TEXT`);
    await pool.query(`ALTER TABLE prep_data ADD COLUMN IF NOT EXISTS answer TEXT`);
  } catch (err) {
    console.error('prepData init error:', err.message);
  }
}
init();

app.get('/api/prep-data/admin/list', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM prep_data ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/prep-data', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM prep_data ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/prep-data', async (req, res) => {
  try {
    const { heading, jobType, content, contentType, fileUrl, question, answer } = req.body;
    const id = String(Date.now());
    const type = contentType || 'article';
    const { rows } = await pool.query(
      `INSERT INTO prep_data (id, heading, jobType, content, contentType, fileUrl, question, answer, createdAt)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [id, heading || question || '', jobType || 'IT Jobs', content || answer || '', type, fileUrl || '', question || '', answer || content || '', Date.now()]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('prepData POST error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/prep-data/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM prep_data WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = app;
