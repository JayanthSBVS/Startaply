const pool = require('../db');

async function migrateCandidatesTable() {
  try {
    console.log('Initiating candidates table migration...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone VARCHAR(20) NOT NULL,
        city VARCHAR(100) NOT NULL,
        linkedin_url TEXT NOT NULL,
        whatsapp_sync BOOLEAN DEFAULT TRUE,
        career_track VARCHAR(50) NOT NULL,
        sub_track VARCHAR(100),
        qualification TEXT,
        skills TEXT,
        preferences JSONB,
        status VARCHAR(50) DEFAULT 'REGISTERED',
        last_login BIGINT,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      )
    `);

    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_candidates_email_lower ON candidates (LOWER(email))`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_candidates_track ON candidates (career_track)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates (created_at DESC)`);

    console.log('Candidates table & indexes verified successfully.');
    
    // Check if table exists
    const res = await pool.query("SELECT COUNT(*) FROM candidates");
    console.log('Current candidate count in DB:', res.rows[0].count);
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrateCandidatesTable();
