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
  CREATE TABLE IF NOT EXISTS feedback (
    id VARCHAR(50) PRIMARY KEY, name TEXT, email TEXT, message TEXT, createdAt BIGINT
  )
`).catch(console.error);

app.get('/api/feedback', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM feedback ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const id = String(Date.now());
    await pool.query(
      `INSERT INTO feedback (id,name,email,message,createdAt) VALUES ($1,$2,$3,$4,$5)`,
      [id, name, email, message, Date.now()]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

app.delete('/api/feedback/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM feedback WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = app;
