const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function seedTestMela() {
  try {
    const createdAt = Date.now();
    const tickerText = "🚀 Mega JobMela 2024 is Live! Over 50+ Top Companies Hiring. Don't miss out on your dream career. Register now and get an edge! ✨";
    
    // First, deactivate others to ensure this one is "Active"
    await pool.query('UPDATE job_mela SET isActive = false');

    const query = `
      INSERT INTO job_mela (title, description, tickerText, isActive, showPopup, registration_link, createdAt)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    const values = [
      'Mega JobMela 2024',
      'The biggest hiring event of the year!',
      tickerText,
      true,
      true,
      'https://strataply.com/register',
      createdAt
    ];

    await pool.query(query, values);
    console.log('✅ Test JobMela seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding test mela:', err);
  } finally {
    await pool.end();
  }
}

seedTestMela();
