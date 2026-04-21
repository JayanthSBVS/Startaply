const pool = require('../db');

async function optimizeDb() {
  console.log('--- STARTING DATABASE OPTIMIZATION ---');
  try {
    const commands = [
      // Activity Logs indices
      'CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON activity_logs (timestamp DESC)',
      'CREATE INDEX IF NOT EXISTS idx_logs_module ON activity_logs (module)',
      'CREATE INDEX IF NOT EXISTS idx_logs_userid ON activity_logs (userid)',

      // Operational Tables indices for admin attribution
      'CREATE INDEX IF NOT EXISTS idx_jobs_admin_createdat ON jobs (createdbyadminid, createdat DESC)',
      'CREATE INDEX IF NOT EXISTS idx_companies_admin_createdat ON companies (createdbyadminid, createdat DESC)',
      'CREATE INDEX IF NOT EXISTS idx_prep_admin_createdat ON prep_data (createdbyadminid, createdat DESC)',
      'CREATE INDEX IF NOT EXISTS idx_mela_admin_createdat ON job_mela (createdbyadminid, createdat DESC)',
      
      // General performance indices
      'CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs (category)',
      'CREATE INDEX IF NOT EXISTS idx_apps_jobid ON applications (jobid)'
    ];

    for (const cmd of commands) {
      console.log(`Executing: ${cmd}`);
      await pool.query(cmd);
    }

    console.log('--- OPTIMIZATION COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error('Optimization Failed:', err.message);
    process.exit(1);
  }
}

optimizeDb();
