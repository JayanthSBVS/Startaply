const express = require('express');
const cors    = require('cors');
const { getPool, getMemCache, setMemCache, clearMemCachePrefix, setEdgeCache } = require('./db');

const { recordActivity } = require('./_shared');

const pool = getPool();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── JWT Secret guard ────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'strataply_super_secret_key_123';

// ── ROLE HELPERS ────────────────────────────────────────────────────────────
// 'admin' is legacy for 'executive' — normalize everywhere
const normalizeRole = (role) => {
  if (!role) return 'executive';
  if (role === 'admin') return 'executive';
  return role;
};

// ── PERMISSION HELPER ────────────────────────────────────────────────────────
// Fetches the role_permissions row for a given role from DB (cached 60s)
async function getPermissions(role) {
  const normalized = normalizeRole(role);
  if (normalized === 'manager') {
    // Managers always have full access — no DB lookup needed
    return { can_post_job: true, can_edit_job: true, can_delete_job: true, can_view_applicants: true, can_manage_companies: true, can_manage_mela: true, can_manage_prep: true };
  }
  try {
    const { rows } = await pool.query('SELECT * FROM role_permissions WHERE role = $1', [normalized]);
    return rows.length ? rows[0] : { can_post_job: true, can_edit_job: true, can_delete_job: false, can_view_applicants: true, can_manage_companies: true, can_manage_mela: true, can_manage_prep: true };
  } catch (e) {
    // Fail-safe: if permissions table isn't queryable, allow common ops
    return { can_post_job: true, can_edit_job: true, can_delete_job: false, can_view_applicants: true, can_manage_companies: true, can_manage_mela: true, can_manage_prep: true };
  }
}

// ── DB INIT ──────────────────────────────────────────────────────────────────
// Runs once per cold start. CREATE TABLE IF NOT EXISTS is idempotent.
let dbInitialized = false;
async function initDb() {
  if (dbInitialized) return;
  dbInitialized = true;
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
        expiryDays INTEGER, isFeatured BOOLEAN, isTrending BOOLEAN,
        isToday BOOLEAN, isVisible BOOLEAN, views INTEGER DEFAULT 0,
        govtJobType TEXT, stateName TEXT, jobCategoryType TEXT,
        mapLocationUrl TEXT, processType TEXT DEFAULT 'Standard',
        createdByAdminId TEXT
      )
    `);

    // Migrations (idempotent)
    const cols = ['applyType', 'views', 'isFresh', 'govtJobType', 'stateName', 'jobCategoryType', 'mapLocationUrl', 'processType', 'createdByAdminId'];
    for (const col of cols) {
      await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ${col} TEXT`);
    }
    await pool.query(`ALTER TABLE jobs ALTER COLUMN applyType SET DEFAULT 'external'`);
    await pool.query(`ALTER TABLE jobs ALTER COLUMN views SET DEFAULT 0`);
    await pool.query(`ALTER TABLE jobs ALTER COLUMN isVisible SET DEFAULT true`);

    // Ownership backfill
    await pool.query(`UPDATE jobs SET createdByAdminId = 'admin_jayanth' WHERE createdByAdminId IS NULL OR createdByAdminId = ''`);

    // ── PERFORMANCE INDEXES ─────────────────────────────────────────────────
    // These turn full-table-scans into fast index scans for every filter query.
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_createdat ON jobs(createdat DESC)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_isvisible ON jobs(isvisible)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_isfeatured ON jobs(isfeatured)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_istoday ON jobs(istoday)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_isfresh ON jobs(isfresh)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_govtjobtype ON jobs(govtjobtype)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_jobcategorytype ON jobs(jobcategorytype)`);
    // Composite for the most common public query pattern
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_visible_created ON jobs(isvisible, createdat DESC)`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(50) PRIMARY KEY, jobId VARCHAR(50),
        name TEXT, email TEXT, phone TEXT, resume TEXT, appliedAt BIGINT,
        jobTitle TEXT, companyName TEXT
      )
    `);
  } catch (err) {
    console.error('DB init error:', err.message);
    dbInitialized = false; // Allow retry on next request if init failed
  }
}
initDb();

// ── HELPERS ──────────────────────────────────────────────────────────────────
function nb(v) { return v === true || v === 'true' || v === 1 || v === '1'; }

function normalizeJob(body, existing = null, adminId = null) {
  const now      = Date.now();
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
    isFeatured: nb(body.isFeatured),
    isFresh: nb(body.isFresh),
    isTrending: nb(body.isTrending),
    isToday: nb(body.isToday),
    isVisible: body.isVisible === undefined ? true : nb(body.isVisible),
    govtJobType: body.govtJobType || body.govtjobtype || '',
    stateName: body.stateName || body.statename || '',
    jobCategoryType: body.jobCategoryType || body.jobcategorytype || '',
    mapLocationUrl: body.mapLocationUrl || body.maplocationurl || '',
    processType: body.processType || body.processtype || 'Standard',
    createdByAdminId: adminId || body.createdByAdminId || existing?.createdByAdminId || 'admin_jayanth'
  };
}

function mapRow(r) {
  if (!r) return null;
  return {
    ...r,
    id: r.id,
    createdAt: Number(r.createdat || r.createdAt),
    updatedAt: Number(r.updatedat || r.updatedAt),
    isFeatured: nb(r.isfeatured || r.isFeatured),
    isFresh: nb(r.isfresh || r.isFresh),
    isTrending: nb(r.istrending || r.isTrending),
    isToday: nb(r.istoday || r.isToday),
    isVisible: nb(r.isvisible || r.isVisible),
    expiryDays: Number(r.expirydays || r.expiryDays || 0),
    views: Number(r.views || 0),
    applicationCount: Number(r.applicationcount || 0),
    govtJobType: r.govtjobtype || r.govtJobType || '',
    stateName: r.statename || r.stateName || '',
    jobCategoryType: r.jobcategorytype || r.jobCategoryType || '',
    mapLocationUrl: r.maplocationurl || r.mapLocationUrl || '',
    processType: r.processtype || r.processType || 'Standard',
    createdByAdminId: r.createdbyadminid || r.createdByAdminId || '',
    jobCategory: r.category || r.jobcategory || r.jobCategory || ''
  };
}

// ── AUTH MIDDLEWARE ───────────────────────────────────────────────────────────
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    decoded.role = normalizeRole(decoded.role); // Always normalize
    req.user = decoded;
    next();
  } catch (err) { res.status(401).json({ error: 'Auth failed' }); }
};

// ── SET CACHE HEADERS ─────────────────────────────────────────────────────────
const setCache = (res, sMaxAge = 60, stale = 300) => {
  res.setHeader('Cache-Control', `s-maxage=${sMaxAge}, stale-while-revalidate=${stale}`);
};

// ── JOBS SELECT (light — excludes heavy text blobs) ───────────────────────────
const JOBS_SELECT_LIGHT = `id, createdAt, updatedAt, title, subtitle, description, requiredSkills, company, companyLogo, location, workMode, salary, type, category, monthTag, applyType, expiryDays, isFeatured, isFresh, isTrending, isToday, isVisible, govtJobType, stateName, jobCategoryType, processType, createdByAdminId`;

function processPublicJobs(rows) {
  const now = Date.now();
  const cleaned   = [];
  const deleteIds = [];
  for (const row of rows) {
    const job = mapRow(row);
    if (!job) continue;
    const expired = job.expiryDays > 0 && job.createdAt && (now > job.createdAt + job.expiryDays * 86400000);
    if (expired) deleteIds.push(job.id);
    else cleaned.push(job);
  }
  if (deleteIds.length > 0) {
    // Fire-and-forget cleanup — don't block the response
    pool.query('DELETE FROM jobs WHERE id = ANY($1::varchar[])', [deleteIds]).catch(err => console.error('[Expiry cleanup]', err));
  }
  return cleaned;
}

// ── PAGINATED JOBS HELPER ─────────────────────────────────────────────────────
async function getPaginatedJobs(req, res, additionalWhere = '', params = [], cacheKeyPrefix = 'jobs_list') {
  try {
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const cacheKey = `${cacheKeyPrefix}_${page}_${limit}_${req.url.replace(/\W/g, '_')}`;
    const cached   = getMemCache(cacheKey, 60);
    if (cached) {
      setEdgeCache(res, 60, 300);
      return res.json(cached);
    }

    const whereClause = `WHERE isVisible = true ${additionalWhere ? `AND (${additionalWhere})` : ''}`;

    const { rows } = await pool.query(`
      SELECT ${JOBS_SELECT_LIGHT}
      FROM jobs
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]);

    const cleaned = processPublicJobs(rows);
    setMemCache(cacheKey, cleaned);
    setEdgeCache(res, 60, 300);
    res.json(cleaned);
  } catch (err) {
    console.error('[getPaginatedJobs]', err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// ROUTES
// ──────────────────────────────────────────────────────────────────────────────

// GET search suggestions
app.get('/api/jobs/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const cacheKey = `sq_${q.toLowerCase()}`;
    const cached   = getMemCache(cacheKey, 600);
    if (cached) {
      setEdgeCache(res, 600, 3600);
      return res.json(cached);
    }

    const searchTerm = `%${q}%`;
    const { rows } = await pool.query(`
      (SELECT title as suggestion FROM jobs WHERE title ILIKE $1 AND isVisible = true)
      UNION
      (SELECT company as suggestion FROM jobs WHERE company ILIKE $1 AND isVisible = true)
      LIMIT 8
    `, [searchTerm]);

    const result = rows.map(r => r.suggestion);
    setMemCache(cacheKey, result);
    setEdgeCache(res, 600, 3600);
    res.json(result);
  } catch (err) {
    console.error('[suggestions]', err);
    res.status(500).json([]);
  }
});

// GET jobs for admin (no expiry filtering)
// Managers + Op-Managers see ALL jobs. Executives see ALL jobs but get canEdit/canDelete flags.
app.get('/api/jobs/admin/list', authMiddleware, async (req, res) => {
  try {
    const role      = req.user.role;
    const isManager = role === 'manager';
    const isOpMgr   = role === 'operational_manager';
    const userId    = req.user.id;

    // Everyone sees all jobs — ownership is enforced via flags, not filtering
    const { rows } = await pool.query(
      `SELECT j.*, (SELECT count(*) FROM applications a WHERE a.jobId = j.id) as applicationcount FROM jobs j ORDER BY j.createdat DESC`
    );

    const perms = await getPermissions(role);

    const mapped = rows.map(row => {
      const job = mapRow(row);
      const isOwner = job.createdByAdminId === userId;

      // canEdit: manager/op-manager always; executive only if owner AND permission granted
      const canEdit   = isManager || isOpMgr || (isOwner && perms.can_edit_job);
      // canDelete: manager always; op-manager always; executive only if owner AND delete permission
      const canDelete = isManager || isOpMgr || (isOwner && perms.can_delete_job);

      return { ...job, canEdit, canDelete, isOwner };
    });

    res.json(mapped);
  } catch (err) {
    console.error('[admin/list]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Split public routes — each hits a specific optimized query
app.get('/api/jobs/latest',     (req, res) => getPaginatedJobs(req, res, '', [], 'latest'));
app.get('/api/jobs/featured',   (req, res) => getPaginatedJobs(req, res, 'isFeatured = true', [], 'featured'));
app.get('/api/jobs/freshers',   (req, res) => getPaginatedJobs(req, res, 'isFresh = true OR isToday = true', [], 'freshers'));
app.get('/api/jobs/today',      (req, res) => getPaginatedJobs(req, res, 'isToday = true', [], 'today'));

app.get('/api/jobs/government', (req, res) => {
  const govtFilter = req.query.govtFilter;
  let addlt = `(category = 'Government Jobs' OR jobcategory = 'Government Jobs')`;
  const p = [];
  if (govtFilter === 'Central' || govtFilter === 'State') {
    addlt += ` AND (govtJobType = $1 OR govtjobtype = $1)`;
    p.push(govtFilter);
  }
  return getPaginatedJobs(req, res, addlt, p, 'govt');
});

app.get('/api/jobs/it', (req, res) => {
  return getPaginatedJobs(req, res, `(category = 'IT & Non-IT Jobs' OR jobcategory = 'IT & Non-IT Jobs') AND (jobCategoryType = 'IT Job' OR jobcategorytype = 'IT Job')`, [], 'it');
});

app.get('/api/jobs/non-it', (req, res) => {
  return getPaginatedJobs(req, res, `(category = 'IT & Non-IT Jobs' OR jobcategory = 'IT & Non-IT Jobs') AND (jobCategoryType = 'Non-IT Job' OR jobcategorytype = 'Non-IT Job')`, [], 'nonit');
});

// GET all jobs (public paginated — legacy fallback)
app.get('/api/jobs', (req, res) => {
  return getPaginatedJobs(req, res, '', [], 'all');
});

// GET single job full details
app.get('/api/jobs/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `job_full_${id}`;
    const cached   = getMemCache(cacheKey, 60);
    if (cached) {
      setEdgeCache(res, 60, 300);
      return res.json(cached);
    }

    const { rows } = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });

    const maxJob = mapRow(rows[0]);
    setMemCache(cacheKey, maxJob);
    setEdgeCache(res, 60, 300);
    res.json(maxJob);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST increment view count (single route — duplicate removed)
app.post('/api/jobs/:id/view', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE jobs SET views = COALESCE(views, 0) + 1 WHERE id = $1 RETURNING views`,
      [req.params.id]
    );
    res.json({ views: rows.length > 0 ? rows[0].views : 0 });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// POST create job
app.post('/api/jobs', authMiddleware, async (req, res) => {
  try {
    // Permission check: can this role post jobs?
    const perms = await getPermissions(req.user.role);
    if (!perms.can_post_job) {
      return res.status(403).json({ error: 'Your role does not have permission to post jobs' });
    }

    const j = normalizeJob(req.body, null, req.user.id);
    const { rows } = await pool.query(`
      INSERT INTO jobs (
        id,createdAt,updatedAt,title,subtitle,description,fullDescription,
        requiredSkills,techStack,aboutCompany,benefits,company,companyLogo,
        location,workMode,qualification,experience,salary,type,category,
        monthTag,applyUrl,applyType,expiryDays,isFeatured,isFresh,isTrending,isToday,isVisible,
        govtJobType,stateName,jobCategoryType,mapLocationUrl,processType,createdByAdminId
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35)
      RETURNING *
    `, [
      j.id, j.createdAt, j.updatedAt, j.title, j.subtitle, j.description, j.fullDescription,
      j.requiredSkills, j.techStack, j.aboutCompany, j.benefits, j.company, j.companyLogo,
      j.location, j.workMode, j.qualification, j.experience, j.salary, j.type, j.category,
      j.monthTag, j.applyUrl, j.applyType, j.expiryDays, j.isFeatured, j.isFresh, j.isTrending, j.isToday, j.isVisible,
      j.govtJobType, j.stateName, j.jobCategoryType, j.mapLocationUrl, j.processType, j.createdByAdminId
    ]);
    clearMemCachePrefix('jobs_list');
    clearMemCachePrefix('latest');
    clearMemCachePrefix('all');
    clearMemCachePrefix(`job_full_${j.id}`);
    // Fire-and-forget logging — don't delay response
    recordActivity(pool, req.user, 'Jobs', `Created job: ${j.title}`, j.id).catch(() => {});
    res.status(201).json(mapRow(rows[0]));
  } catch (err) {
    console.error('POST /api/jobs:', err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

// PUT update job
app.put('/api/jobs/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const role      = req.user.role;
    const isManager = role === 'manager';
    const isOpMgr   = role === 'operational_manager';

    // Permission check
    const perms = await getPermissions(role);
    if (!perms.can_edit_job && !isManager) {
      return res.status(403).json({ error: 'Your role does not have permission to edit jobs' });
    }

    const { rows: ex } = await pool.query('SELECT * FROM jobs WHERE id=$1', [id]);
    if (!ex.length) return res.status(404).json({ message: 'Not found' });

    const existingJob = mapRow(ex[0]);
    // Executives can only edit their own; Op-Managers and Managers can edit all
    if (!isManager && !isOpMgr && existingJob.createdByAdminId !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own jobs' });
    }

    const j = normalizeJob(req.body, existingJob);
    const { rows } = await pool.query(`
      UPDATE jobs SET
        updatedAt=$1,title=$2,subtitle=$3,description=$4,fullDescription=$5,
        requiredSkills=$6,techStack=$7,aboutCompany=$8,benefits=$9,company=$10,
        companyLogo=$11,location=$12,workMode=$13,qualification=$14,experience=$15,
        salary=$16,type=$17,category=$18,monthTag=$19,applyUrl=$20,applyType=$21,
        expiryDays=$22,isFeatured=$23,isFresh=$24,isTrending=$25,isToday=$26,isVisible=$27,
        govtJobType=$28,stateName=$29,jobCategoryType=$30,mapLocationUrl=$31,processType=$32,
        createdByAdminId=$33
      WHERE id=$34 RETURNING *
    `, [
      j.updatedAt, j.title, j.subtitle, j.description, j.fullDescription,
      j.requiredSkills, j.techStack, j.aboutCompany, j.benefits, j.company,
      j.companyLogo, j.location, j.workMode, j.qualification, j.experience,
      j.salary, j.type, j.category, j.monthTag, j.applyUrl, j.applyType,
      j.expiryDays, j.isFeatured, j.isFresh, j.isTrending, j.isToday, j.isVisible,
      j.govtJobType, j.stateName, j.jobCategoryType, j.mapLocationUrl, j.processType,
      j.createdByAdminId, id
    ]);
    clearMemCachePrefix('jobs_list');
    clearMemCachePrefix('latest');
    clearMemCachePrefix('all');
    clearMemCachePrefix(`job_full_${id}`);
    recordActivity(pool, req.user, 'Jobs', `Updated job: ${j.title}`, j.id).catch(() => {});
    res.json(mapRow(rows[0]));
  } catch (err) {
    console.error('[PUT /api/jobs/:id]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE job
app.delete('/api/jobs/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const role      = req.user.role;
    const isManager = role === 'manager';
    const isOpMgr   = role === 'operational_manager';

    // Permission check
    const perms = await getPermissions(role);
    if (!perms.can_delete_job && !isManager) {
      return res.status(403).json({ error: 'Your role does not have permission to delete jobs' });
    }

    const { rows: ex } = await pool.query('SELECT createdByAdminId FROM jobs WHERE id=$1', [id]);
    // Executives can only delete their own; Op-Managers and Managers can delete all
    if (ex.length && !isManager && !isOpMgr && ex[0].createdbyadminid !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own jobs' });
    }
    await pool.query('DELETE FROM jobs WHERE id=$1', [id]);
    clearMemCachePrefix('jobs_list');
    clearMemCachePrefix('latest');
    clearMemCachePrefix('all');
    clearMemCachePrefix(`job_full_${id}`);
    recordActivity(pool, req.user, 'Jobs', `Deleted job ID: ${id}`, id).catch(() => {});
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all applications
app.get('/api/jobs/applications/all', authMiddleware, async (req, res) => {
  try {
    const role      = req.user.role;
    const isManager = role === 'manager';
    const isOpMgr   = role === 'operational_manager';

    // Check if role has permission to view applicants
    const perms = await getPermissions(role);
    if (!perms.can_view_applicants && !isManager) {
      return res.status(403).json({ error: 'Your role does not have permission to view applicants' });
    }

    // Managers and Op-Managers see all; Executives see only their jobs' applicants
    let query  = `SELECT a.* FROM applications a JOIN jobs j ON a.jobId = j.id`;
    let params = [];

    if (!isManager && !isOpMgr) {
      query += ` WHERE j.createdByAdminId = $1`;
      params.push(req.user.id);
    }
    query += ` ORDER BY a.appliedAt DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows.map(r => ({
      ...r,
      appliedAt:   Number(r.appliedat || r.appliedAt),
      jobId:       r.jobid       || r.jobId,
      jobTitle:    r.jobtitle    || r.jobTitle,
      companyName: r.companyname || r.companyName
    })));
  } catch (err) {
    console.error('[GET applications]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE application
app.delete('/api/jobs/applications/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const isManager = req.user.role === 'manager';

    if (!isManager) {
      const { rows } = await pool.query(`
        SELECT a.id FROM applications a
        JOIN jobs j ON a.jobId = j.id
        WHERE a.id = $1 AND j.createdByAdminId = $2
      `, [id, req.user.id]);
      if (rows.length === 0) return res.status(403).json({ error: 'Unauthorized to delete this applicant' });
    }

    await pool.query('DELETE FROM applications WHERE id = $1', [id]);
    res.json({ success: true, message: 'Applicant deleted' });
  } catch (err) {
    console.error('[DELETE application]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST apply to job
const nodemailer = require('nodemailer');
app.post('/api/jobs/:id/apply', async (req, res) => {
  try {
    const { name, email, phone, resume, jobTitle, companyName } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Missing fields' });
    const id = String(Date.now());

    // Save application first — don't block on email
    const { rows } = await pool.query(
      `INSERT INTO applications (id,jobId,name,email,phone,resume,appliedAt,jobTitle,companyName) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [id, req.params.id, name, email, phone || '', resume || '', Date.now(), jobTitle || '', companyName || '']
    );
    res.status(201).json(rows[0]);

    // Fire-and-forget email — failures don't affect the user response
    (async () => {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER || 'dummy@ethereal.email',
            pass: process.env.EMAIL_PASS || 'dummy-pass'
          }
        });
        await transporter.sendMail({
          from: '"Strataply" <noreply@strataply.com>',
          to: email,
          subject: `Application Received: ${jobTitle || 'Job'} at ${companyName || 'our partner company'}`,
          text: `Hi ${name},\n\nWe have received your application.\n\nThank you for applying through Strataply!\n\nBest,\nStrataply Team`,
        });
      } catch { /* email failure is non-critical */ }
    })();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = app;
