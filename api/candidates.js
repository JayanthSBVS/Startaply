const express = require('express');
const cors = require('cors');
const { getPool } = require('./db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'startaply_super_secret_key_123';
const pool = getPool();

const app = express();
app.use(cors());
app.use(express.json());

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) { res.status(401).json({ error: 'Auth failed' }); }
};

const staffAccessMiddleware = (req, res, next) => {
  const staffRoles = ['manager', 'operational_manager', 'operational_executive', 'admin', 'executive'];
  if (req.user && staffRoles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ error: 'Access denied: Administrative privileges required' });
};

// GET candidate stats
app.get(['/api/candidates/stats', '/stats'], authMiddleware, staffAccessMiddleware, async (req, res) => {
  try {
    const totalQuery = pool.query('SELECT COUNT(*)::int as count FROM candidates');
    const trackQuery = pool.query(`
      SELECT career_track, COUNT(*)::int as count
      FROM candidates
      GROUP BY career_track
    `);
    const todayQuery = pool.query(`
      SELECT COUNT(*)::int as count
      FROM candidates
      WHERE created_at >= $1
    `, [Date.now() - 86400000]);

    const [totalRes, trackRes, todayRes] = await Promise.all([totalQuery, trackQuery, todayQuery]);

    const stats = {
      total: totalRes.rows[0]?.count || 0,
      today: todayRes.rows[0]?.count || 0,
      it: 0,
      nonIt: 0,
      gig: 0,
      others: 0
    };

    trackRes.rows.forEach(r => {
      if (r.career_track === 'it') stats.it = r.count;
      else if (r.career_track === 'non-it' || r.career_track === 'nonit') stats.nonIt = r.count;
      else if (r.career_track === 'gig') stats.gig = r.count;
      else if (r.career_track === 'others') stats.others = r.count;
    });

    res.json(stats);
  } catch (err) {
    console.error('[Candidates Stats Error]', err.message);
    res.status(500).json({ error: 'Failed to retrieve candidate statistics' });
  }
});

// GET candidate roster
app.get(['/api/candidates', '/'], authMiddleware, staffAccessMiddleware, async (req, res) => {
  try {
    const { search, track, status, page = 1, limit = 100 } = req.query;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const searchParam = search && search.trim() ? `%${search.trim()}%` : null;
    const trackParam = track && track.trim() && track !== 'all' ? track.trim() : null;
    const statusParam = status && status.trim() && status !== 'all' ? status.trim() : null;

    const query = `
      SELECT
        id, name, email, phone, city, linkedin_url as "linkedinUrl",
        whatsapp_sync as "whatsappSync", career_track as "careerTrack",
        sub_track as "subTrack", qualification, skills, preferences,
        status, last_login as "lastLogin", created_at as "createdAt",
        updated_at as "updatedAt"
      FROM candidates
      WHERE
        ($1::text IS NULL OR name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1 OR city ILIKE $1 OR skills ILIKE $1)
        AND ($2::text IS NULL OR career_track = $2)
        AND ($3::text IS NULL OR status = $3)
      ORDER BY created_at DESC
      LIMIT $4 OFFSET $5
    `;

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM candidates
      WHERE
        ($1::text IS NULL OR name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1 OR city ILIKE $1 OR skills ILIKE $1)
        AND ($2::text IS NULL OR career_track = $2)
        AND ($3::text IS NULL OR status = $3)
    `;

    const [dataRes, countRes] = await Promise.all([
      pool.query(query, [searchParam, trackParam, statusParam, parseInt(limit, 10), offset]),
      pool.query(countQuery, [searchParam, trackParam, statusParam])
    ]);

    res.json({
      candidates: dataRes.rows,
      total: countRes.rows[0]?.total || 0,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });
  } catch (err) {
    console.error('[Candidates Roster Error]', err.message);
    res.status(500).json({ error: 'Failed to retrieve candidate roster' });
  }
});

// PATCH candidate status
app.patch(['/api/candidates/:id/status', '/:id/status'], authMiddleware, staffAccessMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['REGISTERED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'HIRED', 'REJECTED', 'INACTIVE'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid candidate workflow status' });
    }

    const { rows } = await pool.query(
      'UPDATE candidates SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *',
      [status, Date.now(), id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Candidate record not found' });
    }

    res.json({ success: true, candidate: rows[0] });
  } catch (err) {
    console.error('[Update Candidate Status Error]', err.message);
    res.status(500).json({ error: 'Failed to update candidate status' });
  }
});

module.exports = app;
