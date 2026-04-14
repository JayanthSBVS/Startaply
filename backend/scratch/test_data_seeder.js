const pool = require('../db');

const dummyData = {
  jobs: [
    { title: 'Senior React Developer', company: 'Google', location: 'Remote', salary: '25-35 LPA', category: 'IT & Non-IT Jobs', type: 'Full-time', workMode: 'Remote', experience: '5+ Years', qualification: 'B.Tech/BE', isFeatured: true, isFresh: true, isTrending: true, isToday: true, isVisible: true },
    { title: 'Software Engineer', company: 'Amazon', location: 'Bangalore', salary: '18-24 LPA', category: 'IT & Non-IT Jobs', type: 'Full-time', workMode: 'On-site', experience: '2+ Years', qualification: 'B.Tech/MCA', isFeatured: true, isFresh: true, isTrending: false, isToday: true, isVisible: true },
    { title: 'Digital Marketing Lead', company: 'Flipkart', location: 'Hyderabad', salary: '12-15 LPA', category: 'Private Jobs', type: 'Full-time', workMode: 'Hybrid', experience: '3-5 Years', qualification: 'MBA/Graduate', isFeatured: false, isFresh: false, isTrending: true, isToday: false, isVisible: true },
    { title: 'Customer Support Executive', company: 'Teleperformance', location: 'Chennai', salary: '3-4 LPA', category: 'Gig & Services', type: 'Full-time', workMode: 'On-site', experience: 'Freshers', qualification: 'Any Graduate', isFeatured: false, isFresh: true, isTrending: false, isToday: true, isVisible: true }
  ],
  companies: [
    { name: 'Google', industry: 'Technolgy', logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png' },
    { name: 'Amazon', industry: 'E-commerce', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
    { name: 'Microsoft', industry: 'Software', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg' }
  ],
  prepData: [
    { heading: 'Top React Interview Questions', content: '1. What is Virtual DOM?\n2. React lifecycle methods.\n3. Hooks and their usage.', jobType: 'IT Jobs' },
    { heading: 'Quantitative Aptitude Basics', content: 'Focus on percentages, profit & loss, and time-speed-distance.', jobType: 'Government Jobs' },
    { heading: 'Common HR Interview Tips', content: 'Prepare your introduction and strengths/weaknesses.', jobType: 'Non-IT Jobs' }
  ],
  testimonials: [
    { name: 'Rahul Sharma', tagline: 'Software Engineer at TCS', description: 'Strataply helped me find my dream job in record time. The interface is amazing!' },
    { name: 'Priya Verma', tagline: 'Graduate student', description: 'The preparation materials are top-notch. Highly recommend for freshers.' }
  ],
  mela: { title: 'Strataply Mega Career Fair 2024', date: '2024-12-25', venue: 'Hyderabad International Convention Centre', time: '09:00 AM - 05:00 PM', isActive: true, showPopup: true, registrationLink: 'https://strataply.com/register' },
  feedback: [
    { name: 'Amit Singh', message: 'Great platform! Found it very easy to navigate.', email: 'amit@example.com' },
    { name: 'Sneha Rao', message: 'Could use more government job listings.', email: 'sneha@example.com' }
  ]
};

async function seed() {
  try {
    console.log('--- Starting Data Seed ---');

    console.log('Ensuring tables exist...');
    await pool.query('CREATE TABLE IF NOT EXISTS companies (id VARCHAR(50) PRIMARY KEY, name TEXT, logo TEXT)');
    await pool.query('ALTER TABLE feedback ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5');

    console.log('Clearing existing data...');
    // Note: CASCADE handles dependencies if any
    await pool.query('TRUNCATE jobs, applications, companies, job_mela, prep_data, testimonials, feedback CASCADE');

    console.log('Seeding Jobs...');
    for (const job of dummyData.jobs) {
      const id = String(Date.now() + Math.random());
      const now = Date.now();
      await pool.query(
        'INSERT INTO jobs (id, createdAt, updatedAt, title, description, company, location, salary, category, type, workMode, experience, qualification, isFeatured, isFresh, isTrending, isToday, isVisible) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)',
        [id, now, now, job.title, job.description || '', job.company, job.location, job.salary, job.category, job.type, job.workMode, job.experience, job.qualification, job.isFeatured, job.isFresh, job.isTrending, job.isToday, job.isVisible]
      );
    }

    console.log('Seeding Companies...');
    for (const comp of dummyData.companies) {
      await pool.query(
        'INSERT INTO companies (id, name, logo) VALUES ($1, $2, $3)',
        [String(Date.now() + Math.random()), comp.name, comp.logo]
      );
    }

    console.log('Seeding Prep Data...');
    for (const p of dummyData.prepData) {
      await pool.query(
        'INSERT INTO prep_data (id, heading, content, jobType, createdAt) VALUES ($1, $2, $3, $4, $5)',
        [String(Date.now() + Math.random()), p.heading, p.content, p.jobType, Date.now()]
      );
    }

    console.log('Seeding Testimonials...');
    for (const t of dummyData.testimonials) {
      await pool.query(
        'INSERT INTO testimonials (id, name, tagline, description, photo, createdAt) VALUES ($1, $2, $3, $4, $5, $6)',
        [String(Date.now() + Math.random()), t.name, t.tagline, t.description, '', Date.now()]
      );
    }

    console.log('Seeding Feedback...');
    for (const f of dummyData.feedback) {
      await pool.query(
        'INSERT INTO feedback (id, name, email, message, createdAt) VALUES ($1, $2, $3, $4, $5)',
        [String(Date.now() + Math.random()), f.name, f.email, f.message, Date.now()]
      );
    }

    console.log('Seeding Job Mela...');
    await pool.query(
      'INSERT INTO job_mela (title, date, venue, time, isActive, showPopup, createdAt) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [dummyData.mela.title, dummyData.mela.date, dummyData.mela.venue, dummyData.mela.time, dummyData.mela.isActive, dummyData.mela.showPopup, Date.now()]
    );

    console.log('--- Seeding Complete Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
}

seed();
