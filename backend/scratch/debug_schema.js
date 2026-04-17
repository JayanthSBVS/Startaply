const pool = require('../db');

async function debugSchema() {
  try {
    const tables = ['users', 'jobs', 'applications', 'companies', 'job_mela', 'feedback'];
    for (const table of tables) {
      console.log(`--- Schema for ${table} ---`);
      const { rows } = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table]);
      console.table(rows);
    }
    process.exit(0);
  } catch (err) {
    console.error('Schema Check Failed:', err);
    process.exit(1);
  }
}

debugSchema();
