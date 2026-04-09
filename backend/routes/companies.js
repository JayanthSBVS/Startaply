const express = require('express');
const { Pool } = require('pg');

const router = express.Router();

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_owA9tSVB4KCy@ep-restless-unit-annaio5u-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

// Initialize table
async function initDb() {
  const query = `
    CREATE TABLE IF NOT EXISTS companies (
      id VARCHAR(50) PRIMARY KEY,
      name TEXT NOT NULL,
      logo TEXT,
      color TEXT,
      industry TEXT
    )
  `;
  try {
    await pool.query(query);
    console.log('Companies table ensured');
  } catch (err) {
    console.error('Error creating companies table:', err);
  }
}

initDb();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM companies');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, logo, color, industry } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const id = String(Date.now());
    const query = `
      INSERT INTO companies (id, name, logo, color, industry)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const { rows } = await pool.query(query, [id, name, logo || '', color || '#16A34A', industry || '']);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM companies WHERE id = $1', [id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
