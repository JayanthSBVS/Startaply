const express = require('express');
const pool = require('../db');

const router = express.Router();

pool.query(`
  CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT,
    industry TEXT,
    logo TEXT,
    color TEXT,
    iconName TEXT
  )
`).catch(console.error);

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM companies');
    res.json(rows.map(r => ({
      id: r.id,
      name: r.name,
      industry: r.industry,
      logo: r.logo,
      color: r.color,
      iconName: r.iconname
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, logo, industry, color, iconName } = req.body;
    const id = String(Date.now());
    const { rows } = await pool.query(
      `INSERT INTO companies (id, name, logo, industry, color, iconName) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [id, name, logo || '', industry || '', color || '', iconName || 'Building2']
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM companies WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;