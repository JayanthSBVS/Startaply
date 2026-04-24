require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const dummyJobs = [
  {
    id: 'job-1',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    title: 'Frontend Developer (React)',
    subtitle: 'Build amazing user interfaces',
    description: 'We are looking for an experienced React developer to build modern web applications using cutting-edge technologies.',
    fullDescription: 'Join our team as a Frontend Developer and work on high-visibility projects. You will collaborate with designers and backend engineers to create scalable, robust, and beautiful applications.\n\nKey Responsibilities:\n- Build interactive UI components using React\n- Optimize application performance\n- Write unit tests for your code',
    requiredSkills: 'React, JavaScript, Tailwind CSS, REST APIs',
    techStack: 'React, Node.js, Vercel, PostgreSQL',
    aboutCompany: 'Tech Innovators is a fast-growing startup revolutionizing the software industry.',
    benefits: 'Health Insurance, Remote Work Options, Flexible Hours, Stock Options',
    company: 'Tech Innovators',
    companyLogo: '',
    companyColor: '#3b82f6',
    location: 'Remote',
    workMode: 'Remote',
    qualification: 'Bachelor\'s in Computer Science or related field',
    experience: '2-4 Years',
    salary: '₹12L - ₹18L PA',
    type: 'Full-time',
    category: 'IT & Software Jobs',
    monthTag: 'April',
    applyUrl: 'https://example.com/apply',
    applyType: 'easy',
    expiryDays: 30,
    isFeatured: true,
    isTrending: false,
    isToday: false,
    isVisible: true
  },
  {
    id: 'job-2',
    createdAt: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 4,
    title: 'Backend Engineer (Node.js)',
    subtitle: 'Scale our API architecture',
    description: 'Looking for a Node.js expert to help us scale our cloud infrastructure and improve our backend API services.',
    fullDescription: 'As a Backend Engineer, you will be responsible for the server-side logic of our application. You will build highly scalable and reliable APIs, integrate with third-party services, and optimize database queries.\n\nKey Responsibilities:\n- Design and implement APIs\n- Manage cloud infrastructure\n- Debug complex issues',
    requiredSkills: 'Node.js, Express, PostgreSQL, AWS',
    techStack: 'Node.js, Docker, Kubernetes, AWS',
    aboutCompany: 'CloudScale provides enterprise cloud solutions for growing businesses.',
    benefits: 'Competitive Salary, Gym Membership, Free Lunches',
    company: 'CloudScale',
    companyLogo: '',
    companyColor: '#f59e0b',
    location: 'Bangalore, India',
    workMode: 'Hybrid',
    qualification: 'B.Tech/BE in CS/IT',
    experience: '3-6 Years',
    salary: '₹15L - ₹25L PA',
    type: 'Full-time',
    category: 'IT & Software Jobs',
    monthTag: 'April',
    applyUrl: 'https://example.com/careers',
    applyType: 'external',
    expiryDays: 30,
    isFeatured: false,
    isTrending: true,
    isToday: true,
    isVisible: true
  },
  {
    id: 'job-3',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    title: 'Marketing Manager',
    subtitle: 'Drive our brand presence',
    description: 'Experienced marketing manager needed to lead campaign strategies and growth marketing initiatives.',
    fullDescription: 'We are seeking a dynamic Marketing Manager to develop and execute marketing strategies that drive brand awareness and customer acquisition. You will manage a team of marketing specialists and oversee digital, social, and traditional marketing campaigns.\n\nKey Responsibilities:\n- Develop marketing strategies\n- Manage campaign budgets\n- Analyze performance metrics',
    requiredSkills: 'Digital Marketing, SEO, Content Strategy, Analytics',
    techStack: 'Google Analytics, HubSpot, Salesforce',
    aboutCompany: 'GrowthHub is a leading marketing agency helping brands grow.',
    benefits: 'Performance Bonus, Flexible Hours, Mental Health Support',
    company: 'GrowthHub',
    companyLogo: '',
    companyColor: '#ec4899',
    location: 'Mumbai, India',
    workMode: 'On-site',
    qualification: 'MBA in Marketing or related field',
    experience: '5+ Years',
    salary: '₹10L - ₹15L PA',
    type: 'Full-time',
    category: 'Non-IT Jobs',
    monthTag: 'April',
    applyUrl: 'https://example.com/apply/marketing',
    applyType: 'easy',
    expiryDays: 30,
    isFeatured: true,
    isTrending: true,
    isToday: false,
    isVisible: true
  },
  {
    id: 'job-4',
    createdAt: Date.now() - 1000 * 60 * 60 * 48, // 48 hours ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 48,
    title: 'Delivery Executive',
    subtitle: 'Ensure fast and reliable deliveries',
    description: 'Join our logistics team as a Delivery Executive. Flexible working hours and great incentives.',
    fullDescription: 'We are hiring Delivery Executives for our last-mile delivery network. You will pick up and deliver packages to customers efficiently and safely. This is a great opportunity for those seeking flexible gig work.\n\nKey Responsibilities:\n- Pick up and deliver packages\n- Maintain delivery logs\n- Ensure customer satisfaction',
    requiredSkills: 'Driving License, Time Management, Local Area Knowledge',
    techStack: 'Mobile App usage',
    aboutCompany: 'QuickDrop Logistics operates the fastest delivery network in the city.',
    benefits: 'Fuel Allowance, Performance Incentives, Health Insurance',
    company: 'QuickDrop',
    companyLogo: '',
    companyColor: '#10b981',
    location: 'Delhi NCR',
    workMode: 'On-site',
    qualification: 'High School Diploma',
    experience: '0-2 Years',
    salary: '₹15k - ₹25k / month',
    type: 'Part-time',
    category: 'Warehouse & Logistics',
    monthTag: 'April',
    applyUrl: 'https://example.com/delivery',
    applyType: 'easy',
    expiryDays: 30,
    isFeatured: false,
    isTrending: false,
    isToday: false,
    isVisible: true
  },
  {
    id: 'job-5',
    createdAt: Date.now() - 1000 * 60 * 30, // 30 mins ago
    updatedAt: Date.now() - 1000 * 60 * 30,
    title: 'UI/UX Designer',
    subtitle: 'Craft beautiful user experiences',
    description: 'Looking for a passionate UI/UX Designer to design elegant and intuitive interfaces for our digital products.',
    fullDescription: 'As a UI/UX Designer, you will shape the user experience of our platforms. You will conduct user research, create wireframes and prototypes, and design highly polished user interfaces.\n\nKey Responsibilities:\n- Create user personas and journeys\n- Design wireframes and high-fidelity mockups\n- Collaborate with developers',
    requiredSkills: 'Figma, Adobe XD, User Research, Prototyping',
    techStack: 'Figma, Sketch, InVision',
    aboutCompany: 'DesignStudio creates award-winning digital experiences.',
    benefits: 'Creative Environment, Paid Time Off, Equipment Allowance',
    company: 'DesignStudio',
    companyLogo: '',
    companyColor: '#8b5cf6',
    location: 'Remote',
    workMode: 'Remote',
    qualification: 'Degree in Design, HCI or related field',
    experience: '3-5 Years',
    salary: '₹8L - ₹14L PA',
    type: 'Contract',
    category: 'Gig & Flexible Work',
    monthTag: 'April',
    applyUrl: 'https://example.com/designer',
    applyType: 'external',
    expiryDays: 30,
    isFeatured: true,
    isTrending: false,
    isToday: true,
    isVisible: true
  }
];

async function seedJobs() {
  try {
    // Optionally clear existing dummy jobs (we won't clear ALL jobs to avoid losing admin changes, but let's clear the old json ones if they exist)
    await pool.query('DELETE FROM jobs');

    for (const job of dummyJobs) {
      const keys = Object.keys(job);
      const placeholders = Object.keys(job).map((_, i) => `$${i + 1}`);
      const values = Object.values(job);

      const query = `
        INSERT INTO jobs (${keys.join(', ')})
        VALUES (${placeholders.join(', ')})
        ON CONFLICT (id) DO UPDATE SET
          updatedat = EXCLUDED.updatedat,
          title = EXCLUDED.title,
          description = EXCLUDED.description
      `;

      await pool.query(query, values);
    }

    console.log('Dummy jobs seeded successfully!');
  } catch (err) {
    console.error('Error seeding jobs:', err);
  } finally {
    pool.end();
  }
}

seedJobs();
