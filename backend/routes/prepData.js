const express = require('express');
const pool = require('../db');
const router = express.Router();

pool.query(`
  CREATE TABLE IF NOT EXISTS prep_data (
    id VARCHAR(50) PRIMARY KEY,
    heading TEXT,
    jobType TEXT,
    content TEXT,
    createdAt BIGINT
  )
`).catch(console.error);

router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM prep_data ORDER BY createdAt DESC');
        res.json(rows.map(r => ({
            id: r.id,
            heading: r.heading,
            jobType: r.jobtype || r.jobType,
            content: r.content,
            createdAt: Number(r.createdat || r.createdAt)
        })));
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { heading, jobType, content } = req.body;
        const id = String(Date.now());
        const { rows } = await pool.query(
            'INSERT INTO prep_data (id, heading, jobType, content, createdAt) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id, heading, jobType, content, Date.now()]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM prep_data WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;