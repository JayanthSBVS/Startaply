const pool = require('../db');

async function fixClearbit() {
  const { rows: comps } = await pool.query("SELECT id, name, logo FROM companies WHERE logo ILIKE '%clearbit%'");
  console.log('Companies with clearbit:', comps);
  const { rows: jobs } = await pool.query("SELECT id, title, companylogo FROM jobs WHERE companylogo ILIKE '%clearbit%'");
  console.log('Jobs with clearbit:', jobs);
  
  await pool.query("UPDATE companies SET logo = 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg' WHERE logo ILIKE '%microsoft%' OR logo ILIKE '%clearbit.com/microsoft%'");
  await pool.query("UPDATE companies SET logo = 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' WHERE logo ILIKE '%google%' OR logo ILIKE '%clearbit.com/google%'");
  await pool.query("UPDATE companies SET logo = '' WHERE logo ILIKE '%clearbit%'");

  await pool.query("UPDATE jobs SET companylogo = 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg' WHERE companylogo ILIKE '%microsoft%' OR companylogo ILIKE '%clearbit.com/microsoft%'");
  await pool.query("UPDATE jobs SET companylogo = 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' WHERE companylogo ILIKE '%google%' OR companylogo ILIKE '%clearbit.com/google%'");
  await pool.query("UPDATE jobs SET companylogo = '' WHERE companylogo ILIKE '%clearbit%'");
  
  console.log('Successfully replaced all clearbit URLs in PostgreSQL database!');
  process.exit(0);
}

fixClearbit().catch(err => {
  console.error(err);
  process.exit(1);
});
