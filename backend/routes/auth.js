const express = require('express');
const pool = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [email]
    );

    if (!rows.length || rows[0].password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

    res.json({ token, email });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;