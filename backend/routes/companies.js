const express = require('express');
const pool = require('../db');

const router = express.Router();

pool.query(`
  CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT,
    industry TEXT,
    logo TEXT,
    color TEXT,
    iconName TEXT
  )
`).catch(console.error);

const { authMiddleware, checkOwnership } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');

async function updateCompaniesSchema() {
  try {
    await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS createdByAdminId TEXT DEFAULT 'system'`);
    await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS createdByAdminName TEXT DEFAULT 'System'`);
    await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS createdAt BIGINT`);
    await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS updatedAt BIGINT`);
    
    // BACKFILL: If createdAt is null, set it to updatedAt or now
    await pool.query(`UPDATE companies SET createdAt = updatedAt WHERE createdAt IS NULL AND updatedAt IS NOT NULL`);
    await pool.query(`UPDATE companies SET createdAt = ${Date.now()} WHERE createdAt IS NULL`);
  } catch (err) {
    console.error("Companies Schema Update Error:", err.message);
  }
}
updateCompaniesSchema();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM companies');
    res.json(rows.map(r => ({
      id: r.id,
      name: r.name,
      industry: r.industry,
      logo: r.logo,
      color: r.color,
      iconName: r.iconname,
      createdByAdminId: r.createdbyadminid,
      createdByAdminName: r.createdbyadminname
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin-specific query (optional but good for consistency)
router.get('/admin/list', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM companies';
    let params = [];
    if (req.user.role !== 'manager') {
      query += ' WHERE createdByAdminId = $1';
      params.push(req.user.id);
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, logo, industry, color, iconName } = req.body;
    const id = String(Date.now());
    const now = Date.now();
    const { rows } = await pool.query(
      `INSERT INTO companies (id, name, logo, industry, color, iconName, createdByAdminId, createdByAdminName, createdAt, updatedAt) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, name, logo || '', industry || '', color || '', iconName || 'Building2', req.user.id, req.user.name, now, now]
    );

    await logActivity(req.user.id, req.user.name, req.user.role, 'Companies', `Added Company: ${name}`, id);
    req.io.emit('DATA_UPDATED', { module: 'Companies' });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: ex } = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    if (!ex.length) return res.status(404).json({ error: 'Not found' });

    if (!checkOwnership(ex[0].createdbyadminid, req.user)) {
      return res.status(403).json({ error: 'Ownership required to delete this company' });
    }

    await pool.query('DELETE FROM companies WHERE id = $1', [id]);
    
    await logActivity(req.user.id, req.user.name, req.user.role, 'Companies', `Deleted Company: ${ex[0].name}`, id);
    req.io.emit('DATA_UPDATED', { module: 'Companies' });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;