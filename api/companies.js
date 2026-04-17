const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'strataply_super_secret_key_123';

// ── MIDDLEWARE ───────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) { res.status(401).json({ error: 'Auth failed' }); }
};

// Ensure companies table
pool.query(`
  CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT,
    logo TEXT,
    industry TEXT,
    createdByAdminId TEXT,
    createdByAdminName TEXT
  )
`).catch(console.error);

pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS createdByAdminId TEXT`).catch(() => {});
pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS createdByAdminName TEXT`).catch(() => {});

app.get('/api/companies/admin/list', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM companies';
    let params = [];

    if (req.user.role === 'admin') {
      query += ' WHERE createdByAdminId = $1';
      params.push(req.user.id);
    }

    query += ' ORDER BY name ASC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/companies', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM companies ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/companies', authMiddleware, async (req, res) => {
  try {
    const { name, logo, industry } = req.body;
    const id = String(Date.now());
    const ownerId = req.user.id;
    const ownerName = req.user.name;

    const { rows } = await pool.query(
      `INSERT INTO companies (id, name, logo, industry, createdByAdminId, createdByAdminName) 
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [id, name, logo || '', industry || '', ownerId, ownerName]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/companies/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: ex } = await pool.query('SELECT * FROM companies WHERE id=$1', [id]);
    if (!ex.length) return res.status(404).json({ message: 'Not found' });

    if (req.user.role === 'admin' && ex[0].createdbyadminid !== req.user.id) {
       return res.status(403).json({ error: 'Permission denied' });
    }

    await pool.query('DELETE FROM companies WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = app;
