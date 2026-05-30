const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const { rows } = await pool.query("UPDATE jobs SET isfresh = 'true' WHERE id = '1777643128229' RETURNING id, title, isfresh");
  console.log('UPDATED:', rows);
  
  const all = await pool.query("SELECT id, title, isfresh FROM jobs");
  console.log('ALL:', all.rows);
  
  process.exit(0);
}

run();
