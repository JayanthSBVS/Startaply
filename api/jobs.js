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

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'strataply_super_secret_key_123';

// ── MIDDLEWARE ───────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) { res.status(401).json({ error: 'Auth failed' }); }
};

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
        createdByAdminId TEXT,
        createdByAdminName TEXT
      )
    `);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS createdByAdminId TEXT`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS createdByAdminName TEXT`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS applyType TEXT DEFAULT 'external'`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS isFresh BOOLEAN DEFAULT FALSE`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS govtJobType TEXT`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS stateName TEXT`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS jobCategoryType TEXT`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS mapLocationUrl TEXT`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS processType TEXT DEFAULT 'Standard'`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(50) PRIMARY KEY, jobId VARCHAR(50),
        name TEXT, email TEXT, phone TEXT, resume TEXT, appliedAt BIGINT
      )
    `);
    await pool.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS jobTitle TEXT`);
    await pool.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS companyName TEXT`);
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

initDb();

// ── HELPERS ──────────────────────────────────────────────
function nb(v) { return v === true || v === 'true' || v === 1 || v === '1'; }

function normalizeJob(body, existing = null, adminUser = null) {
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
    govtJobType: body.govtJobType || '',
    stateName: body.stateName || '',
    jobCategoryType: body.jobCategoryType || '',
    mapLocationUrl: body.mapLocationUrl || '',
    processType: body.processType || 'Standard',
    createdByAdminId: existing?.createdByAdminId || adminUser?.id || 'unknown',
    createdByAdminName: existing?.createdByAdminName || adminUser?.name || 'unknown'
  };
}

function mapRow(r) {
  if (!r) return null;
  return {
    ...r,
    createdAt: Number(r.createdat),
    updatedAt: Number(r.updatedat),
    isFeatured: nb(r.isfeatured),
    isFresh: nb(r.isfresh),
    isTrending: nb(r.istrending),
    isToday: nb(r.istoday),
    isVisible: nb(r.isvisible),
    expiryDays: Number(r.expirydays || 0),
    views: Number(r.views || 0),
    applicationCount: Number(r.applicationcount || 0),
    createdByAdminId: r.createdbyadminid,
    createdByAdminName: r.createdbyadminname
  };
}

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

// GET all jobs for admin (no expiry filtering + role filtering)
app.get('/api/jobs/admin/list', authMiddleware, async (req, res) => {
  try {
    let query = `
      SELECT j.*, (SELECT count(*) FROM applications a WHERE a.jobId = j.id) as applicationcount
      FROM jobs j
    `;
    let params = [];

    // Filter by admin ID if role is admin (not manager)
    if (req.user.role === 'admin') {
      query += ` WHERE j.createdByAdminId = $1`;
      params.push(req.user.id);
    }

    query += ` ORDER BY j.createdat DESC`;
    
    const { rows } = await pool.query(query, params);
    res.json(rows.map(mapRow));
  } catch (err) {
    console.error('Admin list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all jobs (public with expiry filtering)
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
app.post('/api/jobs', authMiddleware, async (req, res) => {
  try {
    const j = normalizeJob(req.body, null, req.user);
    const { rows } = await pool.query(`
      INSERT INTO jobs (
        id,createdAt,updatedAt,title,subtitle,description,fullDescription,
        requiredSkills,techStack,aboutCompany,benefits,company,companyLogo,
        location,workMode,qualification,experience,salary,type,category,
        monthTag,applyUrl,applyType,expiryDays,isFeatured,isFresh,isTrending,isToday,isVisible,
        govtJobType,stateName,jobCategoryType,mapLocationUrl,processType,
        createdByAdminId, createdByAdminName
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36)
      RETURNING *
    `, [
      j.id,j.createdAt,j.updatedAt,j.title,j.subtitle,j.description,j.fullDescription,
      j.requiredSkills,j.techStack,j.aboutCompany,j.benefits,j.company,j.companyLogo,
      j.location,j.workMode,j.qualification,j.experience,j.salary,j.type,j.category,
      j.monthTag,j.applyUrl,j.applyType,j.expiryDays,j.isFeatured,j.isFresh,j.isTrending,j.isToday,j.isVisible,
      j.govtJobType,j.stateName,j.jobCategoryType,j.mapLocationUrl,j.processType,
      j.createdByAdminId, j.createdByAdminName
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
    const { rows: ex } = await pool.query('SELECT * FROM jobs WHERE id=$1', [id]);
    if (!ex.length) return res.status(404).json({ message: 'Not found' });
    
    // Check ownership if not manager
    const existingJob = mapRow(ex[0]);
    if (req.user.role === 'admin' && existingJob.createdByAdminId !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied: This job belongs to another admin' });
    }

    const j = normalizeJob(req.body, existingJob, req.user);
    const { rows } = await pool.query(`
      UPDATE jobs SET
        updatedAt=$1,title=$2,subtitle=$3,description=$4,fullDescription=$5,
        requiredSkills=$6,techStack=$7,aboutCompany=$8,benefits=$9,company=$10,
        companyLogo=$11,location=$12,workMode=$13,qualification=$14,experience=$15,
        salary=$16,type=$17,category=$18,monthTag=$19,applyUrl=$20,applyType=$21,
        expiryDays=$22,isFeatured=$23,isFresh=$24,isTrending=$25,isToday=$26,isVisible=$27,
        govtJobType=$28,stateName=$29,jobCategoryType=$30,mapLocationUrl=$31,processType=$32,
        createdByAdminId=$33, createdByAdminName=$34
      WHERE id=$35 RETURNING *
    `, [
      j.updatedAt,j.title,j.subtitle,j.description,j.fullDescription,
      j.requiredSkills,j.techStack,j.aboutCompany,j.benefits,j.company,
      j.companyLogo,j.location,j.workMode,j.qualification,j.experience,
      j.salary,j.type,j.category,j.monthTag,j.applyUrl,j.applyType,
      j.expiryDays,j.isFeatured,j.isFresh,j.isTrending,j.isToday,j.isVisible,
      j.govtJobType,j.stateName,j.jobCategoryType,j.mapLocationUrl,j.processType,
      j.createdByAdminId, j.createdByAdminName, id
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
