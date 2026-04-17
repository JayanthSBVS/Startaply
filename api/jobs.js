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
        isToday BOOLEAN, isVisible BOOLEAN, views INTEGER DEFAULT 0,
        govtJobType TEXT, stateName TEXT, jobCategoryType TEXT,
        mapLocationUrl TEXT, processType TEXT DEFAULT 'Standard',
        createdByAdminId TEXT
      )
    `);
    
    // Migrations
    const cols = ['applyType', 'views', 'isFresh', 'govtJobType', 'stateName', 'jobCategoryType', 'mapLocationUrl', 'processType', 'createdByAdminId'];
    for (const col of cols) {
      await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ${col} TEXT`);
    }
    await pool.query(`ALTER TABLE jobs ALTER COLUMN applyType SET DEFAULT 'external'`);
    await pool.query(`ALTER TABLE jobs ALTER COLUMN views SET DEFAULT 0`);
    await pool.query(`ALTER TABLE jobs ALTER COLUMN isVisible SET DEFAULT true`);
    
    // Data Migration: Assign existing jobs to Jayanth if they have no owner
    await pool.query(`UPDATE jobs SET createdByAdminId = 'admin_jayanth' WHERE createdByAdminId IS NULL OR createdByAdminId = ''`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(50) PRIMARY KEY, jobId VARCHAR(50),
        name TEXT, email TEXT, phone TEXT, resume TEXT, appliedAt BIGINT,
        jobTitle TEXT, companyName TEXT
      )
    `);
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

initDb();

// ── HELPERS ──────────────────────────────────────────────
function nb(v) { return v === true || v === 'true' || v === 1 || v === '1'; }

function normalizeJob(body, existing = null, adminId = null) {
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
  // Handle PostgreSQL lowercase column mapping
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
    createdByAdminId: r.createdbyadminid || r.createdByAdminId || ''
  };
}

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

// ── ROUTES ───────────────────────────────────────────────

// POST increment view
app.post('/api/jobs/:id/view', async (req, res) => {
  try {
    await pool.query('UPDATE jobs SET views = COALESCE(views, 0) + 1 WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// GET search suggestions (titles and companies)
app.get('/api/jobs/search/suggestions', async (req, res) => {
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

// GET all jobs for admin (no expiry filtering, handles ownership)
app.get('/api/jobs/admin/list', authMiddleware, async (req, res) => {
  try {
    const isManager = req.user.role === 'manager';
    let query = `
      SELECT j.*, (SELECT count(*) FROM applications a WHERE a.jobId = j.id) as applicationcount
      FROM jobs j
    `;
    let params = [];
    
    if (!isManager) {
      query += ` WHERE j.createdByAdminId = $1`;
      params.push(req.user.id);
    }
    
    query += ` ORDER BY j.createdat DESC`;
    
    const { rows } = await pool.query(query, params);
    res.json(rows.map(mapRow));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all jobs (public with expiry filtering)
app.get('/api/jobs', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT j.*, (SELECT count(*) FROM applications a WHERE a.jobId = j.id) as applicationcount
      FROM jobs j
      WHERE j.isVisible = true
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
app.post('/api/jobs', authMiddleware, async (req, res) => {
  try {
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
      j.id,j.createdAt,j.updatedAt,j.title,j.subtitle,j.description,j.fullDescription,
      j.requiredSkills,j.techStack,j.aboutCompany,j.benefits,j.company,j.companyLogo,
      j.location,j.workMode,j.qualification,j.experience,j.salary,j.type,j.category,
      j.monthTag,j.applyUrl,j.applyType,j.expiryDays,j.isFeatured,j.isFresh,j.isTrending,j.isToday,j.isVisible,
      j.govtJobType,j.stateName,j.jobCategoryType,j.mapLocationUrl,j.processType,j.createdByAdminId
    ]);
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
    const isManager = req.user.role === 'manager';
    const { rows: ex } = await pool.query('SELECT * FROM jobs WHERE id=$1', [id]);
    if (!ex.length) return res.status(404).json({ message: 'Not found' });
    
    const existingJob = mapRow(ex[0]);
    if (!isManager && existingJob.createdByAdminId !== req.user.id) {
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
      j.updatedAt,j.title,j.subtitle,j.description,j.fullDescription,
      j.requiredSkills,j.techStack,j.aboutCompany,j.benefits,j.company,
      j.companyLogo,j.location,j.workMode,j.qualification,j.experience,
      j.salary,j.type,j.category,j.monthTag,j.applyUrl,j.applyType,
      j.expiryDays,j.isFeatured,j.isFresh,j.isTrending,j.isToday,j.isVisible,
      j.govtJobType,j.stateName,j.jobCategoryType,j.mapLocationUrl,j.processType,
      j.createdByAdminId, id
    ]);
    res.json(mapRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE job
app.delete('/api/jobs/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const isManager = req.user.role === 'manager';
    const { rows: ex } = await pool.query('SELECT createdByAdminId FROM jobs WHERE id=$1', [id]);
    if (ex.length && !isManager && ex[0].createdbyadminid !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own jobs' });
    }
    await pool.query('DELETE FROM jobs WHERE id=$1', [id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all applications
app.get('/api/jobs/applications/all', async (req, res) => {
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

const nodemailer = require('nodemailer');

// POST apply to job
app.post('/api/jobs/:id/apply', async (req, res) => {
  try {
    const { name, email, phone, resume, jobTitle, companyName } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Missing fields' });
    const id = String(Date.now());
    
    // Using a mocked ethereal transport OR console.log for dummy emails right now as requested.
    // Replace with real transport later
    async function sendMail() {
      try {
        let transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER || 'dummy@ethereal.email', 
            pass: process.env.EMAIL_PASS || 'dummy-pass'
          }
        });
        
        let info = await transporter.sendMail({
          from: '"Startaply Demo" <demo@startaply.com>', 
          to: email, 
          subject: `Application Received: ${jobTitle || 'Job'} at ${companyName || 'our partner company'}`, 
          text: `Hi ${name},\n\nWe have received your application for the ${jobTitle || 'Job'} role at ${companyName || 'our partner company'}.\n\nThank you for applying through Startaply!\n\nBest,\nStartaply Team`,
          html: `<p>Hi ${name},</p><p>We have received your application for the <b>${jobTitle || 'Job'}</b> role at <b>${companyName || 'our partner company'}</b>.</p><p>Thank you for applying through Startaply!</p><p>Best,<br>Startaply Team</p>`
        });
        
        console.log("Email Dummy Sent: %s", info.messageId);
      } catch (e) {
        console.error("Nodemailer error (dummy expected):", e.message);
      }
    }

    sendMail();

    const { rows } = await pool.query(
      `INSERT INTO applications (id,jobId,name,email,phone,resume,appliedAt, jobTitle, companyName) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [id, req.params.id, name, email, phone || '', resume, Date.now(), jobTitle || '', companyName || '']
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
