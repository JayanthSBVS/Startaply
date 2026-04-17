const pool = require('../db');

/**
 * Logs an activity to the database and optionally broadcasts it via socket.
 */
const logActivity = async (userId, userName, role, module, action, targetId = null) => {
  try {
    await pool.query(`
      INSERT INTO activity_logs (userId, userName, role, module, action, targetId, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [userId, userName, role, module, action, targetId, Date.now()]);
    
    // In a real app, you could emit a socket event here if io was passed in
  } catch (err) {
    console.error('Logger Error:', err.message);
  }
};

module.exports = { logActivity };
