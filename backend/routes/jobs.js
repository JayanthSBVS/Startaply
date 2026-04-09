const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const FILE = path.join(__dirname, '..', 'data', 'jobs.json');

function ensureFile() {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]', 'utf8');
}

function readJobs() {
  ensureFile();
  try {
    const raw = fs.readFileSync(FILE, 'utf8');
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJobs(jobs) {
  ensureFile();
  fs.writeFileSync(FILE, JSON.stringify(jobs, null, 2), 'utf8');
}

function isExpired(job) {
  const expiryDays = Number(job.expiryDays || 0);
  const createdAt = Number(job.createdAt || 0);

  if (!expiryDays || !createdAt) return false;

  const expiryTime = createdAt + expiryDays * 24 * 60 * 60 * 1000;
  return Date.now() > expiryTime;
}

function cleanupExpiredJobs(jobs) {
  return jobs.filter((job) => !isExpired(job));
}

function normalizeBoolean(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function normalizeJob(body, existing = null) {
  const now = Date.now();

  return {
    id: existing?.id || now,
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

    expiryDays: Number(body.expiryDays || 0),

    isFeatured: normalizeBoolean(body.isFeatured),
    isTrending: normalizeBoolean(body.isTrending),
    isToday: normalizeBoolean(body.isToday),
    isVisible: body.isVisible === undefined ? true : normalizeBoolean(body.isVisible),
  };
}

router.get('/', (req, res) => {
  const jobs = readJobs();
  const cleaned = cleanupExpiredJobs(jobs);

  if (cleaned.length !== jobs.length) {
    writeJobs(cleaned);
  }

  res.json(cleaned);
});

router.post('/', (req, res) => {
  const jobs = cleanupExpiredJobs(readJobs());
  const newJob = normalizeJob(req.body);

  jobs.unshift(newJob);
  writeJobs(jobs);

  res.status(201).json(newJob);
});

router.put('/:id', (req, res) => {
  const jobs = cleanupExpiredJobs(readJobs());
  const id = String(req.params.id);

  const index = jobs.findIndex((job) => String(job.id) === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Job not found' });
  }

  jobs[index] = normalizeJob(req.body, jobs[index]);
  writeJobs(jobs);

  res.json(jobs[index]);
});

router.delete('/:id', (req, res) => {
  const jobs = cleanupExpiredJobs(readJobs());
  const id = String(req.params.id);

  const filtered = jobs.filter((job) => String(job.id) !== id);
  writeJobs(filtered);

  res.json({ message: 'Deleted successfully' });
});

module.exports = router;