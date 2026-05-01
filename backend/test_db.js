const pg = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL }); 
const query = `
      SELECT title, category, "jobcategorytype", "govtjobtype"
      FROM jobs
      WHERE isVisible = true 
      AND (category = 'Government Jobs' AND (govtJobType = $1 OR govtjobtype = $1)) 
      AND ((title ILIKE $2 OR company ILIKE $2 OR location ILIKE $2 OR category ILIKE $2) 
      AND (title ILIKE $3 OR company ILIKE $3 OR location ILIKE $3 OR category ILIKE $3))
`;
const values = ['Central', '%government%', '%teacher%'];

pool.query(query, values).then(res => { 
  console.log('Results:', res.rows);
}).catch(err => console.error(err.message)).finally(() => pool.end());
