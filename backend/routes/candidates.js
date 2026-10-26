const express = require('express');
const pool = require('../db');
const { authMiddleware } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logger');
const { getGovernanceSummary, purgeInactiveCandidates } = require('../utils/accountGovernance');

const router = express.Router();

/**
 * Staff Access Guard:
 * Only authenticated administrative roles (Manager, Operational Manager, Operational Executive)
 * are permitted to view or manage the candidate roster.
 */
const staffAccessMiddleware = (req, res, next) => {
  const staffRoles = ['manager', 'operational_manager', 'operational_executive', 'admin'];
  if (req.user && staffRoles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ error: 'Access denied: Administrative privileges required' });
};

/**
 * GET /api/candidates/stats
 * Aggregate metrics across all candidate domains for executive dashboards
 */
router.get('/stats', authMiddleware, staffAccessMiddleware, async (req, res) => {
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
      else if (r.career_track === 'non-it') stats.nonIt = r.count;
      else if (r.career_track === 'gig') stats.gig = r.count;
      else if (r.career_track === 'others') stats.others = r.count;
    });

    res.json(stats);
  } catch (err) {
    console.error('[Candidates Stats Error]', err.message);
    res.status(500).json({ error: 'Failed to retrieve candidate statistics' });
  }
});

/**
 * GET /api/candidates
 * Retrieve candidate roster with multi-field search and domain filtering
 */
router.get('/', authMiddleware, staffAccessMiddleware, async (req, res) => {
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
        status, avatar, last_login as "lastLogin", created_at as "createdAt",
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

    const [rowsRes, countRes] = await Promise.all([
      pool.query(query, [searchParam, trackParam, statusParam, parseInt(limit, 10), offset]),
      pool.query(countQuery, [searchParam, trackParam, statusParam])
    ]);

    res.json({
      candidates: rowsRes.rows,
      total: countRes.rows[0]?.total || 0,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });
  } catch (err) {
    console.error('[Candidates List Error]', err.message);
    res.status(500).json({ error: 'Failed to retrieve candidates list' });
  }
});

/**
 * GET /api/candidates/:id
 * Retrieve individual candidate profile with full preference metadata
 */
router.get('/:id', authMiddleware, staffAccessMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`
      SELECT 
        id, name, email, phone, city, linkedin_url as "linkedinUrl",
        whatsapp_sync as "whatsappSync", career_track as "careerTrack",
        sub_track as "subTrack", qualification, skills, preferences,
        status, avatar, last_login as "lastLogin", created_at as "createdAt",
        updated_at as "updatedAt"
      FROM candidates 
      WHERE id = $1
    `, [id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('[Candidate Detail Error]', err.message);
    res.status(500).json({ error: 'Failed to retrieve candidate profile' });
  }
});

/**
 * PUT /api/candidates/:id/status
 * Update candidate status (e.g., REGISTERED, SHORTLISTED, VERIFIED, PLACED)
 */
router.put('/:id/status', authMiddleware, staffAccessMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['REGISTERED', 'VERIFIED', 'SHORTLISTED', 'PLACED', 'SUSPENDED'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid candidate status' });
    }

    const { rows } = await pool.query(`
      UPDATE candidates 
      SET status = $1, updated_at = $2 
      WHERE id = $3 
      RETURNING id, name, email, status, updated_at as "updatedAt"
    `, [status, Date.now(), id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const updated = rows[0];

    // Audit Logging & Realtime Broadcast
    await logActivity(
      req.user.id,
      req.user.name,
      req.user.role,
      'Candidates',
      `Updated status for ${updated.name} to ${status}`,
      id
    ).catch(() => {});

    if (req.io) {
      req.io.emit('DATA_UPDATED', {
        module: 'Candidates',
        action: 'status_updated',
        candidateId: id,
        status
      });
    }

    res.json({ success: true, candidate: updated });
  } catch (err) {
    console.error('[Update Candidate Status Error]', err.message);
    res.status(500).json({ error: 'Failed to update candidate status' });
  }
});

/**
 * DELETE /api/candidates/:id
 * Delete a candidate profile (Manager / Operational Manager only)
 */
router.delete('/:id', authMiddleware, staffAccessMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    // Restrict deletion to manager and operational_manager
    if (req.user.role !== 'manager' && req.user.role !== 'operational_manager') {
      return res.status(403).json({ error: 'Unauthorized: Operational Manager privilege required to delete candidate records' });
    }

    const { rows } = await pool.query('DELETE FROM candidates WHERE id = $1 RETURNING id, name, email', [id]);
    if (!rows.length) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const deleted = rows[0];

    await logActivity(
      req.user.id,
      req.user.name,
      req.user.role,
      'Candidates',
      `Deleted candidate record: ${deleted.name} (${deleted.email})`,
      id
    ).catch(() => {});

    if (req.io) {
      req.io.emit('DATA_UPDATED', { module: 'Candidates', action: 'deleted', candidateId: id });
    }

    res.json({ success: true, message: `Candidate ${deleted.name} successfully removed` });
  } catch (err) {
    console.error('[Delete Candidate Error]', err.message);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

/**
 * GET /api/candidates/governance/summary
 * Returns 60-day account governance metrics & inactivity counts
 */
router.get('/governance/summary', authMiddleware, staffAccessMiddleware, async (req, res) => {
  try {
    const summary = await getGovernanceSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve governance summary' });
  }
});

/**
 * POST /api/candidates/governance/purge
 * Triggers manual 60-day inactive candidate purge (Operational Managers only)
 */
router.post('/governance/purge', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'operational_manager') {
      return res.status(403).json({ error: 'Forbidden: Operational Manager authorization required' });
    }

    const dryRun = req.query.dryRun === 'true' || req.body.dryRun === true;
    const result = await purgeInactiveCandidates({
      dryRun,
      io: req.io,
      triggeredBy: req.user.id
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to execute candidate purge' });
  }
});

module.exports = router;
