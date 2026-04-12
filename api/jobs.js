const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

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
        expiryDays INTEGER, isFeatured BOOLEAN, isTrending BOOLEAN,
        isToday BOOLEAN, isVisible BOOLEAN, views INTEGER DEFAULT 0
      )
    `);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS applyType TEXT DEFAULT 'external'`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS isFresh BOOLEAN DEFAULT FALSE`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(50) PRIMARY KEY, jobId VARCHAR(50),
        name TEXT, email TEXT, phone TEXT, resume TEXT, appliedAt BIGINT
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        email VARCHAR(255) PRIMARY KEY, password VARCHAR(255)
      )
    `);
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

// GET all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT j.*, (SELECT count(*) FROM applications a WHERE a.jobId = j.id) as applicationcount
      FROM jobs j
    `);
    const now = Date.now();
    let cleaned = [], deleteIds = [];
    for (const row of rows) {
      const job = mapRow(row);
      const expired = job.expiryDays && job.createdAt &&
        (now > job.createdAt + job.expiryDays * 86400000);
      if (expired) deleteIds.push(job.id);
      else cleaned.push(job);
    }
    if (deleteIds.length > 0)
      await pool.query('DELETE FROM jobs WHERE id = ANY($1::varchar[])', [deleteIds]);
    cleaned.sort((a, b) => b.createdAt - a.createdAt);
    res.json(cleaned);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

// POST create job
app.post('/api/jobs', async (req, res) => {
  try {
    const j = normalizeJob(req.body);
    const { rows } = await pool.query(`
      INSERT INTO jobs (
        id,createdAt,updatedAt,title,subtitle,description,fullDescription,
        requiredSkills,techStack,aboutCompany,benefits,company,companyLogo,
        location,workMode,qualification,experience,salary,type,category,
        monthTag,applyUrl,applyType,expiryDays,isFeatured,isFresh,isTrending,isToday,isVisible
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)
      RETURNING *
    `, [
      j.id,j.createdAt,j.updatedAt,j.title,j.subtitle,j.description,j.fullDescription,
      j.requiredSkills,j.techStack,j.aboutCompany,j.benefits,j.company,j.companyLogo,
      j.location,j.workMode,j.qualification,j.experience,j.salary,j.type,j.category,
      j.monthTag,j.applyUrl,j.applyType,j.expiryDays,j.isFeatured,j.isFresh,j.isTrending,j.isToday,j.isVisible
    ]);
    res.status(201).json(mapRow(rows[0]));
  } catch (err) {
    console.error('POST /api/jobs:', err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

// PUT update job
app.put('/api/jobs/:id', async (req, res) => {
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
        expiryDays=$22,isFeatured=$23,isFresh=$24,isTrending=$25,isToday=$26,isVisible=$27
      WHERE id=$28 RETURNING *
    `, [
      j.updatedAt,j.title,j.subtitle,j.description,j.fullDescription,
      j.requiredSkills,j.techStack,j.aboutCompany,j.benefits,j.company,
      j.companyLogo,j.location,j.workMode,j.qualification,j.experience,
      j.salary,j.type,j.category,j.monthTag,j.applyUrl,j.applyType,
      j.expiryDays,j.isFeatured,j.isFresh,j.isTrending,j.isToday,j.isVisible,id
    ]);
    res.json(mapRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE job
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM jobs WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all applications
app.get('/api/jobs/applications/all', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM applications ORDER BY appliedAt DESC');
    res.json(rows.map(r => ({ ...r, appliedAt: Number(r.appliedat), jobId: r.jobid })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST apply to job
app.post('/api/jobs/:id/apply', async (req, res) => {
  try {
    const { name, email, phone, resume } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Missing fields' });
    const id = String(Date.now());
    const { rows } = await pool.query(
      `INSERT INTO applications (id,jobId,name,email,phone,resume,appliedAt) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, req.params.id, name, email, phone || '', resume, Date.now()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST view job
app.post('/api/jobs/:id/view', async (req, res) => {
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

module.exports = app;
