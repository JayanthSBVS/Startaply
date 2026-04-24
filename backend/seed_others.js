require('dotenv').config();
const { getPool } = require('../api/db.js');
const pool = getPool();
(async () => {
  try {
    console.log('Seeding other modules...');
    // Hero Banner
    // await pool.query('INSERT INTO hero_banners (id, image, createdat) VALUES ($1, $2, $3)', ['test_banner_2', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop', Date.now()]);
    // console.log('Hero done');

    // Testimonials
    // await pool.query('INSERT INTO testimonials (id, name, tagline, description, photo, createdat) VALUES ($1, $2, $3, $4, $5, $6)', ['test_testi_2', 'Jane Doe', 'Software Engineer', 'Strataply helped me get my dream job at an MNC in just 2 weeks!', 'https://randomuser.me/api/portraits/women/44.jpg', Date.now()]);
    // console.log('Testimonials done');

    // Job Mela
    await pool.query('INSERT INTO job_mela (title, date, venue, time, isactive, showpopup, company, registrationlink, createdbyadminid, createdat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', ['Mega IT Job Fair 2024', '2026-05-15', 'Hyderabad Convention Centre', '10:00 AM - 5:00 PM', true, true, 'Multiple MNCs', 'https://strataply.com', 'admin_jayanth', Date.now()]);
    console.log('Mela done');

    // Prep Data
    await pool.query('INSERT INTO prep_data (id, heading, jobtype, content, contenttype, fileurl, question, answer, createdbyadminid, createdat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', ['test_prep_2', 'Top 50 React Interview Questions', 'IT Jobs', 'Here are the top React questions...', 'article', '', '', '', 'admin_jayanth', Date.now()]);
    console.log('Prep done');
    
    // Companies
    await pool.query('INSERT INTO companies (id, name, logo, industry, companyType, website, location, description, createdByAdminId, createdAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', ['test_comp_1', 'TechVision Global', 'https://logo.clearbit.com/microsoft.com', 'Technology', 'MNC', 'https://microsoft.com', 'Bangalore', 'Leading tech company.', 'admin_jayanth', Date.now()]);
    console.log('Companies done');

    console.log('Seeding COMPLETE');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
