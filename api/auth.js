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
  CREATE TABLE IF NOT EXISTS admins (
    email VARCHAR(255) PRIMARY KEY, password VARCHAR(255)
  )
`).then(() => {
  return pool.query(`
    INSERT INTO admins (email, password) VALUES ('admin@strataply.com', 'admin123')
    ON CONFLICT (email) DO NOTHING
  `);
}).catch(console.error);

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM admins WHERE email=$1', [email]);
    if (!rows.length || rows[0].password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    res.json({ token, email });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = app;
