const express = require('express');
const cors = require('cors');
const { getPool, getMemCache, setMemCache, clearMemCachePrefix, setEdgeCache } = require('./db');

const { recordActivity } = require('./_shared');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary if URL is provided
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true
  });
}

/**
 * Uploads an image to Cloudinary if configured, otherwise returns original.
 * @param {string} fileStr Base64 or URL
 * @param {string} folder Folder name
 * @returns {Promise<string>} Uploaded URL or original string
 */
async function uploadToCloudinary(fileStr, folder = 'companies') {
  if (!fileStr || !fileStr.startsWith('data:') || !process.env.CLOUDINARY_URL) {
    return fileStr;
  }
  try {
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: `strataply/${folder}`,
      resource_type: 'auto'
    });
    return uploadResponse.secure_url;
  } catch (err) {
    console.error('[Cloudinary Upload Error]', err.message);
    return fileStr; // Fallback to original
  }
}

const pool = getPool();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Init tables (blocking middleware to prevent race conditions on cold starts)
let initPromise = null;
async function init() {
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      // 1. Ensure companies table exists
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

      // 2. Safely ensure all columns exist (idempotent)
      const compCols = ['createdByAdminId', 'industry', 'companyType', 'website', 'location', 'description'];
      for (const col of compCols) {
        await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS ${col.toLowerCase()} TEXT`);
      }

      // 3. Performance indexes for companies
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_companies_createdat ON companies(createdat DESC)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_companies_adminid ON companies(createdbyadminid)`);

      // 4. CRITICAL: Ensure jobs table exists (minimal schema) so relational queries don't crash
      await pool.query(`
        CREATE TABLE IF NOT EXISTS jobs (
          id VARCHAR(50) PRIMARY KEY,
          title TEXT NOT NULL,
          company TEXT,
          isVisible BOOLEAN DEFAULT true
        )
      `);

      // 5. Ensure companyid column exists in jobs
      await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS companyid TEXT`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_companyid ON jobs(companyid)`);
      
      console.log('Companies API Initialized Successfully');
      return true;
    } catch (err) {
      console.error('CRITICAL: Companies init failure:', err.message);
      initPromise = null; // Allow retry on next request
      throw err;
    }
  })();
  
  return initPromise;
}

// Middleware to block until DB is ready
const ensureInit = async (req, res, next) => {
  try {
    await init();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database initialization failed', details: err.message });
  }
};

app.use(ensureInit);

// ── AUTH MIDDLEWARE ───────────────────────────────────────────
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'strataply_super_secret_key_123';

const normalizeRole = (r) => (!r || r === 'admin') ? 'executive' : r;

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    decoded.role = normalizeRole(decoded.role);
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

// Admin list (filtered by ownership for executives; managers + op-managers see all)
app.get('/api/companies/admin/list', authMiddleware, async (req, res) => {
  try {
    const role      = req.user.role;
    const isManager = role === 'manager';
    const isOpMgr   = role === 'operational_manager';
    let query = 'SELECT * FROM companies';
    let params = [];
    if (!isManager && !isOpMgr) {
      query += ' WHERE createdByAdminId = $1';
      params.push(req.user.id);
    }
    query += ' ORDER BY createdat DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows.map(r => ({ ...mapRow(r), isOwner: r.createdbyadminid === req.user.id })));
  } catch (err) {
    console.error('GET /api/companies/admin/list:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public list paginated
app.get('/api/companies', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const cacheKey = `comp_${page}_${limit}`;
    const cached = getMemCache(cacheKey, 10); // 10s memory cache
    if (cached) {
      setEdgeCache(res, 1, 30); // 1s max-age, 30s stale-while-revalidate
      return res.json(cached);
    }

    // Only select required fields
    const { rows } = await pool.query('SELECT id, name, logo, website, location, industry, companyType, createdAt FROM companies ORDER BY createdat DESC LIMIT $1 OFFSET $2', [limit, offset]);
    
    const result = rows.map(mapRow);
    setMemCache(cacheKey, result);
    setEdgeCache(res, 1, 30);
    res.json(result);
  } catch (err) {
    console.error('GET /api/companies:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single company profile
app.get('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `comp_prof_${id}`;
    const cached = getMemCache(cacheKey, 300);
    if (cached) {
      setEdgeCache(res, 300, 600);
      return res.json(cached);
    }
    const { rows } = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Company not found' });
    const result = mapRow(rows[0]);
    setMemCache(cacheKey, result);
    setEdgeCache(res, 300, 600);
    res.json(result);
  } catch (err) {
    console.error('GET /api/companies/:id:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get jobs for a specific company
app.get('/api/companies/:id/jobs', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `comp_jobs_${id}`;
    const cached = getMemCache(cacheKey, 30); // Short cache for job listings
    if (cached) {
      setEdgeCache(res, 30, 60);
      return res.json(cached);
    }
    // Match by companyid OR by company name (legacy)
    const { rows: companyRows } = await pool.query('SELECT name FROM companies WHERE id = $1', [id]);
    const companyName = companyRows.length ? companyRows[0].name : '';
    
    const { rows } = await pool.query(
      `SELECT id, createdat, updatedat, title, subtitle, description, company, companylogo, location, workmode, salary, type, category, isvisible, companyid 
       FROM jobs 
       WHERE (companyid = $1 OR company = $2) AND isvisible = true
       ORDER BY createdat DESC`,
      [id, companyName]
    );
    
    // Use the existing mapRow logic if available via require, or just return as is
    // Since this is api/companies.js, we don't have easy access to jobs.js mapRow without restructuring
    // But we can do basic mapping here
    const result = rows.map(r => ({
      ...r,
      createdAt: Number(r.createdat || r.createdAt),
      updatedAt: Number(r.updatedat || r.updatedAt),
      isVisible: r.isvisible === true || r.isvisible === 'true'
    }));
    
    setMemCache(cacheKey, result);
    setEdgeCache(res, 30, 60);
    res.json(result);
  } catch (err) {
    console.error('GET /api/companies/:id/jobs:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create company
app.post('/api/companies', authMiddleware, async (req, res) => {
  try {
    const { name, logo, website, location, description, industry, companyType } = req.body;
    if (!name) return res.status(400).json({ message: 'Company name is required' });
    const id = String(Date.now());

    let logoUrl = logo || '';
    if (logoUrl.startsWith('data:')) {
      logoUrl = await uploadToCloudinary(logoUrl, 'companies');
    }

    const { rows } = await pool.query(
      `INSERT INTO companies (id, name, logo, website, location, description, industry, companyType, createdAt, createdByAdminId)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, name, logoUrl, website || '', location || '', description || '', industry || '', companyType || '', Date.now(), req.user.id]
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
    const role      = req.user.role;
    const isManager = role === 'manager';
    const isOpMgr   = role === 'operational_manager';
    const { rows: ex } = await pool.query('SELECT * FROM companies WHERE id=$1', [id]);
    if (!ex.length) return res.status(404).json({ error: 'Not found' });
    if (!isManager && !isOpMgr && ex[0].createdbyadminid !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, logo, website, location, description, industry, companyType } = req.body;
    
    let logoUrl = logo;
    if (logoUrl && logoUrl.startsWith('data:')) {
      logoUrl = await uploadToCloudinary(logoUrl, 'companies');
    }

    const { rows } = await pool.query(
      `UPDATE companies SET name=$1, logo=$2, website=$3, location=$4, description=$5, industry=$6, companyType=$7 WHERE id=$8 RETURNING *`,
      [name || ex[0].name, logoUrl !== undefined ? logoUrl : ex[0].logo, website || '', location || '', description || '', industry || '', companyType || '', id]
    );

    // ── SYNC: Update all jobs linked to this company ──
    const updatedCompany = rows[0];
    try {
      await pool.query(
        `UPDATE jobs SET company = $1, companylogo = $2 WHERE companyid = $3`,
        [updatedCompany.name, updatedCompany.logo, id]
      );
    } catch (syncErr) {
      console.error('[Sync Warning] Failed to update dependent jobs:', syncErr.message);
    }

    clearMemCachePrefix('comp_');
    clearMemCachePrefix('jobs_');
    clearMemCachePrefix('latest');
    clearMemCachePrefix('all');
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
    const role      = req.user.role;
    const isManager = role === 'manager';
    const isOpMgr   = role === 'operational_manager';
    const { rows: ex } = await pool.query('SELECT * FROM companies WHERE id=$1', [id]);
    if (ex.length && !isManager && !isOpMgr && ex[0].createdbyadminid !== req.user.id) {
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
