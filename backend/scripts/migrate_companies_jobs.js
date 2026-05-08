const pool = require('../db');

async function migrate() {
  console.log('Starting migration: Companies + Jobs Relationship...');
  
  try {
    // 1. Update Companies Table
    console.log('Updating companies table...');
    await pool.query(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS companyType TEXT,
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS website TEXT,
      ADD COLUMN IF NOT EXISTS description TEXT
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_companies_name ON companies (name)`);
    console.log('Companies table updated.');

    // 2. Update Jobs Table
    console.log('Updating jobs table...');
    await pool.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS companyId VARCHAR(50)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_companyid ON jobs (companyId)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_jobs_adminid ON jobs (createdByAdminId)`);
    console.log('Jobs table updated.');

    // 3. Auto-link existing jobs to existing companies
    console.log('Auto-linking existing jobs to companies...');
    const { rows: allCompanies } = await pool.query('SELECT id, name FROM companies');
    
    let linkedCount = 0;
    for (const company of allCompanies) {
      const result = await pool.query(
        'UPDATE jobs SET companyId = $1 WHERE company ILIKE $2 AND companyId IS NULL',
        [company.id, company.name]
      );
      linkedCount += result.rowCount;
    }
    
    console.log(`Auto-linking complete. Linked ${linkedCount} jobs to companies.`);
    console.log('Migration finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
