const { getPool, setEdgeCache } = require('./db');

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const pool = getPool();

  // Create table if not exists
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collabs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        college_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('Failed to init collabs table:', err);
  }

  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM collabs ORDER BY created_at DESC');
      // Set short cache for admin dashboard freshness
      res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=30');
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('GET collabs error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  if (req.method === 'POST') {
    const { collegeName, email, phone, message } = req.body;
    if (!collegeName || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const result = await pool.query(
        'INSERT INTO collabs (college_name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *',
        [collegeName, email, phone, message || '']
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('POST collabs error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.status(405).json({ error: 'Method Not Allowed' });
};
