const express = require('express');
const pool = require('../db');
const router = express.Router();

pool.query(`
  CREATE TABLE IF NOT EXISTS feedback (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT,
    email TEXT,
    message TEXT,
    rating INTEGER DEFAULT 5,
    createdAt BIGINT
  )
`).catch(console.error);

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM feedback ORDER BY createdAt DESC');
    res.json(rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      message: r.message,
      rating: r.rating,
      createdAt: Number(r.createdat)
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, message, rating } = req.body;
    const id = String(Date.now());
    await pool.query(
      `INSERT INTO feedback (id, name, email, message, rating, createdAt) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, name, email, message, rating || 5, Date.now()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM feedback WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;