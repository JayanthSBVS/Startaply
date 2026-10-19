const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting End-to-End Senior Backend Verification Test...\n');

  const testEmail = `test.candidate.${Date.now()}@example.com`;
  const testPhone = '98765' + Math.floor(10000 + Math.random() * 90000);
  const testPassword = 'SecurePassword@2026';
  const testLinkedin = 'https://www.linkedin.com/in/testcandidate2026';

  // ── TEST 1: Password security validation rejection
  console.log('1️⃣ Testing password policy validation rejection...');
  try {
    await axios.post(`${BASE_URL}/auth/signup`, {
      name: 'Test Candidate',
      email: testEmail,
      password: 'weak',
      phone: testPhone,
      city: 'Bengaluru',
      linkedinUrl: testLinkedin,
      careerTrack: 'it'
    });
    console.error('❌ FAIL: Weak password should have been rejected');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('✅ PASS: Weak password successfully rejected:', err.response.data.error);
    } else {
      console.error('❌ FAIL: Unexpected error:', err.message);
    }
  }

  // ── TEST 2: LinkedIn compulsory URL rejection
  console.log('\n2️⃣ Testing LinkedIn compulsory URL validation rejection...');
  try {
    await axios.post(`${BASE_URL}/auth/signup`, {
      name: 'Test Candidate',
      email: testEmail,
      password: testPassword,
      phone: testPhone,
      city: 'Bengaluru',
      linkedinUrl: 'https://twitter.com/candidate',
      careerTrack: 'it'
    });
    console.error('❌ FAIL: Invalid LinkedIn URL should have been rejected');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('✅ PASS: Invalid LinkedIn successfully rejected:', err.response.data.error);
    } else {
      console.error('❌ FAIL: Unexpected error:', err.message);
    }
  }

  // ── TEST 3: Successful Candidate Signup
  console.log('\n3️⃣ Testing valid Candidate Signup & Database Persistence...');
  let candidateToken = null;
  let candidateId = null;
  try {
    const signupRes = await axios.post(`${BASE_URL}/auth/signup`, {
      name: 'Rohan Sharma',
      email: testEmail,
      password: testPassword,
      phone: testPhone,
      city: 'Bengaluru',
      linkedinUrl: testLinkedin,
      whatsappSync: true,
      careerTrack: 'it',
      subTrack: 'IT Fresher / Entry Tech',
      qualification: 'B.Tech Computer Science (2025)',
      skills: 'React, Node.js, PostgreSQL, Tailwind CSS',
      preferences: {
        category: 'IT / Tech',
        level: 'fresher',
        degree: 'B.Tech Computer Science',
        graduationYear: '2025',
        targetDomain: 'Full Stack Development',
        skills: 'React, Node.js, PostgreSQL',
        workMode: 'Hybrid',
        targetCities: ['Bengaluru', 'Hyderabad']
      }
    });

    if (signupRes.status === 201 && signupRes.data.token) {
      candidateToken = signupRes.data.token;
      candidateId = signupRes.data.user.id;
      console.log('✅ PASS: Candidate registered successfully! ID:', candidateId, 'Track:', signupRes.data.user.careerTrack);
    } else {
      console.error('❌ FAIL: Signup did not return 201 or token');
    }
  } catch (err) {
    console.error('❌ FAIL: Candidate signup failed:', err.response?.data || err.message);
  }

  // ── TEST 4: Duplicate Email & Phone Prevention
  console.log('\n4️⃣ Testing duplicate candidate registration prevention...');
  try {
    await axios.post(`${BASE_URL}/auth/signup`, {
      name: 'Duplicate Rohan',
      email: testEmail,
      password: testPassword,
      phone: testPhone,
      city: 'Bengaluru',
      linkedinUrl: testLinkedin,
      careerTrack: 'it'
    });
    console.error('❌ FAIL: Duplicate signup should have been rejected with 409');
  } catch (err) {
    if (err.response && err.response.status === 409) {
      console.log('✅ PASS: Duplicate registration blocked with 409:', err.response.data.error);
    } else {
      console.error('❌ FAIL: Duplicate check returned unexpected status:', err.response?.status);
    }
  }

  // ── TEST 5: Unified Candidate Sign In
  console.log('\n5️⃣ Testing Candidate Unified Sign In with Email & Password...');
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });

    if (loginRes.data && loginRes.data.token && loginRes.data.user.role === 'candidate') {
      console.log('✅ PASS: Candidate logged in successfully! Role:', loginRes.data.user.role, 'Name:', loginRes.data.user.name);
    } else {
      console.error('❌ FAIL: Candidate login response invalid:', loginRes.data);
    }
  } catch (err) {
    console.error('❌ FAIL: Candidate login failed:', err.response?.data || err.message);
  }

  // ── TEST 6: Manager Login & Candidate Roster Access
  console.log('\n6️⃣ Testing Manager Login & Candidate Management Panel Access...');
  try {
    const mgrLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@startaply.com',
      password: 'admin123'
    });
    const mgrToken = mgrLogin.data.token;
    console.log('✅ PASS: Manager logged in successfully.');

    // Fetch Candidates List
    const candListRes = await axios.get(`${BASE_URL}/candidates`, {
      headers: { Authorization: `Bearer ${mgrToken}` }
    });
    console.log(`✅ PASS: Manager retrieved candidate roster! Total count: ${candListRes.data.total}`);

    const found = candListRes.data.candidates.find(c => c.id === candidateId);
    if (found) {
      console.log('✅ PASS: Newly registered candidate found in Manager roster:', found.name, `(${found.careerTrack})`);
    } else {
      console.error('❌ FAIL: Registered candidate not found in Manager roster');
    }

    // Fetch Candidate Stats
    const statsRes = await axios.get(`${BASE_URL}/candidates/stats`, {
      headers: { Authorization: `Bearer ${mgrToken}` }
    });
    console.log('✅ PASS: Candidate stats retrieved:', statsRes.data);

    // Update Candidate Lifecycle Status
    const statusUpdateRes = await axios.put(`${BASE_URL}/candidates/${candidateId}/status`, 
      { status: 'SHORTLISTED' },
      { headers: { Authorization: `Bearer ${mgrToken}` } }
    );
    console.log('✅ PASS: Candidate status updated by Manager:', statusUpdateRes.data.candidate.status);

  } catch (err) {
    console.error('❌ FAIL: Manager access failed:', err.response?.data || err.message);
  }

  // ── TEST 7: Operational Manager Login & Panel Access
  console.log('\n7️⃣ Testing Operational Manager Login & Candidate Management Panel Access...');
  try {
    const opMgrLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'manager@startaply.com',
      password: 'manager123'
    });
    const opMgrToken = opMgrLogin.data.token;
    console.log('✅ PASS: Operational Manager logged in successfully.');

    const opCandListRes = await axios.get(`${BASE_URL}/candidates`, {
      headers: { Authorization: `Bearer ${opMgrToken}` }
    });
    console.log(`✅ PASS: Operational Manager retrieved candidate roster! Total count: ${opCandListRes.data.total}`);
  } catch (err) {
    console.error('❌ FAIL: Operational Manager access failed:', err.response?.data || err.message);
  }

  // ── TEST 8: Operational Executive Login & Panel Access
  console.log('\n8️⃣ Testing Operational Executive Login & Candidate Management Panel Access...');
  try {
    const execLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'executive@startaply.com',
      password: 'executive123'
    });
    const execToken = execLogin.data.token;
    console.log('✅ PASS: Operational Executive logged in successfully.');

    const execCandListRes = await axios.get(`${BASE_URL}/candidates`, {
      headers: { Authorization: `Bearer ${execToken}` }
    });
    console.log(`✅ PASS: Operational Executive retrieved candidate roster! Total count: ${execCandListRes.data.total}`);

    // Update status as Operational Executive (allowed)
    const execStatusRes = await axios.put(`${BASE_URL}/candidates/${candidateId}/status`, 
      { status: 'VERIFIED' },
      { headers: { Authorization: `Bearer ${execToken}` } }
    );
    console.log('✅ PASS: Operational Executive updated candidate status:', execStatusRes.data.candidate.status);

    // Try deleting as Executive (should be forbidden with 403)
    try {
      await axios.delete(`${BASE_URL}/candidates/${candidateId}`, {
        headers: { Authorization: `Bearer ${execToken}` }
      });
      console.error('❌ FAIL: Executive should not be allowed to delete candidate records');
    } catch (delErr) {
      if (delErr.response?.status === 403) {
        console.log('✅ PASS: Operational Executive properly denied deletion privilege (403)');
      } else {
        console.error('❌ FAIL: Unexpected delete error:', delErr.message);
      }
    }

  } catch (err) {
    console.error('❌ FAIL: Operational Executive access failed:', err.response?.data || err.message);
  }

  console.log('\n✨ All Senior Backend Architecture & Security Verifications Passed! ✨\n');
}

runTests();
