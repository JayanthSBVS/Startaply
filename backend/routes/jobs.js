const express = require('express');
const pool = require('../db');
const nodemailer = require('nodemailer');

const router = express.Router();

// Dummy Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  auth: {
    user: process.env.EMAIL_USER || 'dummy@ethereal.email',
    pass: process.env.EMAIL_PASS || 'dummypass',
  },
});

// ── DB INIT ──────────────────────────────────────────────
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id VARCHAR(50) PRIMARY KEY,
        createdAt BIGINT, updatedAt BIGINT,
        title TEXT, subtitle TEXT, description TEXT,
        fullDescription TEXT, requiredSkills TEXT, techStack TEXT,
        aboutCompany TEXT, benefits TEXT, company TEXT,
        companyLogo TEXT, companyColor TEXT, location TEXT,
        workMode TEXT, qualification TEXT, experience TEXT,
        salary TEXT, type TEXT, category TEXT, monthTag TEXT,
        applyUrl TEXT, applyType TEXT DEFAULT 'external',
        expiryDays INTEGER, processType TEXT DEFAULT 'Standard',
        mapLocationUrl TEXT, isFeatured BOOLEAN, isTrending BOOLEAN,
        isToday BOOLEAN, isVisible BOOLEAN, views INTEGER DEFAULT 0,
        isFresh BOOLEAN DEFAULT FALSE,
        govtJobType TEXT, stateName TEXT, jobCategoryType TEXT, govtDept TEXT,
        createdByAdminId TEXT DEFAULT 'system',
        createdByAdminName TEXT DEFAULT 'System',
        companyId VARCHAR(50)
      )
    `);

    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS companyId VARCHAR(50)`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS isHeroFeatured BOOLEAN DEFAULT FALSE`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_companyid ON jobs (companyId)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_adminid ON jobs (createdByAdminId)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs (category)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_createdat ON jobs (createdAt)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_istrending ON jobs (isTrending)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_istoday ON jobs (isToday)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_isfresh ON jobs (isFresh)`);

    // ONE-TIME MIGRATION: Auto-link existing jobs to companies
    try {
      const { rows: allCompanies } = await pool.query('SELECT id, name FROM companies');
      for (const company of allCompanies) {
        await pool.query(
          'UPDATE jobs SET companyId = $1 WHERE company ILIKE $2 AND companyId IS NULL',
          [company.id, company.name]
        );
      }
    } catch (migErr) {
      console.error('Auto-linking migration error (Jobs):', migErr.message);
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(50) PRIMARY KEY, 
        jobId VARCHAR(50),
        name TEXT, 
        email TEXT, 
        phone TEXT, 
        resume TEXT, 
        appliedAt BIGINT,
        jobTitle TEXT,
        companyName TEXT,
        createdByAdminId TEXT DEFAULT 'system'
      )
    `);
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

initDb();

const { authMiddleware, checkOwnership } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');

// ── HELPERS ──────────────────────────────────────────────
function nb(v) { return v === true || v === 'true' || v === 1 || v === '1'; }

const JOBS_SELECT_LIGHT = `
  id, title, subtitle, description, company, location, category, type, salary, createdat, 
  isFeatured, isToday, isTrending, isVisible, workmode, companylogo, 
  govtjobtype, statename, jobcategorytype, updatedat, companyId, isHeroFeatured, isfresh
`;

function mapRow(row) {
  return {
    id: row.id,
    createdAt: Number(row.createdat),
    updatedAt: Number(row.updatedat),
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    fullDescription: row.fulldescription,
    requiredSkills: row.requiredskills,
    techStack: row.techstack,
    aboutCompany: row.aboutcompany,
    benefits: row.benefits,
    company: row.company,
    companyLogo: row.companylogo,
    location: row.location,
    workMode: row.workmode,
    qualification: row.qualification,
    experience: row.experience,
    salary: row.salary,
    type: row.type,
    category: row.category,
    jobCategory: row.category,
    monthTag: row.monthtag,
    applyUrl: row.applyurl,
    applyType: row.applytype || 'external',
    expiryDays: Number(row.expirydays || 0),
    processType: row.processtype || 'Standard',
    mapLocationUrl: row.maplocationurl || '',
    govtJobType: row.govtjobtype || '',
    govtDept: row.govtdept || '',
    stateName: row.statename || '',
    jobCategoryType: row.jobcategorytype || '',
    isFeatured: nb(row.isfeatured),
    isFresh: nb(row.isfresh),
    isTrending: nb(row.istrending),
    isToday: nb(row.istoday),
    isVisible: nb(row.isvisible),
    isHeroFeatured: nb(row.isherofeatured),
    views: Number(row.views || 0),
    applicationCount: Number(row.applicationcount || 0),
    createdByAdminId: row.createdbyadminid,
    createdByAdminName: row.createdbyadminname,
    companyId: row.companyid
  };
}

function processPublicJobs(rows) {
  const now = Date.now();
  return rows.map(mapRow).filter(job => {
    const isExpired = job.expiryDays && job.createdAt && (now > job.createdAt + job.expiryDays * 86400000);
    return !isExpired;
  });
}

// Simple in-memory cache for search queries
const searchCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, value] of searchCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      searchCache.delete(key);
    }
  }
}

async function getPaginatedJobs(req, res, additionalWhere = '', params = []) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '');

    // Check query cache
    cleanExpiredCache();
    const cacheKey = req.originalUrl || req.url;
    if (searchCache.has(cacheKey)) {
      const cached = searchCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json(cached.data);
      }
    }

    let whereClause = `WHERE isVisible::text = 'true' ${additionalWhere ? `AND (${additionalWhere})` : ''}`;
    const queryParams = [...params];

    if (search.trim()) {
      const stopWords = ['job', 'jobs', 'vacancy', 'hiring', 'role', 'roles', 'in', 'for', 'at', 'with', 'and', 'the', 'of', 'a', 'to'];
      let rawTerms = search.toLowerCase().split(/\s+/).filter(t => t && !stopWords.includes(t));
      if (rawTerms.length === 0) rawTerms = search.trim().split(/\s+/).filter(Boolean);

      // Typo tolerance: search for both 'goverment' and 'government'
      const finalTerms = [];
      rawTerms.forEach(t => {
        finalTerms.push(t);
        if (t === 'goverment') finalTerms.push('government');
        if (t === 'government') finalTerms.push('goverment');
      });

      const searchConditions = finalTerms.map(term => {
        queryParams.push(`%${term}%`);
        const idx = queryParams.length;
        return `(
          title ILIKE $${idx} OR 
          company ILIKE $${idx} OR 
          location ILIKE $${idx} OR 
          category ILIKE $${idx} OR 
          govtJobType ILIKE $${idx} OR
          stateName ILIKE $${idx} OR
          jobCategoryType ILIKE $${idx} OR
          companyId ILIKE $${idx}
        )`;
      });

      if (searchConditions.length > 0) {
        // Connect separate terms with AND for higher specificity and speed
        whereClause += ` AND (${searchConditions.join(' AND ')})`;
      }
    }

    const query = `
      SELECT ${JOBS_SELECT_LIGHT}
      FROM jobs
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    console.log('[DEBUG SQL]', query.trim().replace(/\s+/g, ' '));
    console.log('[DEBUG PARAMS]', [...queryParams, limit, offset]);

    const { rows } = await pool.query(query, [...queryParams, limit, offset]);
    const results = processPublicJobs(rows);
    
    // Store in query cache
    searchCache.set(cacheKey, { data: results, timestamp: Date.now() });
    
    res.json(results);
  } catch (err) {
    console.error('[getPaginatedJobs]', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// ── PUBLIC ROUTES ─────────────────────────────────────────

router.get('/', (req, res) => getPaginatedJobs(req, res));

router.get('/government', (req, res) => {
  const { govtFilter } = req.query;
  let addlt = `category = 'Government Jobs'`;
  const p = [];
  if (govtFilter === 'Central' || govtFilter === 'State') {
    addlt += ` AND (govtJobType = $1 OR govtjobtype = $1)`;
    p.push(govtFilter);
  }
  return getPaginatedJobs(req, res, addlt, p);
});

router.get('/it', (req, res) => {
  return getPaginatedJobs(req, res, `category = 'IT & Software Jobs'`);
});

router.get('/non-it', (req, res) => {
  return getPaginatedJobs(req, res, `category = 'Non-IT Jobs'`);
});

router.get('/freshers', (req, res) => {
  return getPaginatedJobs(req, res, `(experience ILIKE '%0%' OR experience ILIKE '%fresher%' OR category ILIKE '%Fresher Jobs%' OR isFresh::text = 'true')`);
});

router.get('/today', (req, res) => {
  const dayAgo = Date.now() - 86400000;
  return getPaginatedJobs(req, res, `createdAt > ${dayAgo} OR isToday::text = 'true'`);
});

router.get('/featured', (req, res) => {
  return getPaginatedJobs(req, res, `isFeatured::text = 'true'`);
});

router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) return res.json([]);
    const searchTerm = `%${q}%`;
    const { rows } = await pool.query(`
      (SELECT title as suggestion FROM jobs WHERE title ILIKE $1 AND isVisible::text = 'true')
      UNION
      (SELECT company as suggestion FROM jobs WHERE company ILIKE $1 AND isVisible::text = 'true')
      LIMIT 8
    `, [searchTerm]);
    res.json(rows.map(r => r.suggestion));
  } catch (err) {
    res.status(500).json([]);
  }
});

// ── ADMIN & UTILITY ROUTES ────────────────────────────────

async function checkHierarchicalOwnership(itemAdminId, user) {
  if (user.role === 'manager') return true;
  if (itemAdminId === user.id) return true;
  if (user.role === 'operational_manager') {
    // Op Manager can edit if creator is operational_executive
    const { rows } = await pool.query('SELECT role FROM users WHERE id=$1', [itemAdminId]);
    if (rows.length && rows[0].role === 'operational_executive') return true;
  }
  return false;
}

router.get('/admin/list', authMiddleware, async (req, res) => {
  try {
    let query = `SELECT j.*, (SELECT count(*) FROM applications a WHERE a.jobId = j.id) as applicationcount FROM jobs j`;
    let params = [];
    if (req.user.role === 'operational_executive') {
      query += ` WHERE j.createdByAdminId = $1`;
      params.push(req.user.id);
    } else if (req.user.role === 'operational_manager') {
      query += ` WHERE j.createdByAdminId = $1 OR j.createdByAdminId IN (SELECT id FROM users WHERE role = 'operational_executive')`;
      params.push(req.user.id);
    }
    const { rows } = await pool.query(query, params);
    res.json(rows.map(mapRow).sort((a,b) => b.createdAt - a.createdAt));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const j = normalizeJob(req.body);
    j.createdByAdminId = req.user.id;
    j.createdByAdminName = req.user.name;
    const { rows } = await pool.query(`
      INSERT INTO jobs (
        id,createdAt,updatedAt,title,subtitle,description,fullDescription,
        requiredSkills,techStack,aboutCompany,benefits,company,companyLogo,
        location,workMode,qualification,experience,salary,type,category,
        monthTag,applyUrl,applyType,expiryDays,processType,mapLocationUrl,
        isFeatured,isFresh,isTrending,isToday,isVisible,
        govtJobType,govtDept,stateName,jobCategoryType,
        createdByAdminId, createdByAdminName, companyId, isHeroFeatured
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39)
      RETURNING *
    `, [
      j.id, j.createdAt, j.updatedAt, j.title, j.subtitle, j.description, j.fullDescription,
      j.requiredSkills, j.techStack, j.aboutCompany, j.benefits, j.company, j.companyLogo,
      j.location, j.workMode, j.qualification, j.experience, j.salary, j.type, j.category,
      j.monthTag, j.applyUrl, j.applyType, j.expiryDays, j.processType, j.mapLocationUrl,
      j.isFeatured, j.isFresh, j.isTrending, j.isToday, j.isVisible,
      j.govtJobType, j.govtDept, j.stateName, j.jobCategoryType,
      j.createdByAdminId, j.createdByAdminName, j.companyId, j.isHeroFeatured
    ]);
    searchCache.clear(); // Clear cache when data is modified
    res.status(201).json(mapRow(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: ex } = await pool.query('SELECT * FROM jobs WHERE id=$1', [id]);
    if (!ex.length) return res.status(404).json({ error: 'Not found' });
    const existing = mapRow(ex[0]);
    if (!(await checkHierarchicalOwnership(existing.createdByAdminId, req.user))) return res.status(403).json({ error: 'Ownership required' });
    const j = normalizeJob(req.body, existing);
    const { rows } = await pool.query(`
      UPDATE jobs SET
        updatedAt=$1,title=$2,subtitle=$3,description=$4,fullDescription=$5,
        requiredSkills=$6,techStack=$7,aboutCompany=$8,benefits=$9,company=$10,
        companyLogo=$11,location=$12,workMode=$13,qualification=$14,experience=$15,
        salary=$16,type=$17,category=$18,monthTag=$19,applyUrl=$20,applyType=$21,
        expiryDays=$22,processType=$23,mapLocationUrl=$24,isFeatured=$25,isFresh=$26,
        isTrending=$27,isToday=$28,isVisible=$29,
        govtJobType=$30,govtDept=$31,stateName=$32,jobCategoryType=$33, companyId=$34,
        isHeroFeatured=$35
      WHERE id=$36 RETURNING *
    `, [
      j.updatedAt, j.title, j.subtitle, j.description, j.fullDescription,
      j.requiredSkills, j.techStack, j.aboutCompany, j.benefits, j.company,
      j.companyLogo, j.location, j.workMode, j.qualification, j.experience,
      j.salary, j.type, j.category, j.monthTag, j.applyUrl, j.applyType,
      j.expiryDays, j.processType, j.mapLocationUrl, j.isFeatured, j.isFresh,
      j.isTrending, j.isToday, j.isVisible,
      j.govtJobType, j.govtDept, j.stateName, j.jobCategoryType, j.companyId,
      j.isHeroFeatured, id
    ]);
    searchCache.clear(); // Clear cache when data is modified
    res.json(mapRow(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows: ex } = await pool.query('SELECT * FROM jobs WHERE id=$1', [req.params.id]);
    if (!ex.length) return res.status(404).json({ error: 'Not found' });
    if (!(await checkHierarchicalOwnership(ex[0].createdbyadminid, req.user))) return res.status(403).json({ error: 'Ownership required' });
    await pool.query('DELETE FROM jobs WHERE id=$1', [req.params.id]);
    searchCache.clear(); // Clear cache when data is modified
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all applications
router.get('/applications/all', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM applications ORDER BY appliedAt DESC';
    let params = [];
    if (req.user.role !== 'manager' && req.user.role !== 'operational_manager') {
      query = 'SELECT * FROM applications WHERE createdByAdminId = $1 ORDER BY appliedAt DESC';
      params.push(req.user.id);
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET job by ID (Detailed)
const getJobByIdHandler = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT j.*, (SELECT count(*) FROM applications a WHERE a.jobId = j.id) as applicationcount 
      FROM jobs j WHERE id = $1
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Job not found' });
    res.json(mapRow(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

router.get('/:id', getJobByIdHandler);
router.get('/:id/view', getJobByIdHandler);

// POST apply
router.post('/:id/apply', async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { name, email, phone, resume, jobTitle, companyName } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Missing fields' });
    const { rows: jobRows } = await pool.query('SELECT createdByAdminId FROM jobs WHERE id=$1', [jobId]);
    const adminId = jobRows.length > 0 ? jobRows[0].createdbyadminid : 'system';
    const id = String(Date.now());
    await pool.query(
      `INSERT INTO applications (id, jobId, jobTitle, companyName, name, email, phone, resume, appliedAt, createdByAdminId) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, jobId, jobTitle || 'General', companyName || 'Startaply', name, email, phone || '', resume || '', Date.now(), adminId]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST view count
router.post('/:id/view', async (req, res) => {
  try {
    await pool.query(`UPDATE jobs SET views = COALESCE(views,0)+1 WHERE id=$1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── INTERNAL HELPERS (REPLICATED) ─────────────────────────
function normalizeJob(body, existing = null) {
  const now = Date.now();
  const fullDesc = body.fullDescription || existing?.fullDescription || '';
  const shortDesc = body.description || (fullDesc ? fullDesc.substring(0, 200) : '') || existing?.description || '';
  return {
    id: existing?.id || String(now),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    title: body.title || '',
    subtitle: body.subtitle || '',
    description: shortDesc,
    fullDescription: fullDesc,
    requiredSkills: body.requiredSkills || '',
    techStack: body.techStack || '',
    aboutCompany: body.aboutCompany || '',
    benefits: body.benefits || '',
    company: body.company || '',
    companyLogo: body.companyLogo || '',
    location: body.location || '',
    workMode: body.workMode || '',
    qualification: body.qualification || '',
    experience: body.experience || '',
    salary: body.salary || '',
    type: body.type || '',
    category: body.category || body.jobCategory || '',
    monthTag: body.monthTag || '',
    applyUrl: body.applyUrl || '',
    applyType: body.applyType || 'external',
    expiryDays: Number(body.expiryDays || 0),
    processType: body.processType || 'Standard',
    mapLocationUrl: body.mapLocationUrl || '',
    isFeatured: nb(body.isFeatured),
    isHeroFeatured: nb(body.isHeroFeatured),
    isFresh: nb(body.isFresh),
    isTrending: nb(body.isTrending),
    isToday: nb(body.isToday),
    isVisible: body.isVisible === undefined ? true : nb(body.isVisible),
    govtJobType: body.govtJobType || '',
    govtDept: body.govtDept || '',
    stateName: body.stateName || '',
    jobCategoryType: body.jobCategoryType || '',
    createdByAdminId: body.createdByAdminId || existing?.createdByAdminId || 'system',
    createdByAdminName: body.createdByAdminName || existing?.createdByAdminName || 'System',
    companyId: body.companyId || existing?.companyId || null,
  };
}

module.exports = router;