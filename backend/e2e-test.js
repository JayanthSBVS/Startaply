const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const API = 'http://localhost:5000/api';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runTest() {
  console.log("--- E2E TEST: TOGGLING ISFRESH ---");
  
  // 1. Fetch jobs as Admin
  console.log("1. Fetching jobs as admin (mocking GET /api/jobs)");
  // Since we don't have a token, we just query DB directly to mock the GET response
  const { rows } = await pool.query('SELECT * FROM jobs LIMIT 1');
  if (rows.length === 0) { console.log("No jobs in DB"); process.exit(1); }
  
  // mapRow equivalent
  const nb = (v) => v === true || v === 'true' || v === 1 || v === '1';
  const row = rows[0];
  const job = {
    id: row.id,
    title: row.title,
    isFresh: nb(row.isfresh),
    category: row.category,
    isVisible: nb(row.isvisible)
  };
  console.log("Initial job state from mapRow:", job);

  // 2. Simulate User Toggle
  const updatedJob = { ...job, isFresh: !job.isFresh };
  console.log("2. Simulated updatedJob payload from AdminDashboard:", updatedJob);

  // 3. We cannot call PUT without auth, so let's simulate the normalizeJob logic
  function normalizeJob(body, existing = null) {
    return {
      isFresh: nb(body.isFresh),
      isVisible: body.isVisible === undefined ? true : nb(body.isVisible),
      category: body.category || body.jobCategory || '',
    };
  }
  
  const j = normalizeJob(updatedJob, row);
  console.log("3. Backend normalized job state:", j);

  // 4. Update DB
  console.log("4. Simulating DB update query...");
  await pool.query('UPDATE jobs SET isFresh=$1 WHERE id=$2', [j.isFresh, job.id]);
  
  // 5. Check DB explicitly
  const { rows: updatedRows } = await pool.query('SELECT id, isfresh FROM jobs WHERE id=$1', [job.id]);
  console.log("5. DB State after update:", updatedRows[0]);
  
  // 6. Test public endpoint logic
  const { rows: filteredRows } = await pool.query(`SELECT id FROM jobs WHERE isVisible::text = 'true' AND ((experience ILIKE '%0%' OR experience ILIKE '%fresher%' OR isFresh::text = 'true')) AND id=$1`, [job.id]);
  console.log("6. Did it appear in freshers query?", filteredRows.length > 0 ? "YES" : "NO");

  process.exit(0);
}

runTest();
