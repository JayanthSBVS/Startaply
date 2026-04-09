const express = require('express');
const { Pool } = require('pg');

const router = express.Router();

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_owA9tSVB4KCy@ep-restless-unit-annaio5u-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

// Initialize table
async function initDb() {
  const query = `
    CREATE TABLE IF NOT EXISTS feedback (
      id VARCHAR(50) PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt BIGINT
    )
  `;
  try {
    await pool.query(query);
    console.log('Feedback table ensured');
  } catch (err) {
    console.error('Error creating feedback table:', err);
  }
}

initDb();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM feedback ORDER BY createdAt DESC');
    res.json(rows.map(r => ({
      ...r,
      createdAt: Number(r.createdat)
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: 'All fields are required' });

    const id = String(Date.now());
    const createdAt = Date.now();
    const query = `
      INSERT INTO feedback (id, name, email, message, createdAt)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const { rows } = await pool.query(query, [id, name, email, message, createdAt]);
    res.status(201).json({
      ...rows[0],
      createdAt: Number(rows[0].createdat)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM feedback WHERE id = $1', [id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
