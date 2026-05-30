const express = require('express');
const pool = require('../db');
const router = express.Router();

pool.query(`
  CREATE TABLE IF NOT EXISTS testimonials (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT,
    tagline TEXT,
    description TEXT,
    photo TEXT,
    createdAt BIGINT
  )
`).catch(console.error);

router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM testimonials ORDER BY createdAt DESC');
        res.json(rows.map(r => ({
            id: r.id,
            name: r.name,
            tagline: r.tagline,
            description: r.description,
            photo: r.photo,
            createdAt: Number(r.createdat)
        })));
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/admin/list', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM testimonials ORDER BY createdAt DESC');
        res.json(rows.map(r => ({
            id: r.id,
            name: r.name,
            tagline: r.tagline,
            description: r.description,
            photo: r.photo,
            createdAt: Number(r.createdat)
        })));
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'startaply_super_secret_key_123';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) { res.status(401).json({ error: 'Auth failed' }); }
};

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, tagline, description, photo } = req.body;
        const id = String(Date.now());
        const { rows } = await pool.query(
            'INSERT INTO testimonials (id, name, tagline, description, photo, createdAt, createdByAdminId) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [id, name, tagline, description, photo || '', Date.now(), req.user.id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const isManager = req.user.role === 'manager';
        const { rows: ex } = await pool.query('SELECT createdByAdminId FROM testimonials WHERE id=$1', [id]);
        if (ex.length && !isManager && ex[0].createdbyadminid !== req.user.id) {
           return res.status(403).json({ error: 'Forbidden' });
        }
        await pool.query('DELETE FROM testimonials WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;