const pg = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL }); 
pool.query('SELECT title, category, "jobcategorytype", "govtjobtype" FROM jobs').then(res => { 
  console.log(res.rows);
}).catch(err => console.error(err.message)).finally(() => pool.end());
