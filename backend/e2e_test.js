const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = 'startaply_super_secret_key_123';
const token = jwt.sign({ id: 1, name: 'Admin', role: 'manager' }, JWT_SECRET, { expiresIn: '1h' });
const API_URL = 'http://localhost:5000/api';

const headers = { Authorization: `Bearer ${token}` };

async function runTests() {
  try {
    console.log('1. Creating a Company...');
    const compRes = await axios.post(`${API_URL}/companies`, {
      name: 'E2E Test Corp',
      industry: 'Technology',
      location: 'Bangalore, India',
      description: 'A test company for E2E.',
      logo: 'https://logo.clearbit.com/google.com'
    }, { headers });
    const companyId = compRes.data.id;
    console.log('✓ Company created with ID:', companyId);

    console.log('2. Creating a Job...');
    const jobRes = await axios.post(`${API_URL}/jobs`, {
      company: 'E2E Test Corp',
      companyId: companyId,
      title: 'E2E Software Engineer',
      subtitle: 'Building the future',
      description: 'Testing the job card redesign layout.',
      category: 'IT & Non-IT Jobs',
      location: 'Bangalore, India',
      salary: '₹12,00,000 - ₹15,00,000',
      skills: 'React, Node.js, Testing',
      workMode: 'Remote',
      experience: '1-3 Years',
      jobType: 'Full-time',
      qualification: 'B.Tech',
      isTrending: true,
      processType: 'Fast Track',
      expiryDays: 30,
      applyType: 'easy'
    }, { headers });
    console.log('✓ Job created with ID:', jobRes.data.id);

    console.log('3. Creating a Job Mela...');
    const melaRes = await axios.post(`${API_URL}/job-mela`, {
      title: 'E2E Mega Drive 2026',
      date: '2026-08-15',
      time: '10:00 AM - 5:00 PM',
      location: 'Virtual',
      description: 'A huge hiring event.',
      participatingCompanies: 'E2E Test Corp, Google',
      registrationLink: 'https://example.com/mela'
    }, { headers });
    console.log('✓ Job Mela created with ID:', melaRes.data.id);

    console.log('4. Creating Prep Data...');
    const prepRes = await axios.post(`${API_URL}/prep-data`, {
      title: 'E2E Interview Guide',
      category: 'Interview Prep',
      content: 'How to pass E2E tests.',
      fileUrl: 'https://example.com/guide.pdf'
    }, { headers });
    console.log('✓ Prep Data created with ID:', prepRes.data.id);

    console.log('5. Creating a Hero Banner...');
    const bannerRes = await axios.post(`${API_URL}/hero-banners`, {
      title: 'E2E Launch Banner',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      isActive: true
    }, { headers });
    console.log('✓ Hero Banner created with ID:', bannerRes.data.id);

    console.log('\n--- VERIFICATION (Public APIs) ---');
    
    const [publicJobs, publicComps, publicMelas, publicPrep, publicBanners] = await Promise.all([
      axios.get(`${API_URL}/jobs`),
      axios.get(`${API_URL}/companies`),
      axios.get(`${API_URL}/job-mela`),
      axios.get(`${API_URL}/prep-data`),
      axios.get(`${API_URL}/hero-banners`)
    ]);

    const foundJob = publicJobs.data.find(j => j.title === 'E2E Software Engineer');
    console.log('Public Jobs count:', publicJobs.data.length, foundJob ? '(E2E Job verified)' : '(E2E Job missing)');

    const foundBanner = publicBanners.data.find(b => b.title === 'E2E Launch Banner');
    console.log('Public Banners count:', publicBanners.data.length, foundBanner ? '(E2E Banner verified)' : '(E2E Banner missing)');

    console.log('\n✅ All tests completed successfully!');

  } catch (err) {
    console.error('❌ Test failed:', err.response ? err.response.data : err.message);
  }
}

runTests();
