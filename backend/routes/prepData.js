const express = require('express');
const pool = require('../db');
const router = express.Router();

pool.query(`
  CREATE TABLE IF NOT EXISTS prep_data (
    id VARCHAR(50) PRIMARY KEY,
    heading TEXT,
    jobType TEXT,
    content TEXT,
    contentType TEXT DEFAULT 'article',
    fileUrl TEXT,
    createdAt BIGINT
  )
`).catch(console.error);

// Progressive schema updates
async function updatePrepSchema() {
    try {
        await pool.query(`ALTER TABLE prep_data ADD COLUMN IF NOT EXISTS contentType TEXT DEFAULT 'article'`);
        await pool.query(`ALTER TABLE prep_data ADD COLUMN IF NOT EXISTS fileUrl TEXT`);
        await pool.query(`ALTER TABLE prep_data ADD COLUMN IF NOT EXISTS createdByAdminId TEXT DEFAULT 'system'`);
        await pool.query(`ALTER TABLE prep_data ADD COLUMN IF NOT EXISTS createdByAdminName TEXT DEFAULT 'System'`);
        await pool.query(`ALTER TABLE prep_data ADD COLUMN IF NOT EXISTS updatedAt BIGINT`);
    } catch (err) {
        console.error("Prep Schema Update Error:", err.message);
    }
}
updatePrepSchema();

const { authMiddleware, checkOwnership } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');

// GET all active prep data (Public)
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM prep_data ORDER BY createdAt DESC');
        res.json(rows.map(r => ({
            id: r.id,
            heading: r.heading,
            jobType: r.jobtype || r.jobType,
            content: r.content,
            contentType: r.contenttype || r.contentType || 'article',
            fileUrl: r.fileurl || r.fileUrl,
            createdAt: Number(r.createdat || r.createdAt),
            createdByAdminId: r.createdbyadminid,
            createdByAdminName: r.createdbyadminname
        })));
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin-specific view
router.get('/admin/list', authMiddleware, async (req, res) => {
    try {
      let query = 'SELECT * FROM prep_data';
      let params = [];
      if (req.user.role !== 'manager') {
        query += ' WHERE createdByAdminId = $1';
        params.push(req.user.id);
      }
      const { rows } = await pool.query(query, params);
      res.json(rows.sort((a,b) => b.createdat - a.createdat));
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { heading, jobType, content, contentType, fileUrl } = req.body;
        const id = String(Date.now());
        const { rows } = await pool.query(
            'INSERT INTO prep_data (id, heading, jobType, content, contentType, fileUrl, createdAt, createdByAdminId, createdByAdminName) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [id, heading, jobType, content, contentType || 'article', fileUrl || '', Date.now(), req.user.id, req.user.name]
        );

        await logActivity(req.user.id, req.user.name, req.user.role, 'Preparation', `Added Material: ${heading}`, id);
        req.io.emit('DATA_UPDATED', { module: 'Preparation' });

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { rows: ex } = await pool.query('SELECT * FROM prep_data WHERE id = $1', [id]);
        if (!ex.length) return res.status(404).json({ error: 'Not found' });

        if (!checkOwnership(ex[0].createdbyadminid, req.user)) {
            return res.status(403).json({ error: 'Ownership required to delete this resource' });
        }

        await pool.query('DELETE FROM prep_data WHERE id = $1', [id]);
        
        await logActivity(req.user.id, req.user.name, req.user.role, 'Preparation', `Deleted Material: ${ex[0].heading}`, id);
        req.io.emit('DATA_UPDATED', { module: 'Preparation' });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
module.exports = router;