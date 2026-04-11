const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM companies');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, logo, industry, color } = req.body;
  const id = String(Date.now());
  const { rows } = await pool.query(
    `INSERT INTO companies (id, name, logo) VALUES ($1,$2,$3) RETURNING *`,
    [id, name, logo || '']
  );
  res.json(rows[0]);
});

// DELETE company
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM companies WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;