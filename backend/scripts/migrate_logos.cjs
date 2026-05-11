const { Pool } = require('pg');
require('dotenv').config();

// Standardize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://u5g468fuj9qie5:p022f464ba965c721f592301c34110825c95ef62193e2b26002130e550998cc8b@c6ivvefscbe9j9.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d9mndc94k6e288?ssl=true',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  console.log('🚀 Starting Company-Job Synchronization Migration...');
  
  try {
    // 1. Ensure columns exist (Safety check)
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS companyid VARCHAR(50)`);
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS companylogo TEXT`);
    
    // 2. Fetch all companies for mapping
    const { rows: companies } = await pool.query('SELECT id, name, logo FROM companies');
    console.log(`📦 Found ${companies.length} companies for mapping.`);

    let linkedCount = 0;
    let logoUpdatedCount = 0;

    for (const company of companies) {
      // Link jobs by name match if companyid is null
      const linkRes = await pool.query(
        `UPDATE jobs SET companyid = $1 WHERE companyid IS NULL AND company = $2`,
        [company.id, company.name]
      );
      linkedCount += linkRes.rowCount;

      // Update logos for all jobs linked to this company
      const logoRes = await pool.query(
        `UPDATE jobs SET companylogo = $1 WHERE companyid = $2 AND (companylogo IS NULL OR companylogo != $1)`,
        [company.logo, company.id]
      );
      logoUpdatedCount += logoRes.rowCount;
    }

    console.log(`✅ Linked ${linkedCount} orphan jobs to companies.`);
    console.log(`✅ Synchronized logos for ${logoUpdatedCount} jobs.`);
    
    // 3. Final Cleanup: Mark verified status or other flags if needed
    console.log('🎉 Migration Completed Successfully.');
  } catch (err) {
    console.error('❌ Migration Failed:', err.message);
  } finally {
    await pool.end();
  }
}

runMigration();
