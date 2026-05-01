import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL }); 
pool.query('SELECT title, category, jobCategoryType, govtJobType FROM jobs').then(res => { 
  const match = res.rows.filter(r => r.title.toLowerCase().includes('teacher'));
  console.log(match);
}).catch(err => console.error(err.message)).finally(() => pool.end());
