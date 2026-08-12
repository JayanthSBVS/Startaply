const express = require('express');
const cors = require('cors');
const { getPool } = require('./db');
const jwt = require('jsonwebtoken');

const pool = getPool();
const JWT_SECRET = process.env.JWT_SECRET || 'startaply_super_secret_key_123';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

let isDbInitialized = false;

async function ensureDb() {
  if (isDbInitialized) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        issue TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        createdAt BIGINT
      )
    `);
    isDbInitialized = true;
  } catch (err) {
    console.error('[support init error]', err.message);
  }
}

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Auth failed' });
  }
};

// GET all support tickets (Admin / Executive / Manager)
app.get(['/api/support', '/api/support/'], authMiddleware, async (req, res) => {
  try {
    await ensureDb();
    const { rows } = await pool.query('SELECT * FROM support_tickets ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    console.error('[GET support error]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST submit a support ticket (Public)
app.post(['/api/support', '/api/support/'], async (req, res) => {
  try {
    await ensureDb();
    const { email, name, issue } = req.body;
    if (!email || !issue) {
      return res.status(400).json({ message: 'Email and issue are required' });
    }

    const id = String(Date.now());
    const createdAt = Date.now();

    await pool.query(
      `INSERT INTO support_tickets (id, name, email, issue, createdAt) VALUES ($1, $2, $3, $4, $5)`,
      [id, name || '', email, issue, createdAt]
    );

    res.json({ success: true, message: 'Support ticket submitted successfully.' });
  } catch (err) {
    console.error('[POST support error]', err);
    res.status(500).json({ message: 'Server error while submitting ticket', error: err.message });
  }
});

// DELETE a support ticket (Admin / Executive / Manager)
app.delete(['/api/support/:id', '/api/support/:id/'], authMiddleware, async (req, res) => {
  try {
    await ensureDb();
    await pool.query('DELETE FROM support_tickets WHERE id=$1', [req.params.id]);
    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    console.error('[DELETE support error]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = app;
