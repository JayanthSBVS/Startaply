const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('../db');
const fs = require('fs');

async function queryWithRetry(sql, params = [], retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await pool.query(sql, params);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`Query retry ${i + 1}/${retries}... (${err.message})`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function seedAllEntities() {
  console.log('--- Starting Comprehensive Entity Seed for Startaply ---');

  const now = Date.now();

  try {
    // 1. Companies
    console.log('1. Seeding Companies...');
    const companiesToSeed = [
      {
        id: 'comp-google',
        name: 'Google India',
        industry: 'Technology',
        companyType: 'MNC',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
        description: 'Google is a global technology leader focused on improving the ways people connect with information.',
        location: 'Bangalore & Hyderabad',
        website: 'https://careers.google.com',
        color: '#4285F4',
        iconName: 'Building2'
      },
      {
        id: 'comp-razorpay',
        name: 'Razorpay',
        industry: 'FinTech',
        companyType: 'Unicorn',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg',
        description: 'Razorpay is India’s leading payment gateway and banking suite built for fast-moving startups and enterprises.',
        location: 'Bangalore, India',
        website: 'https://razorpay.com/jobs',
        color: '#001F8E',
        iconName: 'Building2'
      },
      {
        id: 'comp-tcs',
        name: 'Tata Consultancy Services',
        industry: 'IT Services',
        companyType: 'MNC',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
        description: 'TCS is a global leader in IT services, consulting, and business solutions partner to top organizations.',
        location: 'Pan India (Multiple Locations)',
        website: 'https://www.tcs.com/careers',
        color: '#1A62FE',
        iconName: 'Building2'
      },
      {
        id: 'comp-swiggy',
        name: 'Swiggy',
        industry: 'Food Tech',
        companyType: 'Product Based',
        logo: 'https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg',
        description: 'Swiggy is India’s leading on-demand convenience platform connecting consumers with restaurants and grocery partners.',
        location: 'Bangalore / Remote',
        website: 'https://careers.swiggy.com',
        color: '#FC8019',
        iconName: 'Building2'
      }
    ];

    for (const c of companiesToSeed) {
      await queryWithRetry(`
        INSERT INTO companies (id, name, industry, companyType, logo, description, location, website, color, iconName, createdAt, updatedAt)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          industry = EXCLUDED.industry,
          companyType = EXCLUDED.companyType,
          logo = EXCLUDED.logo,
          description = EXCLUDED.description,
          location = EXCLUDED.location,
          website = EXCLUDED.website
      `, [c.id, c.name, c.industry, c.companyType, c.logo, c.description, c.location, c.website, c.color, c.iconName, now, now]);
    }

    // 2. Jobs
    console.log('2. Seeding Jobs Across All Categories...');
    const jobsToSeed = [
      {
        id: 'job-swe-google',
        title: 'Software Development Engineer II (Frontend / React)',
        subtitle: 'Build scalable web infrastructure for Google Workspace',
        description: 'Design and deliver ultra-fast, accessible web experiences using React, TypeScript, and modern browser APIs.',
        fullDescription: 'As a Software Engineer at Google, you will work on mission-critical applications used by millions of users daily. You will collaborate with product designers, backend engineers, and UX researchers to architect scalable component libraries and deliver seamless web apps.',
        requiredSkills: 'React, TypeScript, Next.js, Web Vitals, Tailwind CSS, Jest',
        techStack: 'React 19, Node.js, GraphQL, GCP, WebAssembly',
        aboutCompany: 'Google India is recognized as one of the best workplaces with great learning culture and competitive compensation.',
        benefits: 'Comprehensive Health Insurance, Hybrid Work Policy, Learning Stipend, Free Gourmet Meals, Performance Bonus',
        company: 'Google India',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
        companyId: 'comp-google',
        location: 'Bangalore, Karnataka',
        workMode: 'Hybrid',
        qualification: 'B.Tech / M.Tech / MCA or equivalent in CS / IT',
        experience: '2 - 5 Years',
        salary: '₹28,00,000 - ₹42,00,000 / year',
        type: 'Full-time',
        category: 'IT & Software Jobs',
        jobCategoryType: 'IT',
        applyType: 'easy',
        applyUrl: 'https://careers.google.com',
        expiryDays: 45,
        isFeatured: true,
        isHeroFeatured: true,
        isToday: true,
        isTrending: true,
        isFresh: false,
        isVisible: true,
        views: 340
      },
      {
        id: 'job-fresher-sde-razorpay',
        title: 'Associate Software Engineer (Graduate / Fresher 2025-2026)',
        subtitle: 'Entry-level full-stack engineering role at Razorpay',
        description: 'Exciting opportunity for fresh graduates with strong fundamentals in Data Structures, Algorithms, and JavaScript/Python.',
        fullDescription: 'Join Razorpay as an Associate Software Engineer! You will receive 6 months of guided mentorship from senior staff engineers, write production code, design payment microservices, and scale resilient payment systems handling billions in transaction volume.',
        requiredSkills: 'DSA, JavaScript, Python, SQL, REST APIs, Git',
        techStack: 'Go, Node.js, PostgreSQL, Redis, AWS, Docker',
        aboutCompany: 'Razorpay is India’s premier fintech ecosystem empowering millions of businesses with payments, banking, and payroll.',
        benefits: '₹14 LPA Starting CTC, Relocation Assistance, Remote Work Flexibility, Medical Coverage for Family',
        company: 'Razorpay',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg',
        companyId: 'comp-razorpay',
        location: 'Bangalore / Remote',
        workMode: 'Remote',
        qualification: 'B.Tech / B.E / BCA / MCA / B.Sc (2024 / 2025 / 2026 Batches)',
        experience: '0 - 1 Years (Freshers Welcome)',
        salary: '₹12,00,000 - ₹16,00,000 / year',
        type: 'Full-time',
        category: 'IT & Software Jobs',
        jobCategoryType: 'IT',
        applyType: 'easy',
        applyUrl: 'https://razorpay.com/jobs',
        expiryDays: 30,
        isFeatured: true,
        isHeroFeatured: false,
        isToday: true,
        isTrending: true,
        isFresh: true,
        isVisible: true,
        views: 890
      },
      {
        id: 'job-ops-executive-swiggy',
        title: 'Operations & Customer Experience Lead',
        subtitle: 'Drive partner success and city logistics operations',
        description: 'Lead city-level delivery fulfillment, merchant onboarding, and resolve operational escalations with speed and empathy.',
        fullDescription: 'As a Customer Experience & City Operations Lead at Swiggy, you will monitor live logistics metrics, collaborate with fleet partners, streamline partner payouts, and optimize on-ground supply-demand efficiency across key metropolitan clusters.',
        requiredSkills: 'Operations Management, Excel, Communication, Vendor Coordination, Analytical Problem Solving',
        techStack: 'MS Excel, Power BI, CRM Tools, Google Sheets',
        aboutCompany: 'Swiggy powers convenient food and instant grocery delivery across 500+ Indian cities.',
        benefits: 'Health Insurance, Daily Travel Allowance, Performance Incentives, Flexible Shifts',
        company: 'Swiggy',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg',
        companyId: 'comp-swiggy',
        location: 'Hyderabad, Telangana',
        workMode: 'On-site',
        qualification: 'Any Graduate (B.Com / BBA / BA / B.Sc / Any Degree)',
        experience: '0 - 3 Years',
        salary: '₹4,50,000 - ₹6,50,000 / year',
        type: 'Full-time',
        category: 'Non-IT Jobs',
        jobCategoryType: 'Non-IT',
        applyType: 'easy',
        applyUrl: 'https://careers.swiggy.com',
        expiryDays: 30,
        isFeatured: true,
        isHeroFeatured: false,
        isToday: true,
        isTrending: false,
        isFresh: true,
        isVisible: true,
        views: 210
      },
      {
        id: 'job-tcs-system-engineer',
        title: 'Systems Engineer & Cloud Analyst',
        subtitle: 'Enterprise cloud migration and database support',
        description: 'Manage enterprise database operations, cloud monitoring, and automated incident resolution for Fortune 500 clients.',
        fullDescription: 'TCS is hiring Systems Engineers to design, deploy, and maintain robust cloud infrastructure. You will work on Linux administration, CI/CD pipeline automation, infrastructure monitoring, and disaster recovery planning.',
        requiredSkills: 'Linux, AWS, SQL, Bash Scripting, Docker, Python',
        techStack: 'AWS, Kubernetes, Terraform, Jenkins, PostgreSQL',
        aboutCompany: 'TCS is India’s largest IT exporter and a premier employer recognized globally for talent transformation.',
        benefits: 'PF, Gratuity, Health Insurance, Higher Education Sponsorship, Onsite Opportunities',
        company: 'Tata Consultancy Services',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
        companyId: 'comp-tcs',
        location: 'Pune / Chennai / Hyderabad',
        workMode: 'Hybrid',
        qualification: 'B.E / B.Tech / MCA / M.Sc',
        experience: '1 - 3 Years',
        salary: '₹7,00,000 - ₹9,50,000 / year',
        type: 'Full-time',
        category: 'Private Jobs',
        jobCategoryType: 'IT',
        applyType: 'easy',
        applyUrl: 'https://www.tcs.com/careers',
        expiryDays: 60,
        isFeatured: false,
        isHeroFeatured: false,
        isToday: false,
        isTrending: true,
        isFresh: false,
        isVisible: true,
        views: 470
      },
      {
        id: 'job-gig-uiux-razorpay',
        title: 'Contract UI/UX Product Designer (Design Systems)',
        subtitle: '3-6 Months High-Impact Design Sprint for Checkout Experience',
        description: 'Craft frictionless payment flows, design system components, and interactive micro-animations for Razorpay Checkout.',
        fullDescription: 'We are seeking an expert freelance/contract UI/UX Product Designer to collaborate directly with our core checkout team. You will conduct usability testing, create pixel-perfect Figma components, and deliver production-ready motion design specs.',
        requiredSkills: 'Figma, Design Systems, UX Research, Micro-interactions, Prototyping',
        techStack: 'Figma, Principle, Adobe After Effects, Storybook',
        aboutCompany: 'Razorpay powers payments for over 8 million Indian merchants.',
        benefits: 'Flexible Hours, 100% Remote, Weekly Retainer Payouts, Equipment Reimbursement',
        company: 'Razorpay',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg',
        companyId: 'comp-razorpay',
        location: 'Remote (Pan-India)',
        workMode: 'Remote',
        qualification: 'Portfolio showcasing Web/Mobile App UX Case Studies',
        experience: '2+ Years Experience',
        salary: '₹80,000 - ₹1,20,000 / month (Retainer)',
        type: 'Contract',
        category: 'Gig & Services',
        jobCategoryType: 'Gig Works',
        applyType: 'easy',
        applyUrl: 'https://razorpay.com/jobs',
        expiryDays: 45,
        isFeatured: true,
        isHeroFeatured: false,
        isToday: true,
        isTrending: true,
        isFresh: true,
        isVisible: true,
        views: 310
      },
      {
        id: 'job-gig-content-swiggy',
        title: 'Freelance Technical Copywriter & Brand Storyteller',
        subtitle: 'Part-time campaign copy and merchant marketing collateral',
        description: 'Create compelling product copy, push notifications, and in-app onboarding guides for restaurant partner platforms.',
        fullDescription: 'Join Swiggy’s creative studio on a flexible gig basis. You will write conversion-focused micro-copy, creative email campaigns, and engaging brand narratives that resonate with over 50 million consumers.',
        requiredSkills: 'Copywriting, Brand Storytelling, Content Strategy, SEO, Creative Writing',
        techStack: 'Google Docs, Figma, Notion, Grammarly Business',
        aboutCompany: 'Swiggy is India’s beloved on-demand food delivery and quick-commerce leader.',
        benefits: 'Work from Anywhere, Flexible Milestone Payments, Direct Brand Exposure',
        company: 'Swiggy',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg',
        companyId: 'comp-swiggy',
        location: 'Remote',
        workMode: 'Remote',
        qualification: 'Any Degree / Published Writing Portfolio',
        experience: '1 - 4 Years',
        salary: '₹40,000 - ₹65,000 / month (Milestone)',
        type: 'Freelance',
        category: 'Gig & Services',
        jobCategoryType: 'Gig Works',
        applyType: 'easy',
        applyUrl: 'https://careers.swiggy.com',
        expiryDays: 30,
        isFeatured: false,
        isHeroFeatured: false,
        isToday: true,
        isTrending: false,
        isFresh: true,
        isVisible: true,
        views: 180
      },
      {
        id: 'job-gig-ai-annotator-google',
        title: 'AI Data Evaluation & Prompt Specialist (Flexible Gig)',
        subtitle: 'Train and evaluate state-of-the-art multimodal AI models in Indic languages',
        description: 'Review AI-generated text, assess factual accuracy, evaluate translation quality, and annotate conversational responses.',
        fullDescription: 'Google AI Research partner project looking for language and domain experts to test and benchmark next-generation AI foundation models. Highly flexible schedule suitable for graduates and freelancers.',
        requiredSkills: 'Fluency in English + Hindi/Telugu/Tamil, Critical Thinking, Attention to Detail, Basic Python (Bonus)',
        techStack: 'Google Cloud Annotation Studio, Google Workspace',
        aboutCompany: 'Google India research division empowering multilingual AI models across the globe.',
        benefits: 'Hourly Compensation (₹800/hr), Flexible Work Hours (15-20 hrs/week), Completion Certificate',
        company: 'Google India',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
        companyId: 'comp-google',
        location: 'Remote',
        workMode: 'Remote',
        qualification: 'Bachelor’s Degree in any discipline',
        experience: '0 - 2 Years (Freshers Welcome)',
        salary: '₹35,000 - ₹55,000 / month (Flexible)',
        type: 'Part-time',
        category: 'Gig & Services',
        jobCategoryType: 'Gig Works',
        applyType: 'easy',
        applyUrl: 'https://careers.google.com',
        expiryDays: 60,
        isFeatured: true,
        isHeroFeatured: false,
        isToday: true,
        isTrending: true,
        isFresh: true,
        isVisible: true,
        views: 620
      },
      {
        id: 'job-private-hr-tcs',
        title: 'Talent Acquisition Specialist (Corporate Recruitment)',
        subtitle: 'Lead lateral hiring for cloud and enterprise software practices',
        description: 'Manage full-cycle recruitment, candidate screening, technical interview scheduling, and offer negotiations for TCS.',
        fullDescription: 'As a Talent Acquisition Specialist at TCS, you will partner with business unit leaders to identify top engineering talent, organize campus placement drives, and drive diversity hiring initiatives.',
        requiredSkills: 'Talent Acquisition, Technical Sourcing, LinkedIn Recruiter, Candidate Engagement, Negotiation',
        techStack: 'Taleo, SAP SuccessFactors, LinkedIn Recruiter, MS Office 365',
        aboutCompany: 'Tata Consultancy Services is a top-5 global IT brand with over 600,000 consultants worldwide.',
        benefits: 'Corporate Health Plan, Performance Bonus, Flexible Hybrid Model, Provident Fund',
        company: 'Tata Consultancy Services',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
        companyId: 'comp-tcs',
        location: 'Bangalore / Hyderabad / Chennai',
        workMode: 'Hybrid',
        qualification: 'MBA in HR / Any Master’s or Bachelor’s Degree',
        experience: '2 - 5 Years',
        salary: '₹8,50,000 - ₹12,00,000 / year',
        type: 'Full-time',
        category: 'Private Jobs',
        jobCategoryType: 'Non-IT',
        applyType: 'easy',
        applyUrl: 'https://www.tcs.com/careers',
        expiryDays: 45,
        isFeatured: true,
        isHeroFeatured: false,
        isToday: true,
        isTrending: false,
        isFresh: false,
        isVisible: true,
        views: 290
      }
    ];

    for (const j of jobsToSeed) {
      await queryWithRetry(`
        INSERT INTO jobs (
          id, createdAt, updatedAt, title, subtitle, description, fullDescription,
          requiredSkills, techStack, aboutCompany, benefits, company, companyLogo,
          location, workMode, qualification, experience, salary, type, category,
          applyUrl, applyType, expiryDays, isFeatured, isHeroFeatured, isToday,
          isTrending, isFresh, isVisible, views, jobCategoryType, companyId
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
          $29, $30, $31, $32
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          fullDescription = EXCLUDED.fullDescription,
          salary = EXCLUDED.salary,
          category = EXCLUDED.category,
          isFeatured = EXCLUDED.isFeatured,
          isToday = EXCLUDED.isToday,
          isVisible = EXCLUDED.isVisible
      `, [
        j.id, now, now, j.title, j.subtitle, j.description, j.fullDescription,
        j.requiredSkills, j.techStack, j.aboutCompany, j.benefits, j.company, j.companyLogo,
        j.location, j.workMode, j.qualification, j.experience, j.salary, j.type, j.category,
        j.applyUrl, j.applyType, j.expiryDays, j.isFeatured, j.isHeroFeatured, j.isToday,
        j.isTrending, j.isFresh, j.isVisible, j.views, j.jobCategoryType, j.companyId
      ]);
    }

    // 3. Job Melas
    console.log('3. Seeding Job Mela / Mega Placement Drives...');
    await queryWithRetry(`
      INSERT INTO job_mela (
        id, title, description, venue, date, time, image, tickerText,
        isActive, showPopup, registration_link, company, google_map_link, createdAt
      ) VALUES (
        1,
        'Bangalore Mega IT & Startup Placement Drive 2026',
        'Direct walk-in hiring drive featuring 40+ leading tech companies and high-growth startups hiring 1,500+ freshers, software engineers, data analysts, and operations executives. Spot offer letters provided.',
        'Bangalore International Exhibition Centre (BIEC), 10th Mile, Tumkur Road, Bangalore',
        'November 15, 2026',
        '09:00 AM - 05:00 PM IST',
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
        '🚀 Bangalore Mega Job Mela Registration Open - 1,500+ Spot Offers Across 40+ Top Companies!',
        true,
        true,
        'https://startaply.com/job-melas/1',
        'Top 40+ Tech Partners',
        'https://maps.google.com/?q=BIEC+Bangalore',
        $1
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        venue = EXCLUDED.venue,
        date = EXCLUDED.date,
        isActive = EXCLUDED.isActive,
        showPopup = EXCLUDED.showPopup
    `, [now]);

    // 4. Preparation Data
    console.log('4. Seeding Preparation Material (Articles, Q&As, Cheat Sheets)...');
    const prepItems = [
      {
        id: 1,
        heading: 'Top 50 Frontend & React 19 Core Interview Questions',
        jobType: 'IT Jobs',
        contentType: 'article',
        content: `Master key frontend concepts:
1. React 19 Actions & useActionState: Understand how modern React manages async transitions without manual state plumbing.
2. Reconciliation & Virtual DOM Diffing: Learn how React fiber computes minimal DOM mutations with heuristic O(n) algorithms.
3. Performance Optimization: Memoization techniques, code splitting with React.lazy, Core Web Vitals (LCP, INP, CLS).
4. System Design: State management trade-offs, scalable component architecture, accessibility (WCAG 2.1 AA).`,
        question: 'What is the difference between useMemo and useCallback in React?',
        answer: 'useMemo caches the computed result of a function between re-renders, while useCallback caches the function definition itself to prevent unnecessary child re-renders.',
        createdAt: now
      },
      {
        id: 2,
        heading: 'Aptitude, Logical Reasoning & HR Round Blueprint for Freshers',
        jobType: 'Non-IT Jobs',
        contentType: 'article',
        content: `Comprehensive guide for campus placement & entry level assessments:
- Quantitative Aptitude: Time & Work, Speed & Distance, Percentages, Profit & Loss.
- Logical Reasoning: Syllogisms, Blood Relations, Seating Arrangements, Coding-Decoding.
- HR Round Strategy: The STAR Method (Situation, Task, Action, Result) for behavioral answers.`,
        question: 'How do you handle challenging deadlines in a fast-paced work environment?',
        answer: 'I prioritize tasks based on urgency and business impact using the Eisenhower Matrix, communicate proactively with team leads, and break complex tasks into actionable milestones.',
        createdAt: now
      }
    ];

    for (const p of prepItems) {
      await queryWithRetry(`
        INSERT INTO prep_data (id, heading, jobType, contentType, content, question, answer, createdAt)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          heading = EXCLUDED.heading,
          content = EXCLUDED.content,
          question = EXCLUDED.question,
          answer = EXCLUDED.answer
      `, [p.id, p.heading, p.jobType, p.contentType, p.content, p.question, p.answer, p.createdAt]);
    }

    // 5. Testimonials
    console.log('5. Seeding Candidate Testimonials...');
    const testimonialsList = [
      {
        id: 'testi-1',
        name: 'Pooja Sharma',
        tagline: 'Software Engineer @ Razorpay',
        description: 'Startaply made my fresher job search completely stress-free. The zero consulting fee model and direct Easy Apply got me 4 interview calls within a week, leading to my offer at Razorpay!',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'testi-2',
        name: 'Rahul Verma',
        tagline: 'Frontend Developer @ Google',
        description: 'The curated job mela drives and instant application tracking helped me connect directly with senior tech recruiters without intermediaries. Startaply is a game-changer.',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'testi-3',
        name: 'Sneha Patel',
        tagline: 'Operations Associate @ Swiggy',
        description: 'As a non-IT graduate, finding verified high-paying roles was tough until I used Startaply. Clear job descriptions, transparent salaries, and zero spam.',
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80'
      }
    ];

    for (const t of testimonialsList) {
      await queryWithRetry(`
        INSERT INTO testimonials (id, name, tagline, description, photo, createdAt)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          tagline = EXCLUDED.tagline,
          description = EXCLUDED.description,
          photo = EXCLUDED.photo
      `, [t.id, t.name, t.tagline, t.description, t.photo, now]);
    }

    // 6. Collab Requests
    console.log('6. Seeding College Collaboration Requests...');
    const collabsDataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(collabsDataDir)) fs.mkdirSync(collabsDataDir, { recursive: true });
    const collabsFile = path.join(collabsDataDir, 'collabs.json');
    const collabsJsonData = [
      {
        id: 'collab-1',
        collegeName: 'IIT Madras Training & Placement Cell',
        email: 'placements@iitm.ac.in',
        phone: '+91 9876543210',
        message: 'We would like to partner with Startaply for our upcoming 2026 campus recruitment season to connect our graduating batch with top tech companies and startups.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'collab-2',
        collegeName: 'BITS Pilani Career Development Centre',
        email: 'careers@pilani.bits-pilani.ac.in',
        phone: '+91 9811223344',
        message: 'Interested in conducting on-campus recruitment drives and hackathons for product engineering roles.',
        createdAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(collabsFile, JSON.stringify(collabsJsonData, null, 2), 'utf8');

    // Also seed into DB if table exists
    try {
      await queryWithRetry(`
        INSERT INTO collabs (college_name, email, phone, message, created_at)
        VALUES (
          'IIT Madras Training & Placement Cell',
          'placements@iitm.ac.in',
          '+91 9876543210',
          'We would like to partner with Startaply for our upcoming 2026 campus recruitment season.',
          NOW()
        )
      `);
    } catch (collabDbErr) {
      console.log('Collabs table note:', collabDbErr.message);
    }

    // 7. Support Tickets
    console.log('7. Seeding Support Tickets...');
    await queryWithRetry(`
      INSERT INTO support_tickets (id, name, email, issue, status, createdAt)
      VALUES (
        'supp-1',
        'Ananya Krishnan',
        'ananya.k@gmail.com',
        'Kotak 811 Video KYC Verification Inquiry for applicant ID DH-PAYROLL-49201',
        'open',
        $1
      )
      ON CONFLICT (id) DO UPDATE SET
        issue = EXCLUDED.issue,
        status = EXCLUDED.status
    `, [now]);

    // 8. Live Ticker
    console.log('8. Seeding Live Ticker Items...');
    const tickers = [
      { id: 'tick-1', text: '🚀 Over 1,500+ Verified Tech & Fresher Openings Live Today across India' },
      { id: 'tick-2', text: '⚡ Direct HR Connect: Razorpay, Google, TCS, and Swiggy actively hiring' },
      { id: 'tick-3', text: '🎯 100% Free Applications — Zero Consulting Fees, Direct Employer Connections' },
      { id: 'tick-4', text: '🏆 Bangalore Mega Placement Drive Registrations Now Open for 2025/2026 Batch' }
    ];
    for (const t of tickers) {
      await queryWithRetry(`
        INSERT INTO live_ticker (id, text, createdAt)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET
          text = EXCLUDED.text
      `, [t.id, t.text, now]);
    }

    // 9. Job Applications with Kotak 811 Integration
    console.log('9. Seeding Candidate Job Applications with Kotak 811 Sub-ID...');
    await queryWithRetry(`
      INSERT INTO applications (
        id, jobId, jobTitle, companyName, name, email, phone, resume,
        appliedAt, createdByAdminId, subId, payrollStatus, city, vehicleStatus
      ) VALUES (
        'app-1001',
        'job-swe-google',
        'Software Development Engineer II (Frontend / React)',
        'Google India',
        'Vikas Reddy',
        'vikas.reddy@example.com',
        '+91 9884411223',
        'https://startaply.com/resumes/vikas_reddy_cv.pdf',
        $1,
        'system',
        'DH-PAYROLL-49201',
        'ACCOUNT_OPENED',
        'Bangalore',
        'Two Wheeler'
      )
      ON CONFLICT (id) DO UPDATE SET
        payrollStatus = EXCLUDED.payrollStatus
    `, [now]);

    console.log('--- ALL ENTITIES SEEDED AND VERIFIED IN DATABASE! ---');
  } catch (err) {
    console.error('Error seeding entities:', err);
  } finally {
    process.exit(0);
  }
}

seedAllEntities();
