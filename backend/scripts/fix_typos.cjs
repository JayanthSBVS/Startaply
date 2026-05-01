const { getPool } = require('../../api/db');
const pool = getPool();

async function fixTypos() {
  try {
    console.log('Fixing typos in database...');
    
    // Fix "goverment" -> "government" in title
    const res1 = await pool.query(`
      UPDATE jobs 
      SET title = REPLACE(title, 'goverment', 'government') 
      WHERE title ILIKE '%goverment%'
    `);
    console.log(`Updated ${res1.rowCount} job titles.`);

    // Fix "goverment" -> "government" in company
    const res2 = await pool.query(`
      UPDATE jobs 
      SET company = REPLACE(company, 'goverment', 'government') 
      WHERE company ILIKE '%goverment%'
    `);
    console.log(`Updated ${res2.rowCount} company names.`);

    // Fix "goverment" -> "government" in category (just in case)
    const res3 = await pool.query(`
      UPDATE jobs 
      SET category = REPLACE(category, 'goverment', 'government') 
      WHERE category ILIKE '%goverment%'
    `);
    console.log(`Updated ${res3.rowCount} categories.`);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

fixTypos();
