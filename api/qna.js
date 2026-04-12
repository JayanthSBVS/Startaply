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
  CREATE TABLE IF NOT EXISTS qnas (
    id VARCHAR(50) PRIMARY KEY, question TEXT, answer TEXT, category TEXT, createdAt BIGINT
  )
`).catch(console.error);

app.get('/api/qna', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM qnas ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/qna', async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    const id = String(Date.now());
    const { rows } = await pool.query(
      'INSERT INTO qnas (id,question,answer,category,createdAt) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [id, question, answer, category, Date.now()]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.delete('/api/qna/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM qnas WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = app;
