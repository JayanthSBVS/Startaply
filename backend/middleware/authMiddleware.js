const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'strataply_super_secret_key_123';

/**
 * Middleware to verify JWT token and attach user to request.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, name, role, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

/**
 * Middleware to restrict access to Operational Managers only.
 */
const managerMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'manager') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Operational Manager authority required' });
  }
};

/**
 * Helper to check ownership or manager status.
 */
const checkOwnership = (itemAdminId, user) => {
  if (!user) return false;
  if (user.role === 'manager') return true;
  return itemAdminId === user.id;
};

module.exports = { authMiddleware, managerMiddleware, checkOwnership };
