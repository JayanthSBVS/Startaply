const express = require('express');
const pool = require('../db');

const router = express.Router();

// Initialize table
async function initDb() {
  const query1 = `
    CREATE TABLE IF NOT EXISTS jobs (
      id VARCHAR(50) PRIMARY KEY,
      createdAt BIGINT,
      updatedAt BIGINT,
      title TEXT,
      subtitle TEXT,
      description TEXT,
      fullDescription TEXT,
      requiredSkills TEXT,
      techStack TEXT,
      aboutCompany TEXT,
      benefits TEXT,
      company TEXT,
      companyLogo TEXT,
      companyColor TEXT,
      location TEXT,
      workMode TEXT,
      qualification TEXT,
      experience TEXT,
      salary TEXT,
      type TEXT,
      category TEXT,
      monthTag TEXT,
      applyUrl TEXT,
      applyType TEXT DEFAULT 'external',
      expiryDays INTEGER,
      isFeatured BOOLEAN,
      isTrending BOOLEAN,
      isToday BOOLEAN,
      isVisible BOOLEAN,
      views INTEGER DEFAULT 0
    )
  `;
  const query2 = `
    CREATE TABLE IF NOT EXISTS applications (
      id VARCHAR(50) PRIMARY KEY,
      jobId VARCHAR(50),
      name TEXT,
      email TEXT,
      phone TEXT,
      resume TEXT,
      appliedAt BIGINT
    )
  `;
  const query3 = `
    CREATE TABLE IF NOT EXISTS admins (
      email VARCHAR(255) PRIMARY KEY,
      password VARCHAR(255)
    )
  `;
  try {
    await pool.query(query1);
    await pool.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS applyType TEXT DEFAULT \'external\'');
    await pool.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0');
    await pool.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS isFresh BOOLEAN DEFAULT FALSE');
    await pool.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS benefits TEXT');
    await pool.query(query2);
    await pool.query(query3);

    // Seed default admin
    await pool.query(`
      INSERT INTO admins (email, password) 
      VALUES ('admin@strataply.com', 'admin123') 
      ON CONFLICT (email) DO NOTHING
    `);

    console.log('Database tables ensured');
  } catch (err) {
    console.error('Error creating database tables:', err);
  }
}

initDb();

function normalizeBoolean(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function normalizeJob(body, existing = null) {
  const now = Date.now();

  return {
    id: existing?.id || String(now),
    createdAt: existing?.createdAt || now,
    updatedAt: now,

    title: body.title || '',
    subtitle: body.subtitle || '',
    description: body.description || '',
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
    category: body.category || '',
    monthTag: body.monthTag || '',
    applyUrl: body.applyUrl || '',
    applyType: body.applyType || 'external',

    expiryDays: Number(body.expiryDays || 0),

    isFeatured: normalizeBoolean(body.isFeatured),
    isFresh: normalizeBoolean(body.isFresh),
    isTrending: normalizeBoolean(body.isTrending),
    isToday: normalizeBoolean(body.isToday),
    isVisible: body.isVisible === undefined ? true : normalizeBoolean(body.isVisible),
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
    jobCategory: row.category,
    mode: row.workmode,
  };
}

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT j.*, (SELECT count(*) FROM applications a WHERE a.jobId = j.id) as applicationcount 
      FROM jobs j
    `);

    const now = Date.now();
    let cleaned = [];
    let deleteIds = [];

    for (const row of rows) {
      const job = mapRow(row);
      const expiryDays = job.expiryDays;
      const createdAt = job.createdAt;

      let expired = false;
      if (expiryDays && createdAt) {
        const expiryTime = createdAt + expiryDays * 24 * 60 * 60 * 1000;
        if (now > expiryTime) {
          expired = true;
        }
      }

      if (expired) {
        deleteIds.push(job.id);
      } else {
        cleaned.push(job);
      }
    }

    if (deleteIds.length > 0) {
      await pool.query('DELETE FROM jobs WHERE id = ANY($1::varchar[])', [deleteIds]);
    }

    cleaned.sort((a, b) => b.createdAt - a.createdAt);

    res.json(cleaned);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newJob = normalizeJob(req.body);

    const query = `
      INSERT INTO jobs (
        id, createdAt, updatedAt, title, subtitle, description,
        requiredSkills, techStack, aboutCompany, benefits,
        company, companyLogo, location, workMode, qualification,
        experience, salary, type, category, monthTag,
        applyUrl, applyType, expiryDays,
        isFeatured, isFresh, isTrending, isToday, isVisible
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20,
        $21, $22, $23,
        $24, $25, $26, $27, $28
      ) RETURNING *
    `;
    const values = [
      newJob.id, newJob.createdAt, newJob.updatedAt, newJob.title, newJob.subtitle, newJob.description,
      newJob.requiredSkills, newJob.techStack, newJob.aboutCompany, newJob.benefits,
      newJob.company, newJob.companyLogo, newJob.location, newJob.workMode, newJob.qualification,
      newJob.experience, newJob.salary, newJob.type, newJob.category, newJob.monthTag,
      newJob.applyUrl, newJob.applyType, newJob.expiryDays,
      newJob.isFeatured, newJob.isFresh, newJob.isTrending, newJob.isToday, newJob.isVisible
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(mapRow(rows[0]));
  } catch (err) {
    console.error('POST /jobs error:', err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { rows: existingRows } = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const existingJob = mapRow(existingRows[0]);
    const updatedJob = normalizeJob(req.body, existingJob);

    const query = `
      UPDATE jobs SET
        updatedAt = $1, title = $2, subtitle = $3, description = $4, requiredSkills = $5,
        techStack = $6, aboutCompany = $7, benefits = $8, company = $9, companyLogo = $10,
        location = $11, workMode = $12, qualification = $13, experience = $14, salary = $15,
        type = $16, category = $17, monthTag = $18, applyUrl = $19, applyType = $20, expiryDays = $21,
        isFeatured = $22, isFresh = $23, isTrending = $24, isToday = $25, isVisible = $26
      WHERE id = $27 RETURNING *
    `;

    const values = [
      updatedJob.updatedAt, updatedJob.title, updatedJob.subtitle, updatedJob.description, updatedJob.requiredSkills,
      updatedJob.techStack, updatedJob.aboutCompany, updatedJob.benefits, updatedJob.company, updatedJob.companyLogo,
      updatedJob.location, updatedJob.workMode, updatedJob.qualification, updatedJob.experience, updatedJob.salary,
      updatedJob.type, updatedJob.category, updatedJob.monthTag, updatedJob.applyUrl, updatedJob.applyType, updatedJob.expiryDays,
      updatedJob.isFeatured, updatedJob.isFresh, updatedJob.isTrending, updatedJob.isToday, updatedJob.isVisible, id
    ];

    const { rows: updatedRows } = await pool.query(query, values);
    res.json(mapRow(updatedRows[0]));

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/applications/all', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM applications ORDER BY appliedAt DESC');
    res.json(rows.map(r => ({
      ...r,
      appliedAt: Number(r.appliedat),
      jobId: r.jobid
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM applications WHERE id = $1', [id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/apply', async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { name, email, phone, resume } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const id = String(Date.now());
    const appliedAt = Date.now();

    const query = `
      INSERT INTO applications (
        id, jobId, name, email, phone, resume, appliedAt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const values = [id, jobId, name, email, phone || '', resume, appliedAt];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `UPDATE jobs SET views = COALESCE(views, 0) + 1 WHERE id = $1 RETURNING views`;
    const { rows } = await pool.query(query, [id]);
    res.json({ views: rows.length > 0 ? rows[0].views : 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;