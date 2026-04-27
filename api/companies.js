const express = require('express');
const cors = require('cors');
const { getPool, getMemCache, setMemCache, clearMemCachePrefix, setEdgeCache } = require('./db');

const { recordActivity } = require('./_shared');

const pool = getPool();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Init tables (guarded to prevent re-run on warm invocations)
let companiesInitialized = false;
async function init() {
  if (companiesInitialized) return;
  companiesInitialized = true;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT NOT NULL,
        logo TEXT,
        website TEXT,
        location TEXT,
        industry TEXT,
        companyType TEXT,
        description TEXT,
        createdAt BIGINT,
        createdByAdminId TEXT
      )
    `);

    // Safe migrations — idempotent
    const cols = ['createdByAdminId', 'industry', 'companyType', 'website', 'location', 'description'];
    for (const col of cols) {
      await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS ${col} TEXT`);
    }
    await pool.query(`UPDATE companies SET createdByAdminId = 'admin_jayanth' WHERE createdByAdminId IS NULL OR createdByAdminId = ''`);

    // Performance index
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_companies_createdat ON companies(createdat DESC)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_companies_adminid ON companies(createdbyadminid)`);

  } catch (err) {
    console.error('Companies init error:', err.message);
    companiesInitialized = false; // Allow retry
  }
}
init();

// ── AUTH MIDDLEWARE ───────────────────────────────────────────
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'strataply_super_secret_key_123';

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) { res.status(401).json({ error: 'Auth failed' }); }
};

function mapRow(r) {
  if (!r) return null;
  return {
    ...r,
    createdAt: Number(r.createdat || r.createdAt || 0),
    createdByAdminId: r.createdbyadminid || r.createdByAdminId || '',
    industry: r.industry || '',
    companyType: r.companytype || r.companyType || '',
    location: r.location || '',
    website: r.website || '',
    description: r.description || ''
  };
}

// ── ROUTES ────────────────────────────────────────────────────

// Admin list (filtered by ownership for non-managers)
app.get('/api/companies/admin/list', authMiddleware, async (req, res) => {
  try {
    const isManager = req.user.role === 'manager';
    let query = 'SELECT * FROM companies';
    let params = [];
    if (!isManager) {
      query += ' WHERE createdByAdminId = $1';
      params.push(req.user.id);
    }
    query += ' ORDER BY createdat DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows.map(mapRow));
  } catch (err) {
    console.error('GET /api/companies/admin/list:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public list paginated
app.get('/api/companies', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const cacheKey = `comp_${page}_${limit}`;
    const cached = getMemCache(cacheKey, 60);
    if (cached) {
      setEdgeCache(res, 60, 300);
      return res.json(cached);
    }

    // Only select required fields (omit full description to save bandwidth if paginating, though here we just do all for simplicity)
    const { rows } = await pool.query('SELECT id, name, logo, website, location, industry, companyType, createdAt FROM companies ORDER BY createdat DESC LIMIT $1 OFFSET $2', [limit, offset]);
    
    const result = rows.map(mapRow);
    setMemCache(cacheKey, result);
    setEdgeCache(res, 60, 300);
    res.json(result);
  } catch (err) {
    console.error('GET /api/companies:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create company
app.post('/api/companies', authMiddleware, async (req, res) => {
  try {
    const { name, logo, website, location, description, industry, companyType } = req.body;
    if (!name) return res.status(400).json({ message: 'Company name is required' });
    const id = String(Date.now());
    const { rows } = await pool.query(
      `INSERT INTO companies (id, name, logo, website, location, description, industry, companyType, createdAt, createdByAdminId)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, name, logo || '', website || '', location || '', description || '', industry || '', companyType || '', Date.now(), req.user.id]
    );
    clearMemCachePrefix('comp_');
    recordActivity(pool, req.user, 'Companies', `Registered partner company: ${name}`, id).catch(() => {});
    res.status(201).json(mapRow(rows[0]));
  } catch (err) {
    console.error('POST /api/companies:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update company
app.put('/api/companies/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const isManager = req.user.role === 'manager';
    const { rows: ex } = await pool.query('SELECT * FROM companies WHERE id=$1', [id]);
    if (!ex.length) return res.status(404).json({ error: 'Not found' });
    if (!isManager && ex[0].createdbyadminid !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, logo, website, location, description, industry, companyType } = req.body;
    const { rows } = await pool.query(
      `UPDATE companies SET name=$1, logo=$2, website=$3, location=$4, description=$5, industry=$6, companyType=$7 WHERE id=$8 RETURNING *`,
      [name || ex[0].name, logo || '', website || '', location || '', description || '', industry || '', companyType || '', id]
    );
    clearMemCachePrefix('comp_');
    recordActivity(pool, req.user, 'Companies', `Updated company: ${name}`, id).catch(() => {});
    res.json(mapRow(rows[0]));
  } catch (err) {
    console.error('PUT /api/companies/:id:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete company
app.delete('/api/companies/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const isManager = req.user.role === 'manager';
    const { rows: ex } = await pool.query('SELECT * FROM companies WHERE id=$1', [id]);
    if (ex.length && !isManager && ex[0].createdbyadminid !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await pool.query('DELETE FROM companies WHERE id=$1', [id]);
    clearMemCachePrefix('comp_');
    recordActivity(pool, req.user, 'Companies', `Removed company: ${ex[0]?.name || id}`, id).catch(() => {});
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /api/companies/:id:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = app;
