const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { authMiddleware } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'startaply_super_secret_key_123';

// ── DB INITIALIZATION ─────────────────────────────────────────
async function initEmployersDb() {
  try {
    // 1. Create Employers Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employers (
        id VARCHAR(50) PRIMARY KEY,
        name TEXT NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        company_name TEXT NOT NULL,
        company_id VARCHAR(50),
        phone VARCHAR(50),
        website TEXT,
        logo TEXT,
        location TEXT,
        designation TEXT,
        created_at BIGINT,
        updated_at BIGINT,
        last_login BIGINT
      )
    `);

    // 2. Ensure jobs table has employer columns
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS isEmployerJob BOOLEAN DEFAULT FALSE`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS employerId VARCHAR(50)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_isemployer ON jobs (isEmployerJob)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_employerid ON jobs (employerId)`);

    // 3. Ensure applications table has stage column
    await pool.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS stage VARCHAR(50) DEFAULT 'Under Review'`);

    console.log('Operational DB: Employers table initialized successfully.');
  } catch (err) {
    console.error('Employers DB init error:', err.message);
  }
}
initEmployersDb();

// Helper: Ensure company exists in companies table
async function findOrCreateCompany(companyName, location = '', website = '', logo = '') {
  try {
    if (!companyName || !companyName.trim()) return null;
    const cleanName = companyName.trim();

    // Check if company already exists
    const { rows: existing } = await pool.query(
      'SELECT id FROM companies WHERE LOWER(name) = LOWER($1) LIMIT 1',
      [cleanName]
    );

    if (existing.length > 0) {
      return existing[0].id;
    }

    // Create new company entry
    const newCompanyId = `comp-${Date.now()}`;
    await pool.query(
      `INSERT INTO companies (id, name, industry, logo, location, website, description, createdAt, updatedAt)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        newCompanyId,
        cleanName,
        'Technology & Corporate Services',
        logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=0A66C2&color=fff`,
        location || 'India',
        website || '',
        `Official career opportunities and job openings at ${cleanName}.`,
        Date.now(),
        Date.now()
      ]
    );
    return newCompanyId;
  } catch (err) {
    console.warn('[findOrCreateCompany error]', err.message);
    return null;
  }
}

// ── EMPLOYER SIGNUP ──────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      companyName,
      website = '',
      phone = '',
      location = '',
      designation = 'Hiring Manager',
      logo = ''
    } = req.body;

    if (!name || !email || !password || !companyName) {
      return res.status(400).json({ error: 'Name, work email, password, and company name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is already registered in employers or users table
    const { rows: existingEmp } = await pool.query(
      'SELECT id FROM employers WHERE LOWER(email) = $1 LIMIT 1',
      [normalizedEmail]
    );
    if (existingEmp.length > 0) {
      return res.status(409).json({ error: 'An employer account with this email already exists. Please log in.' });
    }

    const { rows: existingUsers } = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1',
      [normalizedEmail]
    );
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'This email is already associated with an administrator account.' });
    }

    // Resolve or create company record
    const companyId = await findOrCreateCompany(companyName, location, website, logo);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const employerId = `emp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();

    await pool.query(
      `INSERT INTO employers (
        id, name, email, password, company_name, company_id,
        phone, website, logo, location, designation,
        created_at, updated_at, last_login
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        employerId,
        name.trim(),
        normalizedEmail,
        hashedPassword,
        companyName.trim(),
        companyId,
        phone.trim(),
        website.trim(),
        logo.trim(),
        location.trim() || 'India',
        designation.trim(),
        now,
        now,
        now
      ]
    );

    // Issue JWT token
    const token = jwt.sign(
      {
        id: employerId,
        email: normalizedEmail,
        name: name.trim(),
        role: 'employer',
        companyId,
        companyName: companyName.trim()
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Realtime notification
    if (req.io) {
      req.io.emit('DATA_UPDATED', {
        module: 'Employers',
        action: 'signup',
        employer: { id: employerId, name, companyName }
      });
    }

    await logActivity(employerId, name, 'employer', 'Employers', `Employer signed up: ${name} (${companyName})`, employerId).catch(() => {});

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: employerId,
        name: name.trim(),
        email: normalizedEmail,
        role: 'employer',
        companyName: companyName.trim(),
        companyId,
        phone: phone.trim(),
        website: website.trim(),
        logo: logo.trim(),
        location: location.trim() || 'India',
        designation: designation.trim()
      }
    });
  } catch (err) {
    console.error('Employer signup error:', err);
    return res.status(500).json({ error: 'Server error during employer registration.' });
  }
});

// ── EMPLOYER LOGIN ───────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { rows: employers } = await pool.query(
      'SELECT * FROM employers WHERE LOWER(email) = $1 LIMIT 1',
      [normalizedEmail]
    );

    if (employers.length === 0) {
      return res.status(401).json({ error: 'No employer account found with this email. Please sign up.' });
    }

    const employer = employers[0];
    const passwordMatch = await bcrypt.compare(password, employer.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password. Please try again.' });
    }

    const now = Date.now();
    await pool.query('UPDATE employers SET last_login = $1 WHERE id = $2', [now, employer.id]).catch(() => {});

    const token = jwt.sign(
      {
        id: employer.id,
        email: employer.email,
        name: employer.name,
        role: 'employer',
        companyId: employer.company_id,
        companyName: employer.company_name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logActivity(employer.id, employer.name, 'employer', 'Employers', `Employer logged in: ${employer.name}`, employer.id).catch(() => {});

    return res.json({
      success: true,
      token,
      user: {
        id: employer.id,
        name: employer.name,
        email: employer.email,
        role: 'employer',
        companyName: employer.company_name,
        companyId: employer.company_id,
        phone: employer.phone,
        website: employer.website,
        logo: employer.logo,
        location: employer.location,
        designation: employer.designation
      }
    });
  } catch (err) {
    console.error('Employer login error:', err);
    return res.status(500).json({ error: 'Server error during employer login.' });
  }
});

// ── GET CURRENT EMPLOYER PROFILE ─────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Access restricted to employer accounts.' });
    }

    const { rows } = await pool.query(
      `SELECT id, name, email, company_name as "companyName", company_id as "companyId",
              phone, website, logo, location, designation, created_at as "createdAt",
              updated_at as "updatedAt"
       FROM employers WHERE id = $1 LIMIT 1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Employer profile not found.' });
    }

    const emp = rows[0];

    // Fetch company extra details if available
    if (emp.companyId) {
      const { rows: compRows } = await pool.query(
        'SELECT description, logo, website, location FROM companies WHERE id = $1 LIMIT 1',
        [emp.companyId]
      );
      if (compRows.length > 0) {
        emp.companyDescription = compRows[0].description;
        emp.companyLogo = compRows[0].logo || emp.logo;
      }
    }

    return res.json({ ...emp, role: 'employer' });
  } catch (err) {
    console.error('Get employer me error:', err);
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// ── UPDATE EMPLOYER PROFILE ──────────────────────────────────
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Access restricted to employer accounts.' });
    }

    const {
      name,
      phone,
      website,
      logo,
      location,
      designation,
      companyDescription
    } = req.body;

    const now = Date.now();

    const { rows } = await pool.query(
      `UPDATE employers SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        website = COALESCE($3, website),
        logo = COALESCE($4, logo),
        location = COALESCE($5, location),
        designation = COALESCE($6, designation),
        updated_at = $7
       WHERE id = $8
       RETURNING id, name, email, company_name as "companyName", company_id as "companyId",
                 phone, website, logo, location, designation`,
      [
        name ? name.trim() : null,
        phone ? phone.trim() : null,
        website ? website.trim() : null,
        logo ? logo.trim() : null,
        location ? location.trim() : null,
        designation ? designation.trim() : null,
        now,
        req.user.id
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Employer not found.' });
    }

    const updated = rows[0];

    // Also sync to companies table if company exists
    if (updated.companyId) {
      await pool.query(
        `UPDATE companies SET
          logo = COALESCE($1, logo),
          website = COALESCE($2, website),
          location = COALESCE($3, location),
          description = COALESCE($4, description),
          updatedAt = $5
         WHERE id = $6`,
        [
          logo ? logo.trim() : null,
          website ? website.trim() : null,
          location ? location.trim() : null,
          companyDescription ? companyDescription.trim() : null,
          now,
          updated.companyId
        ]
      ).catch(() => {});
    }

    return res.json({ success: true, user: { ...updated, role: 'employer' } });
  } catch (err) {
    console.error('Update employer profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ── GET EMPLOYER STATS ───────────────────────────────────────
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Access restricted to employer accounts.' });
    }

    const employerId = req.user.id;

    // 1. Total & Active Jobs
    const { rows: jobStats } = await pool.query(
      `SELECT
         COUNT(*) as total_jobs,
         COUNT(CASE WHEN isVisible::text = 'true' THEN 1 END) as active_jobs,
         COALESCE(SUM(views), 0) as total_views
       FROM jobs
       WHERE createdByAdminId = $1 OR employerId = $1`,
      [employerId]
    );

    // 2. Total Applicants
    const { rows: appStats } = await pool.query(
      `SELECT
         COUNT(a.id) as total_applicants,
         COUNT(CASE WHEN a.stage = 'Shortlisted' THEN 1 END) as shortlisted,
         COUNT(CASE WHEN a.stage = 'Interviewing' THEN 1 END) as interviewing,
         COUNT(CASE WHEN a.appliedAt >= $2 THEN 1 END) as this_week
       FROM applications a
       JOIN jobs j ON a.jobId = j.id
       WHERE j.createdByAdminId = $1 OR j.employerId = $1`,
      [employerId, Date.now() - 7 * 86400000]
    );

    return res.json({
      totalJobs: Number(jobStats[0]?.total_jobs || 0),
      activeJobs: Number(jobStats[0]?.active_jobs || 0),
      totalViews: Number(jobStats[0]?.total_views || 0),
      totalApplicants: Number(appStats[0]?.total_applicants || 0),
      shortlistedCount: Number(appStats[0]?.shortlisted || 0),
      interviewingCount: Number(appStats[0]?.interviewing || 0),
      applicantsThisWeek: Number(appStats[0]?.this_week || 0)
    });
  } catch (err) {
    console.error('Employer stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
});

// ── GET EMPLOYER JOBS ────────────────────────────────────────
router.get('/jobs', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Access restricted to employer accounts.' });
    }

    const employerId = req.user.id;

    const { rows } = await pool.query(
      `SELECT j.*,
              (SELECT COUNT(*) FROM applications a WHERE a.jobId = j.id) as applicationcount
       FROM jobs j
       WHERE j.createdByAdminId = $1 OR j.employerId = $1
       ORDER BY j.createdAt DESC`,
      [employerId]
    );

    const mapped = rows.map(r => ({
      id: r.id,
      title: r.title,
      subtitle: r.subtitle,
      description: r.description,
      fullDescription: r.fulldescription,
      requiredSkills: r.requiredskills,
      techStack: r.techstack,
      benefits: r.benefits,
      aboutCompany: r.aboutcompany,
      company: r.company,
      companyLogo: r.companylogo,
      companyId: r.companyid,
      location: r.location,
      workMode: r.workmode,
      qualification: r.qualification,
      experience: r.experience,
      salary: r.salary,
      type: r.type,
      category: r.category,
      jobCategoryType: r.jobcategorytype,
      applyType: r.applytype || 'direct',
      applyUrl: r.applyurl || '',
      expiryDays: Number(r.expirydays || 30),
      views: Number(r.views || 0),
      applicationCount: Number(r.applicationcount || 0),
      isVisible: r.isvisible === true || r.isvisible === 'true' || r.isvisible === 1,
      createdAt: Number(r.createdat),
      updatedAt: Number(r.updatedat)
    }));

    return res.json(mapped);
  } catch (err) {
    console.error('Employer get jobs error:', err);
    return res.status(500).json({ error: 'Failed to fetch jobs.' });
  }
});

// ── POST A NEW JOB (BY EMPLOYER) ─────────────────────────────
router.post('/jobs', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Access restricted to employer accounts.' });
    }

    const employerId = req.user.id;

    // Fetch employer info
    const { rows: empRows } = await pool.query(
      'SELECT name, company_name, company_id, logo, location, website FROM employers WHERE id = $1',
      [employerId]
    );
    if (empRows.length === 0) {
      return res.status(404).json({ error: 'Employer not found.' });
    }
    const emp = empRows[0];

    const {
      title,
      subtitle = '',
      description,
      fullDescription = '',
      category = 'Tech',
      jobCategoryType = 'software',
      type = 'Full Time',
      workMode = 'On-site',
      qualification = "Bachelor's Degree",
      experience = '0-2 Years',
      salary = 'Market Standard',
      location = emp.location || 'India',
      requiredSkills = '',
      techStack = '',
      benefits = '',
      aboutCompany = '',
      applyType = 'direct',
      applyUrl = '',
      expiryDays = 30,
      mapLocationUrl = '',
      isVisible = true
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Job title and summary description are required.' });
    }

    const jobId = `job-emp-${Date.now()}`;
    const now = Date.now();

    const insertQuery = `
      INSERT INTO jobs (
        id, createdAt, updatedAt, title, subtitle, description, fullDescription,
        requiredSkills, techStack, aboutCompany, benefits, company, companyLogo,
        location, workMode, qualification, experience, salary, type, category,
        monthTag, applyUrl, applyType, expiryDays, processType, mapLocationUrl,
        isFeatured, isFresh, isTrending, isToday, isVisible,
        jobCategoryType,
        createdByAdminId, createdByAdminName, companyId, isHeroFeatured,
        isEmployerJob, employerId
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38
      ) RETURNING *
    `;

    const values = [
      jobId,
      now,
      now,
      title.trim(),
      subtitle.trim(),
      description.trim(),
      (fullDescription || description).trim(),
      typeof requiredSkills === 'string' ? requiredSkills : Array.isArray(requiredSkills) ? requiredSkills.join(', ') : '',
      typeof techStack === 'string' ? techStack : Array.isArray(techStack) ? techStack.join(', ') : '',
      aboutCompany.trim() || `Working at ${emp.company_name}`,
      benefits.trim() || 'Health insurance, PF, Flexible schedule, Growth opportunities',
      emp.company_name,
      emp.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.company_name)}&background=0A66C2&color=fff`,
      location.trim(),
      workMode,
      qualification,
      experience,
      salary,
      type,
      category,
      new Date().toLocaleString('default', { month: 'short' }),
      applyUrl.trim(),
      applyType,
      Number(expiryDays) || 30,
      'Standard',
      mapLocationUrl.trim(),
      false, // isFeatured
      true,  // isFresh
      false, // isTrending
      true,  // isToday
      isVisible,
      jobCategoryType,
      employerId,
      `${emp.name} (${emp.company_name})`,
      emp.company_id,
      false, // isHeroFeatured
      true,  // isEmployerJob
      employerId
    ];

    const { rows } = await pool.query(insertQuery, values);
    const createdJob = rows[0];

    // Realtime broadcast for feed updates
    if (req.io) {
      req.io.emit('JOB_CREATED', createdJob);
      req.io.emit('DATA_UPDATED', { module: 'Jobs', action: 'create', jobId });
    }

    await logActivity(employerId, emp.name, 'employer', 'Jobs', `Employer posted job: ${title} at ${emp.company_name}`, jobId).catch(() => {});

    return res.status(201).json({
      success: true,
      job: {
        id: createdJob.id,
        title: createdJob.title,
        company: createdJob.company,
        location: createdJob.location,
        type: createdJob.type,
        salary: createdJob.salary,
        createdAt: Number(createdJob.createdat),
        applicationCount: 0
      }
    });
  } catch (err) {
    console.error('Employer post job error:', err);
    return res.status(500).json({ error: 'Failed to post job listing.' });
  }
});

// ── UPDATE A JOB (BY EMPLOYER) ───────────────────────────────
router.put('/jobs/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Access restricted to employer accounts.' });
    }

    const { id } = req.params;
    const employerId = req.user.id;

    // Verify ownership
    const { rows: ex } = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (ex.length === 0) return res.status(404).json({ error: 'Job not found.' });

    const job = ex[0];
    if (job.createdbyadminid !== employerId && job.employerid !== employerId) {
      return res.status(403).json({ error: 'You do not have permission to edit this job.' });
    }

    const {
      title,
      subtitle,
      description,
      fullDescription,
      category,
      jobCategoryType,
      type,
      workMode,
      qualification,
      experience,
      salary,
      location,
      requiredSkills,
      techStack,
      benefits,
      aboutCompany,
      applyType,
      applyUrl,
      expiryDays,
      isVisible
    } = req.body;

    const now = Date.now();

    const { rows } = await pool.query(
      `UPDATE jobs SET
        updatedAt = $1,
        title = COALESCE($2, title),
        subtitle = COALESCE($3, subtitle),
        description = COALESCE($4, description),
        fullDescription = COALESCE($5, fullDescription),
        category = COALESCE($6, category),
        jobCategoryType = COALESCE($7, jobCategoryType),
        type = COALESCE($8, type),
        workMode = COALESCE($9, workMode),
        qualification = COALESCE($10, qualification),
        experience = COALESCE($11, experience),
        salary = COALESCE($12, salary),
        location = COALESCE($13, location),
        requiredSkills = COALESCE($14, requiredSkills),
        techStack = COALESCE($15, techStack),
        benefits = COALESCE($16, benefits),
        aboutCompany = COALESCE($17, aboutCompany),
        applyType = COALESCE($18, applyType),
        applyUrl = COALESCE($19, applyUrl),
        expiryDays = COALESCE($20, expiryDays),
        isVisible = COALESCE($21, isVisible)
       WHERE id = $22
       RETURNING *`,
      [
        now,
        title !== undefined ? title.trim() : null,
        subtitle !== undefined ? subtitle.trim() : null,
        description !== undefined ? description.trim() : null,
        fullDescription !== undefined ? fullDescription.trim() : null,
        category !== undefined ? category : null,
        jobCategoryType !== undefined ? jobCategoryType : null,
        type !== undefined ? type : null,
        workMode !== undefined ? workMode : null,
        qualification !== undefined ? qualification : null,
        experience !== undefined ? experience : null,
        salary !== undefined ? salary : null,
        location !== undefined ? location.trim() : null,
        requiredSkills !== undefined ? requiredSkills : null,
        techStack !== undefined ? techStack : null,
        benefits !== undefined ? benefits : null,
        aboutCompany !== undefined ? aboutCompany : null,
        applyType !== undefined ? applyType : null,
        applyUrl !== undefined ? applyUrl.trim() : null,
        expiryDays !== undefined ? Number(expiryDays) : null,
        isVisible !== undefined ? isVisible : null,
        id
      ]
    );

    if (req.io) {
      req.io.emit('DATA_UPDATED', { module: 'Jobs', action: 'update', jobId: id });
    }

    return res.json({ success: true, job: rows[0] });
  } catch (err) {
    console.error('Employer update job error:', err);
    return res.status(500).json({ error: 'Failed to update job.' });
  }
});

// ── DELETE A JOB (BY EMPLOYER) ───────────────────────────────
router.delete('/jobs/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Access restricted to employer accounts.' });
    }

    const { id } = req.params;
    const employerId = req.user.id;

    const { rows: ex } = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (ex.length === 0) return res.status(404).json({ error: 'Job not found.' });

    const job = ex[0];
    if (job.createdbyadminid !== employerId && job.employerid !== employerId) {
      return res.status(403).json({ error: 'You do not have permission to delete this job.' });
    }

    await pool.query('DELETE FROM jobs WHERE id = $1', [id]);

    if (req.io) {
      req.io.emit('DATA_UPDATED', { module: 'Jobs', action: 'delete', jobId: id });
    }

    return res.json({ success: true, message: 'Job deleted successfully.' });
  } catch (err) {
    console.error('Employer delete job error:', err);
    return res.status(500).json({ error: 'Failed to delete job.' });
  }
});

// ── GET APPLICANTS (FOR EMPLOYER'S JOBS) ──────────────────────
router.get('/applicants', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Access restricted to employer accounts.' });
    }

    const employerId = req.user.id;

    const { rows } = await pool.query(
      `SELECT a.*,
              COALESCE(a.stage, 'Under Review') as stage,
              j.title as "jobTitle",
              j.location as "jobLocation",
              j.type as "jobType"
       FROM applications a
       JOIN jobs j ON a.jobId = j.id
       WHERE j.createdByAdminId = $1 OR j.employerId = $1
       ORDER BY a.appliedAt DESC`,
      [employerId]
    );

    return res.json(rows.map(r => ({
      id: r.id,
      jobId: r.jobid,
      jobTitle: r.jobTitle || r.jobtitle,
      jobLocation: r.jobLocation,
      jobType: r.jobType,
      name: r.name,
      email: r.email,
      phone: r.phone,
      resume: r.resume,
      city: r.city,
      vehicleStatus: r.vehiclestatus,
      subId: r.subid,
      payrollStatus: r.payrollstatus,
      stage: r.stage || 'Under Review',
      appliedAt: Number(r.appliedat)
    })));
  } catch (err) {
    console.error('Employer get applicants error:', err);
    return res.status(500).json({ error: 'Failed to fetch applicants.' });
  }
});

// ── UPDATE APPLICANT STAGE (BY EMPLOYER) ──────────────────────
router.put('/applicants/:id/stage', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Access restricted to employer accounts.' });
    }

    const { id } = req.params;
    const { stage } = req.body;
    const employerId = req.user.id;

    if (!stage) {
      return res.status(400).json({ error: 'Stage is required.' });
    }

    // Verify applicant belongs to a job posted by this employer
    const { rows: appRows } = await pool.query(
      `SELECT a.id, a.jobId, j.createdByAdminId, j.employerId
       FROM applications a
       JOIN jobs j ON a.jobId = j.id
       WHERE a.id = $1`,
      [id]
    );

    if (appRows.length === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const app = appRows[0];
    if (app.createdbyadminid !== employerId && app.employerid !== employerId) {
      return res.status(403).json({ error: 'You do not have permission to manage this applicant.' });
    }

    await pool.query('UPDATE applications SET stage = $1 WHERE id = $2', [stage, id]);

    if (req.io) {
      req.io.emit('DATA_UPDATED', { module: 'Applications', action: 'stage_update', applicationId: id, stage });
    }

    return res.json({ success: true, stage });
  } catch (err) {
    console.error('Employer update applicant stage error:', err);
    return res.status(500).json({ error: 'Failed to update applicant stage.' });
  }
});

module.exports = router;
