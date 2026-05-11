const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/strat_db',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function repair() {
  console.log('🚀 Starting Job Branding Repair Utility...');
  const client = await pool.connect();
  
  try {
    // 1. Fetch all companies for matching
    const { rows: companies } = await client.query('SELECT id, name, logo FROM companies');
    console.log(`📦 Loaded ${companies.length} companies for matching.`);

    // 2. Fetch all jobs
    const { rows: jobs } = await client.query('SELECT id, company, companyid, companylogo FROM jobs');
    console.log(`🔍 Auditing ${jobs.length} jobs...`);

    let repairedCount = 0;
    let alreadyCorrect = 0;
    let noMatch = 0;

    for (const job of jobs) {
      const currentName = (job.company || '').trim();
      const currentId = job.companyid;
      const currentLogo = job.companylogo;

      // Find best match in companies table
      const match = companies.find(c => 
        c.name.toLowerCase() === currentName.toLowerCase() ||
        (currentId && c.id === currentId)
      );

      if (match) {
        // Check if update is actually needed
        const needsUpdate = 
          job.companyid !== match.id || 
          job.companylogo !== match.logo ||
          job.company !== match.name;

        if (needsUpdate) {
          await client.query(
            'UPDATE jobs SET companyid = $1, companylogo = $2, company = $3 WHERE id = $4',
            [match.id, match.logo, match.name, job.id]
          );
          repairedCount++;
        } else {
          alreadyCorrect++;
        }
      } else {
        if (currentName) {
          console.log(`⚠️ No company match found for job "${job.id}" (Company: ${currentName})`);
          noMatch++;
        }
      }
    }

    console.log('\n✅ Repair Complete!');
    console.log('---------------------------');
    console.log(`🛠  Repaired/Synced: ${repairedCount}`);
    console.log(`✨ Already Correct:  ${alreadyCorrect}`);
    console.log(`❓ No Match Found:   ${noMatch}`);
    console.log('---------------------------');

  } catch (err) {
    console.error('❌ Repair Failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

repair();
