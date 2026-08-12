/**
 * Centralized logging utility for Startaply Administrative actions.
 * Since Vercel serverless functions are isolated, this provides a unified
 * database recording mechanism shared across all modules.
 */
async function recordActivity(pool, user, module, action, targetId = null) {
  try {
    if (!user) return;
    
    await pool.query(
      `INSERT INTO activity_logs (userId, userName, role, module, action, targetId, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        user.id || 'system',
        user.name || 'System',
        user.role || 'system',
        module,
        action,
        String(targetId || 'N/A'),
        Date.now()
      ]
    );
  } catch (err) {
    console.error(`LOGGING ERROR [${module}]:`, err.message);
  }
async function getPermissions(pool, role) {
  const normalizeRole = (r) => (!r || r === 'admin') ? 'executive' : r;
  const normalized = normalizeRole(role);
  if (normalized === 'manager') {
    return {
      can_post_job: true,
      can_edit_job: true,
      can_delete_job: true,
      can_view_applicants: true,
      can_manage_companies: true,
      can_manage_mela: true,
      can_manage_prep: true
    };
  }
  try {
    const { rows } = await pool.query('SELECT * FROM role_permissions WHERE role = $1', [normalized]);
    if (rows && rows.length) {
      const r = rows[0];
      return {
        can_post_job:        r.can_post_job        !== false,
        can_edit_job:        r.can_edit_job        !== false,
        can_delete_job:      r.can_delete_job      === true,
        can_view_applicants: r.can_view_applicants !== false,
        can_manage_companies:r.can_manage_companies!== false,
        can_manage_mela:     r.can_manage_mela     !== false,
        can_manage_prep:     r.can_manage_prep     !== false
      };
    }
  } catch (e) {
    console.warn('[getPermissions fallback]', e.message);
  }
  return {
    can_post_job: true,
    can_edit_job: true,
    can_delete_job: false,
    can_view_applicants: true,
    can_manage_companies: true,
    can_manage_mela: true,
    can_manage_prep: true
  };
}

function sharedHandler(req, res) {
  if (res && typeof res.status === 'function') {
    res.status(404).json({ error: 'Shared helper module is not an API endpoint' });
  }
}
sharedHandler.recordActivity = recordActivity;
sharedHandler.getPermissions = getPermissions;

module.exports = sharedHandler;
