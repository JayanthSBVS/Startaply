const express = require('express');
const pool = require('../db');
const router = express.Router();

pool.query(`
  CREATE TABLE IF NOT EXISTS qnas (
    id VARCHAR(50) PRIMARY KEY,
    question TEXT,
    answer TEXT,
    category TEXT,
    createdAt BIGINT
  )
`).catch(console.error);

router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM qnas ORDER BY createdAt DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { question, answer, category } = req.body;
        const id = String(Date.now());
        const { rows } = await pool.query(
            'INSERT INTO qnas (id, question, answer, category, createdAt) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id, question, answer, category, Date.now()]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { question, answer, category } = req.body;
        const { rows } = await pool.query(
            'UPDATE qnas SET question=$1, answer=$2, category=$3 WHERE id=$4 RETURNING *',
            [question, answer, category, req.params.id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM qnas WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;