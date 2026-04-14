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

router.post('/', async (req, res) => {
    try {
        const { name, tagline, description, photo } = req.body;
        const id = String(Date.now());
        const { rows } = await pool.query(
            'INSERT INTO testimonials (id, name, tagline, description, photo, createdAt) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, name, tagline, description, photo || '', Date.now()]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM testimonials WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;