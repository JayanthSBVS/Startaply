const express = require('express');
const { Pool } = require('pg');

const router = express.Router();

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_owA9tSVB4KCy@ep-restless-unit-annaio5u-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

// Admin Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    if (admin.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // In a real app, generate a JWT. For dummy testing, standard token:
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    res.json({ message: 'Login successful', token, email: admin.email });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
