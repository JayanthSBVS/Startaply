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

pool.query(`
  CREATE TABLE IF NOT EXISTS prep_data (
    id VARCHAR(50) PRIMARY KEY,
    heading TEXT,
    jobType TEXT,
    content TEXT,
    createdAt BIGINT
  )
`).catch(console.error);

app.get('/api/prep-data', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM prep_data ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/prep-data', async (req, res) => {
  try {
    const { heading, jobType, content } = req.body;
    const id = String(Date.now());
    const { rows } = await pool.query(
      'INSERT INTO prep_data (id,heading,jobType,content,createdAt) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [id, heading, jobType || 'IT Jobs', content, Date.now()]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.delete('/api/prep-data/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM prep_data WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = app;
