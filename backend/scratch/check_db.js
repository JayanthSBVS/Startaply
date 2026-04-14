const pool = require('../db');
async function check() {
  const jobs = await pool.query('SELECT * FROM jobs');
  const melas = await pool.query('SELECT * FROM job_mela');
  const prep = await pool.query('SELECT * FROM prep_data');
  const companies = await pool.query('SELECT * FROM companies');
  
  console.log('Jobs count:', jobs.rows.length);
  console.log('Mela count:', melas.rows.length);
  if(melas.rows.length > 0) console.log('Mela[0]:', melas.rows[0]);
  console.log('Prep count:', prep.rows.length);
  if(prep.rows.length > 0) console.log('Prep[0]:', prep.rows[0]);
  console.log('Companies count:', companies.rows.length);
  process.exit(0);
}
check();
