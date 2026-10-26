const pool = require('../db');
const { logActivity } = require('./logger');

const INACTIVITY_THRESHOLD_DAYS = 60;
const INACTIVITY_THRESHOLD_MS = INACTIVITY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000; // 60 days in ms
const WARNING_THRESHOLD_DAYS = 53;
const WARNING_THRESHOLD_MS = WARNING_THRESHOLD_DAYS * 24 * 60 * 60 * 1000; // 53 days in ms

// In-memory throttle for candidate activity touches (at most once every 30 minutes)
const touchThrottle = new Map();

// Track governance metrics
let lastPurgeReport = {
  executedAt: null,
  purgedCount: 0,
  purgedIds: [],
  status: 'idle'
};

/**
 * Throttled activity stamp for active candidates
 */
async function touchCandidateActivity(candidateId) {
  if (!candidateId) return;
  const now = Date.now();
  const lastTouch = touchThrottle.get(candidateId) || 0;
  
  // Throttle to at most once every 30 minutes
  if (now - lastTouch < 30 * 60 * 1000) return;
  
  touchThrottle.set(candidateId, now);
  
  // Cleanup throttle map to prevent memory growth
  if (touchThrottle.size > 10000) {
    const cutoff = now - 60 * 60 * 1000;
    for (const [id, ts] of touchThrottle.entries()) {
      if (ts < cutoff) touchThrottle.delete(id);
    }
  }

  try {
    await pool.query(
      'UPDATE candidates SET last_active_at = $1 WHERE id = $2',
      [now, candidateId]
    );
  } catch (err) {
    // Non-fatal background activity touch
  }
}

/**
 * Fetches inactive account governance summary
 */
async function getGovernanceSummary() {
  const now = Date.now();
  const purgeCutoff = now - INACTIVITY_THRESHOLD_MS;
  const warningCutoff = now - WARNING_THRESHOLD_MS;

  try {
    const totalRes = await pool.query('SELECT COUNT(*)::int as count FROM candidates');
    const totalCandidates = totalRes.rows[0]?.count || 0;

    const purgeEligibleRes = await pool.query(`
      SELECT COUNT(*)::int as count 
      FROM candidates 
      WHERE COALESCE(last_active_at, last_login, updated_at, created_at) < $1
    `, [purgeCutoff]);
    const eligibleCount = purgeEligibleRes.rows[0]?.count || 0;

    const atRiskRes = await pool.query(`
      SELECT COUNT(*)::int as count 
      FROM candidates 
      WHERE COALESCE(last_active_at, last_login, updated_at, created_at) >= $1
        AND COALESCE(last_active_at, last_login, updated_at, created_at) < $2
    `, [purgeCutoff, warningCutoff]);
    const atRiskCount = atRiskRes.rows[0]?.count || 0;

    const activeCount = Math.max(0, totalCandidates - eligibleCount - atRiskCount);

    return {
      success: true,
      thresholdDays: INACTIVITY_THRESHOLD_DAYS,
      warningDays: WARNING_THRESHOLD_DAYS,
      totalCandidates,
      activeCount,
      atRiskCount,
      eligibleForPurge: eligibleCount,
      lastPurgeReport,
      policy: 'Candidates inactive for >60 days are permanently purged nightly; employer and staff accounts in users table are exempt.'
    };
  } catch (err) {
    console.error('[Governance Summary Error]', err.message);
    throw err;
  }
}

/**
 * Executes 60-day inactive candidate purge.
 * @param {Object} options
 * @param {boolean} options.dryRun - If true, only previews candidates without deleting
 * @param {Object} options.io - Socket.io instance for realtime dispatch
 * @param {string} options.triggeredBy - 'cron' or admin userId
 */
async function purgeInactiveCandidates({ dryRun = false, io = null, triggeredBy = 'cron' } = {}) {
  const now = Date.now();
  const cutoff = now - INACTIVITY_THRESHOLD_MS;

  try {
    // 1. Identify candidates eligible for purge
    const { rows: eligible } = await pool.query(`
      SELECT id, name, email, career_track, 
             COALESCE(last_active_at, last_login, updated_at, created_at) as last_active
      FROM candidates
      WHERE COALESCE(last_active_at, last_login, updated_at, created_at) < $1
      ORDER BY last_active ASC
    `, [cutoff]);

    if (dryRun) {
      return {
        success: true,
        dryRun: true,
        cutoffDate: new Date(cutoff).toISOString(),
        eligibleCount: eligible.length,
        candidates: eligible
      };
    }

    if (eligible.length === 0) {
      lastPurgeReport = {
        executedAt: now,
        purgedCount: 0,
        purgedIds: [],
        status: 'completed_no_candidates'
      };
      return {
        success: true,
        dryRun: false,
        purgedCount: 0,
        message: 'No candidates exceed the 60-day inactivity threshold'
      };
    }

    const idsToDelete = eligible.map(c => c.id);

    // 2. Perform permanent deletion from candidates table
    const deleteRes = await pool.query(
      'DELETE FROM candidates WHERE id = ANY($1::varchar[]) RETURNING id, name, email',
      [idsToDelete]
    );

    const purged = deleteRes.rows;
    lastPurgeReport = {
      executedAt: now,
      purgedCount: purged.length,
      purgedIds: purged.map(p => p.id),
      status: 'success'
    };

    // 3. Log governance audit activity
    await logActivity(
      triggeredBy === 'cron' ? 'system_governance' : triggeredBy,
      triggeredBy === 'cron' ? 'Automated Midnight Purge' : 'Manager Manual Purge',
      'system',
      'Governance',
      `Purged ${purged.length} candidate account(s) due to >60 days inactivity`,
      null
    ).catch(() => {});

    // 4. Broadcast via Socket.IO
    if (io) {
      io.emit('DATA_UPDATED', {
        module: 'Candidates',
        action: 'governance_purge',
        purgedCount: purged.length,
        purgedIds: purged.map(p => p.id)
      });
    }

    console.log(`[Account Governance] Successfully purged ${purged.length} inactive candidate account(s) (>60 days).`);

    return {
      success: true,
      dryRun: false,
      purgedCount: purged.length,
      purgedCandidates: purged,
      cutoffDate: new Date(cutoff).toISOString()
    };
  } catch (err) {
    console.error('[Account Governance Purge Error]', err.message);
    lastPurgeReport = {
      executedAt: now,
      purgedCount: 0,
      error: err.message,
      status: 'error'
    };
    throw err;
  }
}

/**
 * Initializes the automated midnight governance cron.
 * Runs once at startup after a short grace period, then daily at midnight IST.
 */
function startGovernanceCron(io) {
  // Initial run after 10 seconds of server startup
  setTimeout(() => {
    purgeInactiveCandidates({ dryRun: false, io, triggeredBy: 'startup_cron' })
      .catch(err => console.warn('[Governance Startup Warning]', err.message));
  }, 10000);

  // Daily interval (24 hours = 86,400,000 ms)
  const DAY_MS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    purgeInactiveCandidates({ dryRun: false, io, triggeredBy: 'cron' })
      .catch(err => console.error('[Governance Daily Cron Error]', err.message));
  }, DAY_MS);

  console.log('[Account Governance] 60-Day Inactive Account Purge routine initialized (daily cycle).');
}

module.exports = {
  INACTIVITY_THRESHOLD_DAYS,
  INACTIVITY_THRESHOLD_MS,
  WARNING_THRESHOLD_DAYS,
  touchCandidateActivity,
  getGovernanceSummary,
  purgeInactiveCandidates,
  startGovernanceCron
};
