import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, ChevronRight, CheckCircle2,
  Menu, X, Sparkles, Check, CheckCheck, Target, XCircle,
  Laptop, Briefcase, GraduationCap, Globe, Compass, Quote, Zap,
  Layers, Users, Building2, Truck, Bike, User
} from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// ── 1. CANDIDATE & TALENT PERSONAS (GRADUATES, PROFESSIONALS, GIG & DELIVERY) ──
const CANDIDATE_PERSONAS = [
  {
    id: 'fresher',
    title: 'Recent Graduates & Freshers',
    sub: 'Class of 2024, 2025 & 2026',
    tagline: 'Break out of the "minimum experience" loop.',
    description: 'Fresh out of college with ambition, but facing arbitrary rejection filters or predatory consultancies demanding upfront registration fees.',
    highlights: [
      'Bypass middleman consultancies demanding upfront registration fees',
      'Direct access to entry-level corporate drives and verified hiring teams',
      'Free interview preparation modules with real screening questions'
    ],
    avatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80',
    stat: '8,400+ Placed'
  },
  {
    id: 'lateral',
    title: 'Experienced Professionals',
    sub: '1 to 8+ Years in Tech & Corporate',
    tagline: 'Direct conversations. Zero ghost job scrapers.',
    description: 'Tired of applying into black-hole resume databases, dealing with unvetted headhunters, and discovering hidden commission deductions after offer stage.',
    highlights: [
      'Direct HR outreach with authenticated hiring manager listings',
      '100% transparent CTC breakdowns (fixed vs variable vs take-home)',
      'Single verified identity eliminating duplicate agency submissions'
    ],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    stat: '4,600+ Moves'
  },
  {
    id: 'gig',
    title: 'Gig Workers & Delivery Partners',
    sub: 'Logistics, On-Demand Delivery & Operations',
    tagline: 'Immediate joining. Direct daily & weekly payouts.',
    description: 'Delivery partners, dark-store staff, warehouse associates, and field personnel looking for immediate joining without paying commissions to local middlemen.',
    highlights: [
      'Direct onboarding with leading logistics, grocery and food delivery fleets',
      '100% direct bank payouts (daily/weekly) with strictly ₹0 agency deduction',
      'Verified physical hubs with authentic fleet managers and instant dispatch'
    ],
    avatar: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=400&q=80',
    stat: '5,200+ Active Fleet'
  }
];

// ── 2. CAREER ROADMAP & STAGE TRAJECTORY (ZERO HARDCODED CTC) ──
const CAREER_ROADMAPS = {
  fresher: {
    title: 'Graduate Direct Trajectory (0–1 Years)',
    focus: 'Data Structures, JavaScript/Core Fundamentals, System Basics, STAR Behavioral',
    benchmarkCTC: 'Market-Competitive Entry Pay Bands',
    directGateway: 'Direct Campus Mega Drives & Junior Requisitions',
    takeHomeGuarantee: '100% of your starter salary stays in your bank. Strictly ₹0 registration fee.',
    prepMilestone: 'Mastered 40+ Core Q&As • Verified Candidate Badge'
  },
  mid: {
    title: 'Early Professional Trajectory (1–3 Years)',
    focus: 'Scalable Microservices, Cloud Architecture (AWS/Azure), REST/GraphQL, Clean Code',
    benchmarkCTC: 'Experience-Scaled Industry Standard Bands',
    directGateway: 'Direct Corporate HR Outreach & Lateral Requisitions',
    takeHomeGuarantee: 'Complete transparency on fixed vs variable pay. Zero third-party deductions.',
    prepMilestone: 'Verified Notice Period • Authenticated Profile Review'
  },
  gig: {
    title: 'Gig & Delivery Services Track (Operations & Dispatch)',
    focus: 'Document Verification (Aadhaar / Driving License), Hub Dispatch, Shift Scheduling',
    benchmarkCTC: 'Direct Daily & Weekly Shift Payouts + Incentives',
    directGateway: 'Direct Logistics Hubs, Dark-Stores & Fleet Manager Walk-ins',
    takeHomeGuarantee: 'Keep 100% of your delivery earnings, surge bonuses, and customer tips.',
    prepMilestone: 'Verified Identity • Instant Digital Fleet Gate Pass'
  },
  lead: {
    title: 'Senior Specialist & Team Lead (4+ Years)',
    focus: 'Distributed Systems, High-Concurrency Design, Mentorship, Cross-Functional Strategy',
    benchmarkCTC: 'Leadership & Senior Equity Packages',
    directGateway: 'Confidential Direct Requisitions from Engineering Directors & VPs',
    takeHomeGuarantee: 'Zero commission markups. Direct corporate compensation & bonus structures.',
    prepMilestone: 'Confidential Senior Passport • Direct Leadership Gateway'
  }
};

// ── 3. CAREER & GIG DISCIPLINES (NO EXPLICIT SALARY NUMBERS) ──
const DISCIPLINES = [
  {
    title: 'Software & Cloud Engineering',
    roles: 'Frontend (React), Backend (Node/Java), Cloud (AWS/Azure), Full-Stack, DevOps',
    compensation: 'Role & Skill-Aligned Pay Bands',
    skills: ['React', 'Node.js', 'Python', 'AWS', 'System Design'],
    openRequisitions: '180+ Active Teams'
  },
  {
    title: 'Product Design & User Experience',
    roles: 'Product Designers, UI/UX Specialists, Design System Architects, Researchers',
    compensation: 'Portfolio & Experience-Aligned Pay',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    openRequisitions: '45+ Active Teams'
  },
  {
    title: 'Logistics, Delivery & Field Gig Services',
    roles: 'Delivery Partners, Dark-Store Associates, Field Executives, Hub Supervisors',
    compensation: 'Daily / Weekly Payouts + Shift Incentives',
    skills: ['Route Navigation', 'Timely Dispatch', 'Customer Care', 'Vehicle Operations'],
    openRequisitions: '350+ Active Hubs'
  },
  {
    title: 'Enterprise Customer Operations & CX',
    roles: 'Customer Success Managers, Enterprise Voice Leads, Technical Support Specialists',
    compensation: 'Base Pay + Performance Incentives',
    skills: ['Client Advisory', 'CRM Tools', 'Escalation Resolution', 'Voice Operations'],
    openRequisitions: '120+ Active Teams'
  },
  {
    title: 'Banking, Fintech & Financial Advisory',
    roles: 'Relationship Managers, Digital Banking Associates, Credit Analysts, Wealth Leads',
    compensation: 'Industry-Standard Packages + Bonus',
    skills: ['Retail Assets', 'Financial Advisory', 'Risk Analysis', 'Client Acquisition'],
    openRequisitions: '75+ Active Teams'
  },
  {
    title: 'Pan-India Remote & Hybrid Careers',
    roles: 'Remote Developers, Content Strategists, Inside Sales Leads, QA Specialists',
    compensation: 'Location-Independent Pay Bands',
    skills: ['Asynchronous Work', 'Git', 'Agile Workflows', 'Documentation'],
    openRequisitions: '60+ Active Teams'
  }
];

// ── 4. INTERACTIVE FLASHCARD PREPARATION DATA ──
const FLASHCARDS = [
  {
    category: 'JavaScript & React Architecture',
    question: 'How does React Context differ from Redux or Zustand, and when does it cause unnecessary renders?',
    answer: 'React Context triggers re-renders on ALL consuming components whenever the context value reference changes. State libraries (Zustand/Redux) use granular selectors to subscribe only to specific slices, preventing unnecessary sub-tree re-renders.',
    interviewerNote: 'Top tech interviewers look for knowledge of `useMemo` with Context and when to decouple high-frequency state.'
  },
  {
    category: 'System Design & Scalability',
    question: 'Explain how you design an idempotent payment processing API to prevent duplicate transactions.',
    answer: 'Generate a unique client-side `Idempotency-Key` (e.g., UUIDv4) in the request header. Cache this key in Redis with an atomic lock. If the key exists, return the cached transaction response instead of reprocessing the payment.',
    interviewerNote: 'Mentioning atomic distributed locks (Redis SETNX) demonstrates enterprise production readiness.'
  },
  {
    category: 'HR Behavioral (STAR Framework)',
    question: 'Tell me about a time you missed a project deadline. How did you handle the situation?',
    answer: 'Structured STAR response: Focus 20% on the unforeseen technical bottleneck, 50% on proactively notifying stakeholders 48 hours early with revised scope trade-offs, and 30% on the implemented automated tests that prevented recurrence.',
    interviewerNote: 'Accountability and proactive communication are 10x more valued than excuses.'
  }
];

// ── 5. SINGLE TESTIMONIAL SUITE: VERIFIED CANDIDATE REVIEWS (ZERO SALARY FIGURES) ──
const TESTIMONIALS = [
  {
    name: 'Ananya Reddy',
    college: 'JNTU Hyderabad',
    company: 'Tech Mahindra',
    role: 'Associate Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    quote: 'Applied directly with my project portfolio and cleared the technical evaluation in 4 days. Zero middleman fees, zero commissions deducted from my salary.',
    status: 'Verified Corporate Placement'
  },
  {
    name: 'Rahul Sharma',
    college: 'VIT Vellore',
    company: 'Amazon India',
    role: 'Frontend Engineer (React / AWS)',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=80',
    quote: 'I practiced using the Startaply Interview Preparation hub every night. When the direct requisition opened, I submitted my profile and Amazon HR reached out in 48 hours.',
    status: 'Verified Lateral Placement'
  },
  {
    name: 'Mohammed Rizwan',
    college: 'Osmania University',
    company: 'Swiggy Logistics Network',
    role: 'Delivery Operations Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    quote: 'Third-party consultancies in my city wanted registration fees just to get a hub pass. Startaply verified my documents and connected me directly with the hub manager for free.',
    status: 'Verified Operations Placement'
  }
];

// ── 6. COMPACT ENTERPRISE RECRUITER LOGO STRIP (CLEAN & UNIQUE) ──
const ENTERPRISE_LOGOS = [
  { name: 'Amazon', symbol: 'amazon', sector: 'Tech & Fulfillment' },
  { name: 'Tech Mahindra', symbol: 'Tech Mahindra', sector: 'Enterprise IT' },
  { name: 'Swiggy', symbol: 'SWIGGY', sector: 'Delivery & Logistics' },
  { name: 'Infosys BPM', symbol: 'Infosys', sector: 'Operations & CX' },
  { name: 'Kotak Mahindra', symbol: 'Kotak', sector: 'Digital Banking' },
  { name: 'Wipro', symbol: 'Wipro', sector: 'Cloud & Services' },
  { name: 'Flipkart', symbol: 'Flipkart', sector: 'E-Commerce & Supply' },
  { name: 'Zomato', symbol: 'zomato', sector: 'Delivery Fleet' }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  // Navigation & UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [passportPersona, setPassportPersona] = useState('student'); // 'student' | 'lateral' | 'gig'
  const [careerStageKey, setCareerStageKey] = useState('fresher'); // 'fresher' | 'mid' | 'gig' | 'lead'
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // Guarantee light theme by default unless explicitly toggled
  useEffect(() => {
    const hasExplicitToggle = sessionStorage.getItem('landing_theme_toggled');
    if (!hasExplicitToggle && theme !== 'light') {
      setTheme?.('light');
    }
    const root = window.document.documentElement;
    if (!hasExplicitToggle) {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, []);

  const handleManualThemeToggle = () => {
    sessionStorage.setItem('landing_theme_toggled', '1');
  };

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentRoadmap = CAREER_ROADMAPS[careerStageKey];
  const currentFlashcard = FLASHCARDS[activeFlashcardIndex];

  return (
    <div className="min-h-screen w-full bg-[#F4F6FB] dark:bg-[#070B14] text-[#0A0F1D] dark:text-[#F8FAFC] font-sans selection:bg-brand selection:text-white overflow-x-hidden antialiased transition-colors duration-200">

      {/* ── 1. CLEAN MODERN NAVBAR (BALANCED, NO PILL BADGES, PERFECT BUTTON ALIGNMENT) ── */}
      <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#070B14]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Left: Clean Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center shrink-0" aria-label="Startaply Home">
              <BrandLogo variant="horizontal" height={28} />
            </Link>
          </div>

          {/* Center: Precision Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="px-3.5 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold text-[13px] transition-all cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('candidates')}
              className="px-3.5 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold text-[13px] transition-all cursor-pointer"
            >
              Who It's For
            </button>
            <button
              onClick={() => scrollToSection('disciplines')}
              className="px-3.5 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold text-[13px] transition-all cursor-pointer"
            >
              Disciplines
            </button>
            <button
              onClick={() => scrollToSection('candidates')}
              className="px-3.5 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold text-[13px] transition-all cursor-pointer"
            >
              Gig &amp; Delivery
            </button>
            <button
              onClick={() => scrollToSection('stories')}
              className="px-3.5 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold text-[13px] transition-all cursor-pointer"
            >
              Stories
            </button>
            <Link
              to="/employer"
              className="px-3.5 py-1.5 rounded-full text-brand hover:bg-brand/10 font-bold text-[13px] transition-all flex items-center gap-1 cursor-pointer"
            >
              <Building2 size={13} />
              <span>For Employers</span>
            </Link>
          </nav>

          {/* Right Action Cluster (Carefully Aligned Sign In & Join Free) */}
          <div className="hidden sm:flex items-center gap-3">
            <div onClick={handleManualThemeToggle} className="cursor-pointer p-1">
              <ThemeToggle />
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/"
                  className="h-8 px-3.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <span>Go to Jobs Feed</span>
                  <ArrowRight size={13} />
                </Link>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <User size={13} className="text-brand" />
                  <span>{user.name ? user.name.split(' ')[0] : 'Candidate'}</span>
                  {user.careerTrack && (
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand/10 text-brand dark:text-blue-400">
                      {user.careerTrack}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand dark:hover:text-white transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>

                <Link
                  to="/signup"
                  className="h-9 px-5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-brand/20 active:scale-95 inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-all"
                >
                  <span>Join Free</span>
                  <ArrowRight size={14} className="shrink-0" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <div onClick={handleManualThemeToggle}>
              <ThemeToggle />
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 cursor-pointer active:scale-95 transition-transform"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-6 flex flex-col gap-3 shadow-2xl text-left animate-in fade-in slide-in-from-top-2 duration-150">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-100 py-3 min-h-[44px] border-b border-slate-100 dark:border-slate-800 text-left cursor-pointer active:bg-slate-100/50 dark:active:bg-slate-800/50 rounded-lg px-2 -mx-2 transition-colors"
            >
              <Compass size={17} className="text-brand shrink-0" />
              <span>How Direct Mobility Works</span>
            </button>
            <button
              onClick={() => scrollToSection('candidates')}
              className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-100 py-3 min-h-[44px] border-b border-slate-100 dark:border-slate-800 text-left cursor-pointer active:bg-slate-100/50 dark:active:bg-slate-800/50 rounded-lg px-2 -mx-2 transition-colors"
            >
              <Users size={17} className="text-brand shrink-0" />
              <span>Who Startaply Is For</span>
            </button>
            <button
              onClick={() => scrollToSection('disciplines')}
              className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-100 py-3 min-h-[44px] border-b border-slate-100 dark:border-slate-800 text-left cursor-pointer active:bg-slate-100/50 dark:active:bg-slate-800/50 rounded-lg px-2 -mx-2 transition-colors"
            >
              <Layers size={17} className="text-brand shrink-0" />
              <span>Career &amp; Gig Disciplines</span>
            </button>
            <button
              onClick={() => scrollToSection('stories')}
              className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-100 py-3 min-h-[44px] border-b border-slate-100 dark:border-slate-800 text-left cursor-pointer active:bg-slate-100/50 dark:active:bg-slate-800/50 rounded-lg px-2 -mx-2 transition-colors"
            >
              <Quote size={17} className="text-brand shrink-0" />
              <span>Verified Stories</span>
            </button>

            <Link
              to="/employer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 text-sm font-bold text-brand py-3 min-h-[44px] border-b border-slate-100 dark:border-slate-800 text-left cursor-pointer active:bg-brand/10 rounded-lg px-2 -mx-2 transition-colors"
            >
              <Building2 size={17} className="text-brand shrink-0" />
              <span>For Employers (Post a Job)</span>
            </Link>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              {user ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100">
                    <User size={15} className="text-brand" />
                    <span>{user.name || 'Candidate'}</span>
                  </div>
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 text-center text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800"
                  >
                    Sign In to Account
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 text-center text-xs font-bold rounded-xl bg-brand text-white shadow-xs"
                  >
                    Create Free Candidate Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── 2. HERO: EDITORIAL SPLIT WITH THE DIRECT PASSPORT SIMULATOR ── */}
      <section id="how-it-works" className="relative w-full pt-12 pb-16 md:pt-16 md:pb-24 border-b border-slate-200/90 dark:border-slate-800 bg-field-gradient relative overflow-hidden">

        {/* Cropped Radial Gradient Background Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-cropped-radial pointer-events-none opacity-80" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

            {/* Left Broadsheet Editorial Column (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.08]">
                Welcome to India’s <br />
                <span className="type-gradient">direct career community.</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-4 sm:mt-5 text-sm sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
                Where ambitious college graduates, experienced professionals, and on-demand delivery &amp; operations talent connect directly with verified enterprise teams. Bypass predatory consultancies, practice with real interview intelligence, and keep 100% of your earned compensation.
              </p>

              {/* Action Buttons */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Link
                  to="/signup"
                  className="btn-graphic-hover min-h-[50px] px-8 bg-brand hover:bg-brand-hover text-white text-base font-bold shadow-md shadow-brand/20 active:scale-95"
                >
                  <span>Build Your Direct Profile</span>
                  <ArrowRight size={18} className="btn-icon" />
                </Link>

                <button
                  onClick={() => scrollToSection('candidates')}
                  className="btn-skeuomorphic min-h-[50px] px-7 rounded-xl text-slate-800 dark:text-white text-base font-semibold cursor-pointer"
                >
                  Discover Who It's For
                </button>
              </div>

              {/* Character Metrics Strip */}
              <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 w-full max-w-2xl">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">14,500+</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Direct Placements</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">500+</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Enterprise Partners</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">100%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Direct Bank Payout</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">₹0</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Brokerage Deducted</div>
                </div>
              </div>

            </div>

            {/* Right Product Console: DIRECT CAREER PASSPORT SIMULATOR */}
            <div className="lg:col-span-5 w-full">

              {/* Persona Selector Tabs for the Simulator (Only Graduate, Professional, Gig & Delivery) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5 px-1 text-xs font-bold text-slate-500">
                <span className="uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">Simulate Track:</span>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setPassportPersona('student')}
                    className={`min-h-[44px] px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center border active:scale-95 ${
                      passportPersona === 'student'
                        ? 'bg-brand text-white border-brand shadow-sm shadow-brand/25 font-extrabold'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand/40'
                    }`}
                  >
                    Graduate
                  </button>
                  <button
                    onClick={() => setPassportPersona('lateral')}
                    className={`min-h-[44px] px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center border active:scale-95 ${
                      passportPersona === 'lateral'
                        ? 'bg-brand text-white border-brand shadow-sm shadow-brand/25 font-extrabold'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand/40'
                    }`}
                  >
                    Professional
                  </button>
                  <button
                    onClick={() => setPassportPersona('gig')}
                    className={`min-h-[44px] px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center border active:scale-95 ${
                      passportPersona === 'gig'
                        ? 'bg-brand text-white border-brand shadow-sm shadow-brand/25 font-extrabold'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand/40'
                    }`}
                  >
                    Gig &amp; Delivery
                  </button>
                </div>
              </div>

              {/* CRISP, ULTRA-SHARP DIRECT PASSPORT CARD */}
              <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl dark:shadow-black/60 p-4 sm:p-7 relative text-left flex flex-col justify-between transition-all">

                {/* Header */}
                <div className="pb-3.5 sm:pb-4 border-b border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-brand flex items-center justify-center font-bold text-sm shrink-0">
                      <Target size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">DIRECT MOBILITY PASSPORT</span>
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-950 dark:text-white leading-tight">
                        {passportPersona === 'student' && 'Graduate Direct Pathway'}
                        {passportPersona === 'lateral' && 'Professional Engineering Pathway'}
                        {passportPersona === 'gig' && 'Gig & Delivery Services Pathway'}
                      </h4>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    Zero Middlemen
                  </span>
                </div>

                {/* 4-Stage Trajectory Flow */}
                <div className="py-3.5 sm:py-4 space-y-2.5 sm:space-y-3">

                  {/* Stage 1 */}
                  <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 flex items-start gap-2.5 sm:gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-brand font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <div className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-snug">
                        {passportPersona === 'student' && 'Academic Credential & Project Verification'}
                        {passportPersona === 'lateral' && 'GitHub Architecture & Experience Validation'}
                        {passportPersona === 'gig' && 'Aadhaar, Driving License & Vehicle Verification'}
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 leading-normal">
                        Authenticated identity eliminating spam resumes and fake agency forwards.
                      </div>
                    </div>
                  </div>

                  {/* Stage 2 */}
                  <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 flex items-start gap-2.5 sm:gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <div className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-snug">
                        {passportPersona === 'gig' ? 'Route Allocation & Hub Dispatch Onboarding' : 'Free Company Interview Intelligence Hub'}
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 leading-normal">
                        {passportPersona === 'gig'
                          ? 'Direct digital assignment to localized dark-stores, delivery zones, and customer dispatch hubs.'
                          : 'Practice real corporate technical questions, architecture reviews, and HR STAR frameworks.'}
                      </div>
                    </div>
                  </div>

                  {/* Stage 3 */}
                  <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 flex items-start gap-2.5 sm:gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <div className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-snug">
                        {passportPersona === 'gig' ? 'Direct Fleet Manager Walk-in & Hub Gate Pass' : 'Direct Corporate Routing & Walk-in Passes'}
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 leading-normal">
                        {passportPersona === 'gig'
                          ? 'Exact GPS location of the logistics hub with QR gate pass for instant equipment and bag pickup.'
                          : 'Exact venue GPS coordinates and authenticated recruiter pipeline without fee-charging agencies.'}
                      </div>
                    </div>
                  </div>

                  {/* Stage 4 */}
                  <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-2.5 sm:gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <div className="text-xs sm:text-[13px] font-bold text-emerald-900 dark:text-emerald-200 leading-snug">
                        {passportPersona === 'gig' ? '100% Daily & Weekly Payouts to Bank (Zero Cut)' : '100% Direct Salary Credited to Your Bank'}
                      </div>
                      <div className="text-[11px] sm:text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-semibold leading-normal">
                        Strictly ₹0 candidate deductions. You keep every single rupee of your corporate contract.
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer Action */}
                <div className="pt-3.5 sm:pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    100% Free Forever for Job Seekers
                  </div>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-sm shadow-brand/20 active:scale-95 transition-all shrink-0"
                  >
                    <span>Claim Your Pass</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 3. UNIQUE, COMPACT ENTERPRISE RECRUITER LOGO SHOWCASE (NOT BIG, CLEAN & UNIQUE) ── */}
      <section className="w-full py-7 sm:py-8 border-b border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#070B14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-5">
            DIRECT HIRING DRIVES &amp; VERIFIED HUB PASSES POWERED ACROSS
          </p>

          {/* Compact, clean horizontal logo showcase with authentic branding */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-12">
            {ENTERPRISE_LOGOS.map((company, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all duration-200 cursor-default select-none"
              >
                <span className="text-sm sm:text-base font-black tracking-tight font-sans text-slate-800 dark:text-slate-200 group-hover:text-brand transition-colors">
                  {company.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                  • {company.sector}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 4. WHO IS STARTAPLY FOR? (FRESHERS, LATERALS, GIG & DELIVERY) ── */}
      <section id="candidates" className="w-full py-16 md:py-20 border-b border-slate-200/90 dark:border-slate-800 bg-[#F4F6FB] dark:bg-[#070B14] grid-lines">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="max-w-3xl mb-12 text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
              Engineered for every candidate seeking genuine opportunity.
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              Whether you are taking your first career step, transitioning to a senior corporate role, or joining on-demand logistics &amp; delivery operations — Startaply provides an unbrokeraged, transparent path.
            </p>
          </div>

          {/* Symmetrical 3-Card Grid (No Pill Badges) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {CANDIDATE_PERSONAS.map((persona) => (
              <div
                key={persona.id}
                className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 soft-shadow flex flex-col justify-between hover:border-brand/40 transition-all group"
              >
                <div>
                  {/* Clean Photo Banner */}
                  <div className="w-full h-48 rounded-2xl overflow-hidden relative mb-5 shadow-sm">
                    <img
                      src={persona.avatar}
                      alt={persona.title}
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%230F172A"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364748B" font-family="sans-serif" font-size="16">Startaply Direct Track</text></svg>';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[11px] font-bold">
                      {persona.stat}
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-brand uppercase tracking-wider block">
                    {persona.sub}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-950 dark:text-white mt-1">
                    {persona.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 italic">
                    "{persona.tagline}"
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                    {persona.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {persona.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200">
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Link
                    to="/signup"
                    className="btn-graphic-hover w-full min-h-[44px] py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl justify-center flex items-center"
                  >
                    <span>Get Started</span>
                    <ArrowRight size={14} className="btn-icon" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 5. INTERACTIVE CAREER STAGE ROADMAP (ZERO HARDCODED SALARY) ── */}
      <section className="w-full py-16 md:py-20 border-b border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="max-w-3xl mb-12 text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Select Your Track &amp; Map Your Path
            </h2>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
              See the exact preparation focus, direct corporate gateway, and compensation transparency engineered for your journey.
            </p>

            <div className="mt-6 flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold -mx-1 px-1 sm:mx-0 sm:flex-wrap">
              <button
                onClick={() => setCareerStageKey('fresher')}
                className={`btn-press whitespace-nowrap shrink-0 min-h-[44px] px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  careerStageKey === 'fresher' ? 'bg-brand text-white border-brand-hover shadow-xs' : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Graduate (0–1 Yrs)
              </button>
              <button
                onClick={() => setCareerStageKey('mid')}
                className={`btn-press whitespace-nowrap shrink-0 min-h-[44px] px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  careerStageKey === 'mid' ? 'bg-brand text-white border-brand-hover shadow-xs' : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Early Professional (1–3 Yrs)
              </button>
              <button
                onClick={() => setCareerStageKey('gig')}
                className={`btn-press whitespace-nowrap shrink-0 min-h-[44px] px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  careerStageKey === 'gig' ? 'bg-brand text-white border-brand-hover shadow-xs' : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Gig &amp; Delivery Services
              </button>
              <button
                onClick={() => setCareerStageKey('lead')}
                className={`btn-press whitespace-nowrap shrink-0 min-h-[44px] px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  careerStageKey === 'lead' ? 'bg-brand text-white border-brand-hover shadow-xs' : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Senior Specialist (4+ Yrs)
              </button>
            </div>
          </div>

          {/* Roadmap Card */}
          <div className="p-5 sm:p-10 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 soft-shadow text-left">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-brand uppercase">CORE PREPARATION FOCUS</span>
                <h4 className="text-base font-bold text-slate-950 dark:text-white">{currentRoadmap.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{currentRoadmap.focus}</p>
                <div className="pt-2 text-[11px] font-semibold text-brand">{currentRoadmap.prepMilestone}</div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-600 uppercase">DIRECT CORPORATE GATEWAY</span>
                <h4 className="text-base font-bold text-slate-950 dark:text-white">Direct Requisition Channel</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{currentRoadmap.directGateway}</p>
                <div className="pt-2 text-[11px] font-semibold text-emerald-600">✓ Single Verified Candidate Record</div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-purple-600 uppercase">COMPENSATION TRANSPARENCY</span>
                <div className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white font-mono">{currentRoadmap.benchmarkCTC}</div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{currentRoadmap.takeHomeGuarantee}</p>
                <div className="pt-2">
                  <Link to="/signup" className="btn-underline text-xs font-bold text-brand">
                    Build This Trajectory Now →
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── 6. "THE DIRECT ADVANTAGE": TRADITIONAL CONSULTANCIES VS STARTAPLY DIRECT ── */}
      <section className="w-full py-16 md:py-20 border-b border-slate-200/90 dark:border-slate-800 bg-[#F4F6FB] dark:bg-[#070B14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="max-w-3xl mb-12 text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              The Broken Status Quo vs Startaply Direct
            </h2>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
              Why thousands of ambitious students, lateral hires, and delivery personnel across India are abandoning fee-charging intermediaries and switching to direct verification.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">

            {/* The Broken Traditional Way */}
            <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-950/40 soft-shadow space-y-5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-red-600">
                <XCircle size={18} />
                <span>TRADITIONAL UNVERIFIED CONSULTANCIES &amp; MIDDLEMEN</span>
              </div>

              <h3 className="text-xl font-bold text-slate-950 dark:text-white">
                Registration charges, commission cuts, and ghost forwards.
              </h3>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span><strong>Upfront registration fees</strong> demanded just to grant access to basic interview halls or delivery hub passes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span><strong>Substantial salary cuts</strong> extracted from your first month earnings or weekly delivery payouts.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Vague WhatsApp forwards with missing gate numbers and ghost corporate addresses.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Expired listings kept active for months just to farm and resell candidate contact details.</span>
                </li>
              </ul>
            </div>

            {/* The Startaply Direct Standard */}
            <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-300 dark:border-emerald-800 soft-shadow space-y-5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-emerald-600">
                <CheckCircle2 size={18} />
                <span>THE STARTAPLY DIRECT STANDARD</span>
              </div>

              <h3 className="text-xl font-bold text-slate-950 dark:text-white">
                100% free by law. Direct corporate HR. Full salary in bank.
              </h3>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Strictly ₹0 candidate &amp; partner fees</strong> guaranteed by platform architecture and strict policy.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>100% of your salary or delivery earnings credited</strong> directly to your bank account without deductions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Verified corporate points-of-contact and exact Google Maps coordinates with digital passes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>60-Day auto-purge rule eliminating stale ghost listings; 100% actively hiring corporate teams.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ── 7. INTERACTIVE KNOWLEDGE FLASHCARD ("TEST YOUR READINESS") ── */}
      <section className="w-full py-16 md:py-20 border-b border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="max-w-3xl mb-12 text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Test Your Knowledge Before Interview Day
            </h2>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
              Sample our free preparation bank curated from real technical and HR evaluation rounds at leading employers.
            </p>

            <div className="mt-6 flex overflow-x-auto no-scrollbar gap-2 pb-1 -mx-1 px-1 sm:mx-0 sm:flex-wrap">
              {FLASHCARDS.map((card, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveFlashcardIndex(idx);
                    setIsAnswerRevealed(false);
                  }}
                  className={`btn-press whitespace-nowrap shrink-0 min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    activeFlashcardIndex === idx ? 'bg-brand text-white border-brand-hover shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Question 0{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Flashcard Widget */}
          <div className="max-w-4xl rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-5 sm:p-10 soft-shadow text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-mono font-bold uppercase text-brand">
                {currentFlashcard.category}
              </span>
              <span className="text-xs font-mono text-slate-400">
                REAL CORPORATE SCREENING QUESTION
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white mt-5 leading-snug">
              {currentFlashcard.question}
            </h3>

            <div className="mt-6">
              {!isAnswerRevealed ? (
                <button
                  onClick={() => setIsAnswerRevealed(true)}
                  className="btn-skeuomorphic min-h-[44px] px-6 py-2.5 rounded-xl text-xs font-bold text-brand cursor-pointer flex items-center justify-center"
                >
                  Reveal Model Answer &amp; Interviewer Tip
                </button>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentFlashcard.answer}
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2">
                    <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Interviewer Insider Tip:</strong> {currentFlashcard.interviewerNote}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Over 500+ solved questions included in your free candidate profile</span>
              <Link to="/signup" className="btn-underline text-brand font-bold">
                Unlock Complete Bank →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── 8. CAREER DISCIPLINES: TOPIC EXPLORATION (STRICTLY SINGLE-LINE JOIN TRACK BUTTON) ── */}
      <section id="disciplines" className="w-full py-16 md:py-20 border-b border-slate-200/90 dark:border-slate-800 bg-[#F4F6FB] dark:bg-[#070B14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 text-left">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                Explore Direct Career Disciplines
              </h2>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                Navigate the exact corporate and operations sectors actively recruiting through Startaply across India.
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <Link
                to="/signup"
                className="btn-graphic-hover px-5 py-2.5 bg-brand text-white text-sm font-bold shadow-xs"
              >
                <span>Explore All Tracks</span>
                <ArrowRight size={15} className="btn-icon" />
              </Link>
            </div>
          </div>

          {/* Disciplines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {DISCIPLINES.map((d, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 soft-shadow hover:border-brand/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-mono">
                    <span className="text-brand font-bold">{d.openRequisitions}</span>
                    <span>Direct Pathway</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-950 dark:text-white leading-snug">
                    {d.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {d.roles}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {d.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Row: Guaranteed single line across all cards */}
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Compensation</span>
                    <div className="font-bold text-slate-900 dark:text-white text-xs mt-0.5 truncate" title={d.compensation}>
                      {d.compensation}
                    </div>
                  </div>
                  <Link
                    to="/signup"
                    className="shrink-0 whitespace-nowrap inline-flex items-center justify-center min-h-[44px] gap-1.5 px-3.5 py-2 rounded-xl bg-brand/10 hover:bg-brand text-brand hover:text-white font-bold text-xs transition-all shadow-xs active:scale-95 group"
                  >
                    <span>Join Track</span>
                    <ChevronRight size={13} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 9. CANDIDATE STORIES (ONE UNIFIED HIGH-FIDELITY TESTIMONIAL SUITE - NO PILL BADGES) ── */}
      <section id="stories" className="w-full py-16 md:py-20 border-b border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1120] relative overflow-hidden">

        {/* Background Mesh Gradient */}
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="max-w-3xl mb-12 text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
              Verified Placements. Zero Brokerage.
            </h2>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
              Read how candidates across India bypassed third-party agency cuts and connected directly with hiring enterprise teams.
            </p>
          </div>

          {/* Unified High-Fidelity 3-Card Testimonial Grid (Clean text, no pill badges) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 soft-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={15} />
                      {t.status}
                    </span>
                    <Quote size={24} className="text-brand/30" />
                  </div>

                  <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed italic mb-6">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    onError={(e) => {
                      e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23001F8E"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="sans-serif" font-weight="bold" font-size="36">${t.name.charAt(0)}</text></svg>`;
                    }}
                    className="w-12 h-12 rounded-full object-cover border-2 border-brand/20 shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">{t.name}</h4>
                    <div className="text-xs font-bold text-brand">{t.role}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{t.company} • {t.college}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 10. CLIMAX CALL TO ACTION ── */}
      <section className="w-full py-16 md:py-20 bg-[#F4F6FB] dark:bg-[#070B14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full bg-white dark:bg-slate-900 p-6 sm:p-16 rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-800 text-center soft-shadow relative overflow-hidden">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Ready to Accelerate Your Career? <br />
              <span className="type-gradient">Join India’s Direct Movement.</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-normal">
              Join thousands of candidates who secured verified corporate roles and delivery opportunities without paying middleman fees. 100% free forever for all job seekers.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="btn-graphic-hover w-full sm:w-auto px-8 py-3.5 bg-brand hover:bg-brand-hover text-white text-sm font-bold shadow-xs active:scale-95 gap-2"
              >
                <span>Create Free Candidate Profile</span>
                <ArrowRight size={16} className="btn-icon" />
              </Link>
              <Link
                to="/login"
                className="btn-skeuomorphic w-full sm:w-auto px-8 py-3.5 rounded-xl text-slate-800 dark:text-white text-sm font-semibold"
              >
                Sign In to Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. STREAMLINED FOOTER (CANDIDATE & COMMUNITY DIRECTORY) ── */}
      <footer className="w-full border-t border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#070B14] pt-16 pb-12 text-xs text-slate-500 dark:text-slate-400 relative overflow-hidden">

        {/* Subtle Watermark Typography */}
        <div className="w-full text-center select-none pointer-events-none opacity-[0.04] dark:opacity-[0.03] overflow-hidden">
          <span className="text-[14vw] font-black tracking-tighter uppercase whitespace-nowrap leading-none block">
            STARTAPLY
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand Column */}
            <div className="flex flex-col items-start pr-4 text-left">
              <Link to="/" className="mb-4" aria-label="Startaply Home">
                <BrandLogo variant="horizontal" height={28} />
              </Link>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal mb-4">
                Startaply is India’s direct opportunity engine, uniting college freshers, corporate talent, and on-demand operations personnel directly with verified hiring teams. Zero brokerage. Verified pooled drives and operations hubs nationwide.
              </p>
              <div className="text-[11px] text-slate-500 font-medium font-mono">
                BENGALURU • HYDERABAD • DELHI-NCR • MUMBAI • PUNE • CHENNAI • REGIONAL HUBS
              </div>
            </div>

            {/* Column 2: Career Disciplines */}
            <div className="flex flex-col gap-2.5 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1">Career &amp; Gig Tracks</h4>
              <Link to="/signup" className="btn-underline text-slate-500 hover:text-brand">Software &amp; Cloud Engineering</Link>
              <Link to="/signup" className="btn-underline text-slate-500 hover:text-brand">Product Design &amp; UX</Link>
              <Link to="/signup" className="btn-underline text-slate-500 hover:text-brand">Logistics &amp; Delivery Services</Link>
              <Link to="/signup" className="btn-underline text-slate-500 hover:text-brand">Enterprise CX &amp; Support</Link>
              <Link to="/signup" className="btn-underline text-slate-500 hover:text-brand">Banking &amp; Financial Wealth</Link>
              <Link to="/signup" className="btn-underline text-slate-500 hover:text-brand">Pan-India Remote Roles</Link>
            </div>

            {/* Column 3: The Direct Standard */}
            <div className="flex flex-col gap-2.5 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1">Why Startaply Direct</h4>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Strictly ₹0 Candidate Fees</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">100% Direct Salary Credited</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Verified Corporate Points of Contact</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">Free Interview Intelligence Hub</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">No Ghost Job Scrapers</span>
            </div>

            {/* Column 4: Platform & Trust */}
            <div className="flex flex-col gap-2.5 text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1">Platform &amp; Legal</h4>
              <Link to="/about" className="btn-underline text-slate-500 hover:text-brand">About Startaply</Link>
              <Link to="/privacy" className="btn-underline text-slate-500 hover:text-brand">Privacy Policy</Link>
              <Link to="/terms" className="btn-underline text-slate-500 hover:text-brand">Terms of Service</Link>
              <Link to="/#faq" className="btn-underline text-slate-500 hover:text-brand">Direct Guarantee &amp; FAQ</Link>
            </div>

          </div>

          {/* Bottom Utility Bar */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © {new Date().getFullYear()} Startaply Inc. All rights reserved. Strictly ₹0 candidate brokerage.
            </div>
            <div className="font-mono">
              Pan-India Direct Recruitment &amp; Verified Delivery Network
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
