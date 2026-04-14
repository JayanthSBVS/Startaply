const express = require('express');
const pool = require('../db');
const router = express.Router();

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
        isFresh BOOLEAN DEFAULT FALSE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(50) PRIMARY KEY, 
        jobId VARCHAR(50),
        name TEXT, 
        email TEXT, 
        phone TEXT, 
        resume TEXT, 
        appliedAt BIGINT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        email VARCHAR(255) PRIMARY KEY, password VARCHAR(255)
      )
    `);

    // Alterations for progressive schema updates to prevent data loss
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS applyType TEXT DEFAULT 'external'`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS isFresh BOOLEAN DEFAULT FALSE`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS processType TEXT DEFAULT 'Standard'`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS mapLocationUrl TEXT`);

    await pool.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS jobTitle TEXT`);
    await pool.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS companyName TEXT`);

    await pool.query(`
      INSERT INTO admins (email, password) VALUES ('admin@strataply.com', 'admin123')
      ON CONFLICT (email) DO NOTHING
    `);
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

initDb();

// ── HELPERS ──────────────────────────────────────────────
function nb(v) { return v === true || v === 'true' || v === 1 || v === '1'; }

function normalizeJob(body, existing = null) {
  const now = Date.now();
  // Auto-generate short description from fullDescription if not provided
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
    isFresh: nb(body.isFresh),
    isTrending: nb(body.isTrending),
    isToday: nb(body.isToday),
    isVisible: body.isVisible === undefined ? true : nb(body.isVisible),
  };
}

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
    mode: row.workmode,
    monthTag: row.monthtag,
    applyUrl: row.applyurl,
    applyType: row.applytype || 'external',
    expiryDays: Number(row.expirydays || 0),
    processType: row.processtype || 'Standard',
    mapLocationUrl: row.maplocationurl || '',
    isFeatured: row.isfeatured,
    isFresh: row.isfresh,
    isTrending: row.istrending,
    isToday: row.istoday,
    isVisible: row.isvisible,
    views: Number(row.views || 0),
    applicationCount: Number(row.applicationcount || 0),
  };
}

// ── ROUTES ───────────────────────────────────────────────

// GET search suggestions (titles and companies)
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const searchTerm = `%${q}%`;
    const { rows } = await pool.query(`
      (SELECT title as suggestion FROM jobs WHERE title ILIKE $1 AND isVisible = true)
      UNION
      (SELECT company as suggestion FROM jobs WHERE company ILIKE $1 AND isVisible = true)
      LIMIT 8
    `, [searchTerm]);

    res.json(rows.map(r => r.suggestion));
  } catch (err) {
    console.error('Suggestions error:', err);
    res.status(500).json([]);
  }
});

// GET all jobs
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT j.*, (SELECT count(*) FROM applications a WHERE a.jobId = j.id) as applicationcount
      FROM jobs j
    `);
    const now = Date.now();
    let cleaned = [];

    for (const row of rows) {
      const job = mapRow(row);
      const isExpired = job.expiryDays && job.createdAt && (now > job.createdAt + job.expiryDays * 86400000);

      // HIDE expired jobs from the frontend list, but DO NOT delete them from the database
      if (!isExpired) {
        cleaned.push(job);
      }
    }

    cleaned.sort((a, b) => b.createdAt - a.createdAt);
    res.json(cleaned);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

// POST create job
router.post('/', async (req, res) => {
  try {
    const j = normalizeJob(req.body);
    const { rows } = await pool.query(`
      INSERT INTO jobs (
        id,createdAt,updatedAt,title,subtitle,description,fullDescription,
        requiredSkills,techStack,aboutCompany,benefits,company,companyLogo,
        location,workMode,qualification,experience,salary,type,category,
        monthTag,applyUrl,applyType,expiryDays,processType,mapLocationUrl,
        isFeatured,isFresh,isTrending,isToday,isVisible
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31)
      RETURNING *
    `, [
      j.id, j.createdAt, j.updatedAt, j.title, j.subtitle, j.description, j.fullDescription,
      j.requiredSkills, j.techStack, j.aboutCompany, j.benefits, j.company, j.companyLogo,
      j.location, j.workMode, j.qualification, j.experience, j.salary, j.type, j.category,
      j.monthTag, j.applyUrl, j.applyType, j.expiryDays, j.processType, j.mapLocationUrl,
      j.isFeatured, j.isFresh, j.isTrending, j.isToday, j.isVisible
    ]);
    res.status(201).json(mapRow(rows[0]));
  } catch (err) {
    console.error('POST /api/jobs:', err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

// PUT update job
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: ex } = await pool.query('SELECT * FROM jobs WHERE id=$1', [id]);
    if (!ex.length) return res.status(404).json({ message: 'Not found' });
    const j = normalizeJob(req.body, mapRow(ex[0]));
    const { rows } = await pool.query(`
      UPDATE jobs SET
        updatedAt=$1,title=$2,subtitle=$3,description=$4,fullDescription=$5,
        requiredSkills=$6,techStack=$7,aboutCompany=$8,benefits=$9,company=$10,
        companyLogo=$11,location=$12,workMode=$13,qualification=$14,experience=$15,
        salary=$16,type=$17,category=$18,monthTag=$19,applyUrl=$20,applyType=$21,
        expiryDays=$22,processType=$23,mapLocationUrl=$24,isFeatured=$25,isFresh=$26,
        isTrending=$27,isToday=$28,isVisible=$29
      WHERE id=$30 RETURNING *
    `, [
      j.updatedAt, j.title, j.subtitle, j.description, j.fullDescription,
      j.requiredSkills, j.techStack, j.aboutCompany, j.benefits, j.company,
      j.companyLogo, j.location, j.workMode, j.qualification, j.experience,
      j.salary, j.type, j.category, j.monthTag, j.applyUrl, j.applyType,
      j.expiryDays, j.processType, j.mapLocationUrl, j.isFeatured, j.isFresh,
      j.isTrending, j.isToday, j.isVisible, id
    ]);
    res.json(mapRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE job
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM jobs WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all applications
router.get('/applications/all', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM applications ORDER BY appliedAt DESC');
    res.json(rows.map(r => ({
      ...r,
      appliedAt: Number(r.appliedat),
      jobId: r.jobid,
      jobTitle: r.jobtitle,
      companyName: r.companyname
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST apply to job
router.post('/:id/apply', async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { name, email, phone, resume, jobTitle, companyName } = req.body;

    if (!name || !email) return res.status(400).json({ message: 'Missing fields' });

    const id = String(Date.now());
    const appliedAt = Date.now();

    const { rows } = await pool.query(
      `INSERT INTO applications (id, jobId, jobTitle, companyName, name, email, phone, resume, appliedAt) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [id, jobId, jobTitle || 'General Application', companyName || 'Strataply', name, email, phone || '', resume || '', appliedAt]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

// DELETE application
router.delete('/applications/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM applications WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST view job
router.post('/:id/view', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE jobs SET views = COALESCE(views,0)+1 WHERE id=$1 RETURNING views`,
      [req.params.id]
    );
    res.json({ views: rows.length > 0 ? rows[0].views : 0 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;