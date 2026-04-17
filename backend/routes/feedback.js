const express = require('express');
const pool = require('../db');
const router = express.Router();

pool.query(`
  CREATE TABLE IF NOT EXISTS feedback (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT,
    email TEXT,
    message TEXT,
    rating INTEGER DEFAULT 5,
    createdAt BIGINT
  )
`).catch(console.error);

const { authMiddleware, managerMiddleware } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');

async function updateFeedbackSchema() {
  try {
    await pool.query(`ALTER TABLE feedback ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'`);
    await pool.query(`ALTER TABLE feedback ADD COLUMN IF NOT EXISTS updatedAt BIGINT`);
  } catch (err) {
    console.error("Feedback Schema Update Error:", err.message);
  }
}
updateFeedbackSchema();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM feedback ORDER BY createdAt DESC');
    res.json(rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      message: r.message,
      rating: r.rating,
      status: r.status,
      createdAt: Number(r.createdat),
      updatedAt: Number(r.updatedat)
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, message, rating } = req.body;
    const id = String(Date.now());
    await pool.query(
      `INSERT INTO feedback (id, name, email, message, rating, createdAt) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, name, email, message, rating || 5, Date.now()]
    );
    
    // Notify manager of new feedback
    req.io.emit('DATA_UPDATED', { module: 'Feedback' });
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update feedback status (Manager only)
router.put('/:id/status', authMiddleware, managerMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.query('UPDATE feedback SET status = $1, updatedAt = $2 WHERE id = $3', [status, Date.now(), id]);
        
        await logActivity(req.user.id, req.user.name, req.user.role, 'Feedback', `Updated Feedback Status: ${status}`, id);
        req.io.emit('DATA_UPDATED', { module: 'Feedback' });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM feedback WHERE id = $1', [req.params.id]);
    
    await logActivity(req.user.id, req.user.name, req.user.role, 'Feedback', `Deleted Feedback`, req.params.id);
    req.io.emit('DATA_UPDATED', { module: 'Feedback' });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;