/**
 * Centralized logging utility for Strataply Administrative actions.
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
}

module.exports = { recordActivity };
