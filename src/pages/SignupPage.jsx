import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Mail, Lock, Phone, MapPin, Linkedin, ArrowRight, ArrowLeft,
  Laptop, Building2, Truck, Layers, Check,
  Eye, EyeOff, Sliders, ShieldCheck, Sparkles, CheckCircle2,
  Briefcase, GraduationCap, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/common/BrandLogo';
import ThemeToggle from '../components/common/ThemeToggle';

const POPULAR_CITIES = ['Bengaluru', 'Hyderabad', 'Pune', 'Delhi-NCR', 'Mumbai', 'Chennai', 'Remote'];

const IT_FRESHER_ROLES = [
  'Full-Stack Web', 'Frontend React', 'Backend Node/Java', 'Cloud & DevOps', 'QA Automation', 'Data Analyst'
];
const IT_FRESHER_SKILLS = [
  'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'SQL', 'Git', 'AWS'
];

const IT_EXP_ROLES = [
  'Software Engineer', 'Senior Frontend Engineer', 'Backend Specialist', 'DevOps & Cloud Architect', 'Engineering Lead'
];
const IT_EXP_SKILLS = [
  'React', 'Node.js', 'TypeScript', 'Python', 'Go', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Microservices'
];

const NON_IT_FRESHER_ROLES = [
  'Inside Sales & BD', 'HR Talent Acquisition', 'Operations Executive', 'Digital Marketing Associate', 'Customer Support'
];
const NON_IT_FRESHER_SKILLS = [
  'Client Relations', 'CRM Systems', 'Advanced Excel', 'Communication', 'Lead Generation', 'Market Research'
];

const NON_IT_EXP_ROLES = [
  'Business Development Executive', 'Senior HR Specialist', 'Operations Manager', 'Account Executive', 'Product Marketing'
];
const NON_IT_EXP_SKILLS = [
  'B2B Sales', 'Key Account Management', 'Talent Acquisition', 'Supply Chain', 'Financial Modeling', 'Team Leadership'
];

const GIG_ROLES = [
  'Delivery Partner (Quick Commerce / Food)', 'Warehouse & Dark-Store Dispatch', 'Field Operations Specialist', 'Fleet Team Lead'
];
const GIG_ASSETS = [
  'Two-Wheeler / Bike', 'Valid Driving License', 'Android Smartphone', 'PAN Card & Bank Account'
];

const OTHER_SECTORS = [
  'Retail & Store Management', 'Customer Support & BPO', 'Hospitality & Events', 'Healthcare & Clinical Ops'
];

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1: Identity & Credentials, 2: Career Preferences & Track

  // ── Step 1 State ──
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [whatsappSync, setWhatsappSync] = useState(true);
  const [city, setCity] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [error, setError] = useState('');

  // Password Strictness Indicators
  const passwordCriteria = {
    minLen: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/.test(password)
  };
  const passedCriteriaCount = Object.values(passwordCriteria).filter(Boolean).length;
  const isPasswordValid = passedCriteriaCount === 5;

  // ── Step 2 State - Primary Track ──
  // 'it' | 'non-it' | 'gig' | 'others'
  const [mainCategory, setMainCategory] = useState('it');

  // Sub-selection for IT: 'fresher' | 'experienced'
  const [itLevel, setItLevel] = useState('fresher');

  // IT Fresher Preferences
  const [itDegree, setItDegree] = useState('B.Tech / B.E.');
  const [itBatch, setItBatch] = useState('2025');
  const [itTargetDomain, setItTargetDomain] = useState('Full-Stack Web');
  const [itSkills, setItSkills] = useState('React, JavaScript, SQL');
  const [itWorkMode, setItWorkMode] = useState('Hybrid');
  const [itCities, setItCities] = useState(['Bengaluru', 'Hyderabad']);

  // IT Experienced Preferences
  const [itExperience, setItExperience] = useState('1–3 Years');
  const [itCurrentRole, setItCurrentRole] = useState('Software Engineer');
  const [itStack, setItStack] = useState('React, Node.js, TypeScript');
  const [itNoticePeriod, setItNoticePeriod] = useState('Immediate (0–15 Days)');
  const [itExpWorkMode, setItExpWorkMode] = useState('Hybrid');
  const [itExpCities, setItExpCities] = useState(['Bengaluru']);

  // Sub-selection for Non-IT: 'fresher' | 'experienced'
  const [nonItLevel, setNonItLevel] = useState('fresher');

  // Non-IT Fresher Preferences
  const [nonItDegree, setNonItDegree] = useState('B.Com / BBA');
  const [nonItBatch, setNonItBatch] = useState('2025');
  const [nonItTargetDomain, setNonItTargetDomain] = useState('Inside Sales & BD');
  const [nonItSkills, setNonItSkills] = useState('CRM, Excel, Client Relations');
  const [nonItWorkMode, setNonItWorkMode] = useState('In-Office');
  const [nonItCities, setNonItCities] = useState(['Bengaluru', 'Mumbai']);

  // Non-IT Experienced Preferences
  const [nonItExperience, setNonItExperience] = useState('1–3 Years');
  const [nonItCurrentRole, setNonItCurrentRole] = useState('Business Development Executive');
  const [nonItSpecialization, setNonItSpecialization] = useState('Enterprise B2B Sales, Account Management');
  const [nonItNoticePeriod, setNonItNoticePeriod] = useState('Immediate (0–15 Days)');
  const [nonItExpWorkMode, setNonItExpWorkMode] = useState('In-Office');
  const [nonItExpCities, setNonItExpCities] = useState(['Bengaluru']);

  // Gig Preferences (NO fresher / experienced level)
  const [gigRole, setGigRole] = useState('Delivery Partner (Quick Commerce / Food)');
  const [assetsOwned, setAssetsOwned] = useState(['Two-Wheeler / Bike', 'Valid Driving License', 'Android Smartphone']);
  const [shiftPreference, setShiftPreference] = useState('Flexible / Peak Hours');
  const [joiningAvailability, setJoiningAvailability] = useState('Immediate (Today / 24h)');
  const [deliveryArea, setDeliveryArea] = useState('');

  // Others Preferences
  const [otherSector, setOtherSector] = useState('Retail & Store Management');
  const [otherExperience, setOtherExperience] = useState('Fresher / Trainee');
  const [otherSkills, setOtherSkills] = useState('Customer Handling, POS Systems, English Fluency');
  const [otherCities, setOtherCities] = useState(['Bengaluru', 'Hyderabad']);
  const [otherShift, setOtherShift] = useState('Day Shift (Retail / Corporate)');

  const [isLoading, setIsLoading] = useState(false);

  // Helper toggle functions
  const toggleCityItem = (citiesList, setCitiesList, cityName) => {
    if (citiesList.includes(cityName)) {
      if (citiesList.length > 1) {
        setCitiesList(citiesList.filter(c => c !== cityName));
      }
    } else {
      setCitiesList([...citiesList, cityName]);
    }
  };

  const toggleAssetItem = (item) => {
    if (assetsOwned.includes(item)) {
      if (assetsOwned.length > 1) {
        setAssetsOwned(assetsOwned.filter(a => a !== item));
      }
    } else {
      setAssetsOwned([...assetsOwned, item]);
    }
  };

  const toggleSkillItem = (skillsString, setSkillsString, skill) => {
    const arr = skillsString.split(',').map(s => s.trim()).filter(Boolean);
    if (arr.includes(skill)) {
      const next = arr.filter(s => s !== skill);
      setSkillsString(next.join(', '));
    } else {
      setSkillsString([...arr, skill].join(', '));
    }
  };

  // ── Step 1 Validation ──
  const handleStep1Submit = (e) => {
    e.preventDefault();
    setError('');

    if (fullName.trim().length < 3) {
      setError('Full legal name must be at least 3 characters.');
      return;
    }
    if (phone.replace(/\D/g, '').length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet strict security criteria (minimum 8 characters, uppercase, lowercase, number, and special character required).');
      return;
    }

    const trimmedLinkedin = linkedinUrl.trim();
    if (!trimmedLinkedin) {
      setError('LinkedIn profile URL is compulsory for verified candidate profiles.');
      return;
    }
    if (!/^(https?:\/\/)?([a-z0-9-]+\.)?linkedin\.com\/.+/i.test(trimmedLinkedin)) {
      setError('Please enter a valid LinkedIn URL (e.g. linkedin.com/in/yourname).');
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Step 2 Final Submit ──
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let preferencesData = {};
      let qual = '';
      let skillList = '';
      let subTrack = '';

      if (mainCategory === 'it') {
        subTrack = itLevel === 'fresher' ? 'IT Fresher / Entry Tech' : 'IT Experienced Corporate';
        if (itLevel === 'fresher') {
          preferencesData = {
            category: 'IT / Tech',
            level: 'fresher',
            degree: itDegree,
            graduationYear: itBatch,
            targetDomain: itTargetDomain,
            skills: itSkills,
            workMode: itWorkMode,
            targetCities: itCities
          };
          qual = `${itDegree} (${itBatch})`;
          skillList = itSkills;
        } else {
          preferencesData = {
            category: 'IT / Tech',
            level: 'experienced',
            experienceYears: itExperience,
            currentRole: itCurrentRole,
            coreStack: itStack,
            noticePeriod: itNoticePeriod,
            workMode: itExpWorkMode,
            targetCities: itExpCities
          };
          qual = `IT Lateral (${itExperience})`;
          skillList = itStack;
        }
      } else if (mainCategory === 'non-it') {
        subTrack = nonItLevel === 'fresher' ? 'Non-IT Fresher / Entry Business' : 'Non-IT Experienced Corporate';
        if (nonItLevel === 'fresher') {
          preferencesData = {
            category: 'Non-IT / Corporate',
            level: 'fresher',
            degree: nonItDegree,
            graduationYear: nonItBatch,
            targetDomain: nonItTargetDomain,
            skills: nonItSkills,
            workMode: nonItWorkMode,
            targetCities: nonItCities
          };
          qual = `${nonItDegree} (${nonItBatch})`;
          skillList = nonItSkills;
        } else {
          preferencesData = {
            category: 'Non-IT / Corporate',
            level: 'experienced',
            experienceYears: nonItExperience,
            currentRole: nonItCurrentRole,
            specialization: nonItSpecialization,
            noticePeriod: nonItNoticePeriod,
            workMode: nonItExpWorkMode,
            targetCities: nonItExpCities
          };
          qual = `Corporate Lateral (${nonItExperience})`;
          skillList = nonItSpecialization;
        }
      } else if (mainCategory === 'gig') {
        subTrack = 'Gig & Delivery Fleet';
        preferencesData = {
          category: 'Gig & Fleet',
          gigRole,
          assetsOwned,
          shiftPreference,
          joiningAvailability,
          deliveryArea
        };
        qual = 'Verified Fleet Operator';
        skillList = assetsOwned.join(', ');
      } else {
        subTrack = `Other Disciplines: ${otherSector}`;
        preferencesData = {
          category: 'Other Disciplines',
          sector: otherSector,
          experienceStage: otherExperience,
          skills: otherSkills,
          targetCities: otherCities,
          preferredShift: otherShift
        };
        qual = `${otherSector} (${otherExperience})`;
        skillList = otherSkills;
      }

      const payload = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.replace(/\D/g, ''),
        city: city.trim(),
        linkedinUrl: linkedinUrl.trim().startsWith('http') ? linkedinUrl.trim() : `https://${linkedinUrl.trim()}`,
        whatsappSync,
        careerTrack: mainCategory,
        subTrack,
        qualification: qual,
        skills: skillList,
        preferences: preferencesData
      };

      const res = await axios.post('/api/auth/signup', payload);

      if (res.data && res.data.token && res.data.user) {
        login(res.data.token, res.data.user);
        navigate('/');
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to create candidate account. Please try again.';
      setError(errMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">

      {/* ── TOP UTILITY STRIP ── */}
      <header className="w-full border-b border-slate-200/80 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (step === 2) setStep(1);
                else navigate('/');
              }}
              className="flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              aria-label="Go Back"
            >
              <ArrowLeft size={18} />
            </button>
            <Link to="/" className="flex items-center" aria-label="Startaply Home">
              <BrandLogo variant="horizontal" height={28} />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
              Already have an account?
            </span>
            <Link
              to="/login"
              className="min-h-[44px] inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-neutral-700 hover:border-brand dark:hover:border-brand-hover text-brand dark:text-brand-hover transition-colors"
            >
              Sign In
            </Link>
            <div className="pl-1">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN REGISTRATION EXPERIENCE ── */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT SHOWCASE PANEL (Desktop Only) ── */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-8 sticky top-24 pr-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-hover text-xs font-bold mb-4">
                <Sparkles size={14} />
                <span>Verified Direct Career Gateway</span>
              </div>

              <h2 className="text-3xl xl:text-4xl font-black text-slate-950 dark:text-white tracking-tight leading-tight mb-4">
                Claim your direct corporate passes & walk-in drives.
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal mb-8">
                Connect directly with enterprise HR teams across India. Zero consultancies, zero commission cuts, and 100% of your earned salary credited to your bank account.
              </p>

              {/* 4 Feature Highlights */}
              <div className="space-y-4">
                {[
                  {
                    title: '100% Free Forever for Job Seekers',
                    desc: 'Strictly ₹0 candidate deductions or hidden platform fees.'
                  },
                  {
                    title: 'Direct Corporate Points of Contact',
                    desc: 'Exact Google Maps coordinates, gate pass QR codes & venue HR.'
                  },
                  {
                    title: 'Tailored Calibration Feed',
                    desc: 'Jobs filtered precisely to your degree, skills, and target city.'
                  },
                  {
                    title: '60-Day Active Governance',
                    desc: 'No ghost job scrapers or stale listings. 100% live hiring requisitions.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/90 dark:border-neutral-800 shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      <Check size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-neutral-850 border border-slate-200 dark:border-neutral-800 text-xs">
              <p className="italic text-slate-700 dark:text-slate-300 mb-2">
                "Applied through the Startaply direct portal and attended the walk-in drive at Electronic City. Got selected as Systems Associate without any middleman charges."
              </p>
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-[10px]">
                  R
                </div>
                <span>Rahul S. • Placed at Infosys</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT ONBOARDING FORM CARD ── */}
          <div className="lg:col-span-7 w-full">
            <div className="bg-white dark:bg-neutral-900 border border-slate-200/90 dark:border-neutral-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/60 p-5 sm:p-8 md:p-10 transition-all text-left">

              {/* Stepper Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-black text-xs shadow-xs">
                      {step}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        {step === 1 ? 'Step 1: Account & Identity' : 'Step 2: Career Track & Preferences'}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {step === 1 ? 'Verify your identity and create credentials' : 'Configure role, skills & city matching'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-brand dark:text-brand-hover">
                    {step === 1 ? '50% COMPLETE' : '100% READY'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand transition-all duration-300 rounded-full"
                    style={{ width: step === 1 ? '50%' : '100%' }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 font-medium flex items-start gap-2.5">
                  <span className="font-bold shrink-0 mt-0.5">⚠️</span>
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* ══════════════════════════════════════════════════
                  STEP 1: IDENTITY & CREDENTIALS
              ══════════════════════════════════════════════════ */}
              {step === 1 && (
                <form onSubmit={handleStep1Submit} className="space-y-4 sm:space-y-5">

                  {/* Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Full Legal Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          autoComplete="name"
                          placeholder="e.g. Rahul Sharma"
                          className="w-full pl-10 pr-4 py-3 text-sm placeholder:text-xs sm:placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl bg-slate-50 dark:bg-neutral-850 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-medium min-h-[46px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                          inputMode="email"
                          placeholder="name@example.com"
                          className="w-full pl-10 pr-4 py-3 text-sm placeholder:text-xs sm:placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl bg-slate-50 dark:bg-neutral-850 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-medium min-h-[46px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password & Mobile Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Password (Strict) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
                          placeholder="Enter strong password"
                          className="w-full pl-10 pr-11 py-3 text-sm placeholder:text-xs sm:placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl bg-slate-50 dark:bg-neutral-850 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-medium min-h-[46px]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-h-[44px]"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* Dynamic Password Strength Bar & Checklist */}
                      <div className="mt-2 space-y-1.5">
                        <div className="w-full h-1 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden flex gap-1">
                          <div className={`h-full flex-1 transition-all rounded-full ${passedCriteriaCount >= 1 ? (passedCriteriaCount < 3 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-transparent'}`} />
                          <div className={`h-full flex-1 transition-all rounded-full ${passedCriteriaCount >= 3 ? (passedCriteriaCount < 5 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-transparent'}`} />
                          <div className={`h-full flex-1 transition-all rounded-full ${passedCriteriaCount >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                          <div className={`h-full flex-1 transition-all rounded-full ${passedCriteriaCount === 5 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                        </div>

                        <div className="flex flex-wrap gap-1.5 text-[10px]">
                          <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${passwordCriteria.minLen ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-neutral-800 dark:text-slate-400 dark:border-neutral-700'}`}>
                            {passwordCriteria.minLen && <Check size={10} />} 8+ Chars
                          </span>
                          <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${passwordCriteria.hasUpper ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-neutral-800 dark:text-slate-400 dark:border-neutral-700'}`}>
                            {passwordCriteria.hasUpper && <Check size={10} />} A-Z
                          </span>
                          <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${passwordCriteria.hasLower ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-neutral-800 dark:text-slate-400 dark:border-neutral-700'}`}>
                            {passwordCriteria.hasLower && <Check size={10} />} a-z
                          </span>
                          <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${passwordCriteria.hasNumber ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-neutral-800 dark:text-slate-400 dark:border-neutral-700'}`}>
                            {passwordCriteria.hasNumber && <Check size={10} />} 0-9
                          </span>
                          <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${passwordCriteria.hasSpecial ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-neutral-800 dark:text-slate-400 dark:border-neutral-700'}`}>
                            {passwordCriteria.hasSpecial && <Check size={10} />} !@#$
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex">
                        <div className="inline-flex items-center gap-1 px-3 py-3 rounded-l-xl bg-slate-100 dark:bg-neutral-800 border-y border-l border-slate-200 dark:border-neutral-700 text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0 select-none">
                          <Phone size={14} className="text-slate-400" />
                          <span>+91</span>
                        </div>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          autoComplete="tel"
                          inputMode="tel"
                          placeholder="9876543210"
                          className="w-full px-3.5 py-3 text-sm placeholder:text-xs sm:placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-r-xl bg-slate-50 dark:bg-neutral-850 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-medium min-h-[46px]"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                        Direct SMS entry passes & GPS venue coordinates are dispatched to this number.
                      </p>
                    </div>
                  </div>

                  {/* City & LinkedIn */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Current City <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Bengaluru, Hyderabad"
                          className="w-full pl-10 pr-4 py-3 text-sm placeholder:text-xs sm:placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl bg-slate-50 dark:bg-neutral-850 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-medium min-h-[46px]"
                        />
                      </div>

                      {/* Quick City Pills */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {POPULAR_CITIES.map(c => (
                          <button
                            type="button"
                            key={c}
                            onClick={() => setCity(c)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                              city === c
                                ? 'bg-brand text-white border-brand'
                                : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700 hover:border-slate-300'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          LinkedIn Profile <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-brand dark:text-brand-hover">Compulsory</span>
                      </div>
                      <div className="relative">
                        <Linkedin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          placeholder="linkedin.com/in/yourname"
                          className="w-full pl-10 pr-4 py-3 text-sm placeholder:text-xs sm:placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl bg-slate-50 dark:bg-neutral-850 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-medium min-h-[46px]"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                        Verified LinkedIn profile required to eliminate spam resumes and agency forwards.
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp Direct Invite Sync Card */}
                  <label className="p-3.5 bg-slate-50 dark:bg-neutral-850 rounded-2xl border border-slate-200/90 dark:border-neutral-700/80 flex items-center justify-between cursor-pointer select-none hover:border-brand/30 transition-colors">
                    <div className="pr-4">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Direct WhatsApp Invitation & QR Sync
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Receive instant interview walk-in passes, GPS coordinates, and screening notifications.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={whatsappSync}
                      onChange={(e) => setWhatsappSync(e.target.checked)}
                      className="w-5 h-5 text-brand rounded focus:ring-brand cursor-pointer shrink-0"
                    />
                  </label>

                  {/* Continue Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-brand hover:bg-brand-hover active:scale-[0.98] text-white text-sm font-bold shadow-md shadow-brand/25 transition-all cursor-pointer"
                    >
                      <span>Continue to Career Preferences</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>

                </form>
              )}

              {/* ══════════════════════════════════════════════════
                  STEP 2: CAREER TRACK & PREFERENCES
              ══════════════════════════════════════════════════ */}
              {step === 2 && (
                <form onSubmit={handleFinalSubmit} className="space-y-6">

                  {/* 1. Primary Track Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                      1. Select Opportunity Track <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'it', label: 'IT & Software', icon: Laptop, desc: 'Full-Stack, Cloud & AI' },
                        { id: 'non-it', label: 'Non-IT & Ops', icon: Building2, desc: 'Sales, HR & Finance' },
                        { id: 'gig', label: 'Gig & Fleet', icon: Truck, desc: 'Delivery & Operations' },
                        { id: 'others', label: 'Other Disciplines', icon: Layers, desc: 'Retail, BPO & Allied' }
                      ].map((t) => {
                        const Icon = t.icon;
                        const isSelected = mainCategory === t.id;
                        return (
                          <button
                            type="button"
                            key={t.id}
                            onClick={() => setMainCategory(t.id)}
                            className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all min-h-[88px] active:scale-95 cursor-pointer ${
                              isSelected
                                ? 'bg-brand text-white border-brand shadow-md shadow-brand/20 ring-2 ring-brand/30'
                                : 'bg-slate-50 dark:bg-neutral-850 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <Icon size={18} />
                              {isSelected && <Check size={14} className="stroke-[3]" />}
                            </div>
                            <div>
                              <div className="font-bold text-xs mt-1.5">{t.label}</div>
                              <div className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                                {t.desc}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Experience Level Segment (For IT & Non-IT) */}
                  {(mainCategory === 'it' || mainCategory === 'non-it') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        2. Career Experience Stage <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => mainCategory === 'it' ? setItLevel('fresher') : setNonItLevel('fresher')}
                          className={`min-h-[46px] p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            (mainCategory === 'it' ? itLevel === 'fresher' : nonItLevel === 'fresher')
                              ? 'bg-brand/10 border-brand text-brand dark:text-brand-hover font-bold shadow-xs'
                              : 'bg-slate-50 dark:bg-neutral-850 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <GraduationCap size={18} />
                            <div>
                              <div className="text-xs font-bold">Campus Graduate / Fresher</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">0 – 1 years experience</div>
                            </div>
                          </div>
                          {(mainCategory === 'it' ? itLevel === 'fresher' : nonItLevel === 'fresher') && (
                            <Check size={16} className="text-brand stroke-[3]" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => mainCategory === 'it' ? setItLevel('experienced') : setNonItLevel('experienced')}
                          className={`min-h-[46px] p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            (mainCategory === 'it' ? itLevel === 'experienced' : nonItLevel === 'experienced')
                              ? 'bg-brand/10 border-brand text-brand dark:text-brand-hover font-bold shadow-xs'
                              : 'bg-slate-50 dark:bg-neutral-850 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Briefcase size={18} />
                            <div>
                              <div className="text-xs font-bold">Experienced Professional</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">1+ years industry experience</div>
                            </div>
                          </div>
                          {(mainCategory === 'it' ? itLevel === 'experienced' : nonItLevel === 'experienced') && (
                            <Check size={16} className="text-brand stroke-[3]" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. Detailed Customization Form */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-neutral-850 border border-slate-200/90 dark:border-neutral-700 space-y-4">

                    {/* IT FRESHER */}
                    {mainCategory === 'it' && itLevel === 'fresher' && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Degree / Stream</label>
                            <select
                              value={itDegree}
                              onChange={(e) => setItDegree(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium min-h-[42px]"
                            >
                              <option value="B.Tech / B.E.">B.Tech / B.E. (Computer / IT / Circuit)</option>
                              <option value="BCA / MCA">BCA / MCA</option>
                              <option value="B.Sc / M.Sc Computer Science">B.Sc / M.Sc Computer Science</option>
                              <option value="Diploma in Engineering">Diploma in Engineering / Tech</option>
                              <option value="Other Technical Degree">Other Technical Degree</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Batch / Passing Year</label>
                            <select
                              value={itBatch}
                              onChange={(e) => setItBatch(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium min-h-[42px]"
                            >
                              <option value="2026">2026 (Upcoming Graduate)</option>
                              <option value="2025">2025 (Final Year / Recent)</option>
                              <option value="2024">2024 (Graduate)</option>
                              <option value="2023">2023 (Immediate Joining)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Target Role</label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {IT_FRESHER_ROLES.map(r => (
                              <button
                                type="button"
                                key={r}
                                onClick={() => setItTargetDomain(r)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                  itTargetDomain === r
                                    ? 'bg-brand text-white border-brand'
                                    : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700'
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={itTargetDomain}
                            onChange={(e) => setItTargetDomain(e.target.value)}
                            placeholder="e.g. Full-Stack Web"
                            className="w-full px-3 py-2 text-xs placeholder:text-xs placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Core Technical Skills</label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {IT_FRESHER_SKILLS.map(s => (
                              <button
                                type="button"
                                key={s}
                                onClick={() => toggleSkillItem(itSkills, setItSkills, s)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                  itSkills.includes(s)
                                    ? 'bg-brand text-white border-brand'
                                    : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={itSkills}
                            onChange={(e) => setItSkills(e.target.value)}
                            placeholder="e.g. React, JavaScript, SQL"
                            className="w-full px-3 py-2 text-xs placeholder:text-xs placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Work Mode Preference</label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {['Hybrid', 'Remote', 'In-Office'].map(m => (
                                <button
                                  type="button"
                                  key={m}
                                  onClick={() => setItWorkMode(m)}
                                  className={`py-2 text-[11px] font-bold rounded-xl border transition-all ${
                                    itWorkMode === m
                                      ? 'bg-brand text-white border-brand'
                                      : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700'
                                  }`}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Target Cities</label>
                            <div className="flex flex-wrap gap-1.5">
                              {POPULAR_CITIES.map(c => (
                                <button
                                  type="button"
                                  key={c}
                                  onClick={() => toggleCityItem(itCities, setItCities, c)}
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                    itCities.includes(c)
                                      ? 'bg-brand text-white border-brand'
                                      : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700'
                                  }`}
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* IT EXPERIENCED */}
                    {mainCategory === 'it' && itLevel === 'experienced' && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Experience Level</label>
                            <select
                              value={itExperience}
                              onChange={(e) => setItExperience(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium min-h-[42px]"
                            >
                              <option value="1–3 Years">1–3 Years</option>
                              <option value="3–5 Years">3–5 Years</option>
                              <option value="5–8 Years">5–8 Years</option>
                              <option value="8+ Years">8+ Years Senior Specialist</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Notice Period</label>
                            <select
                              value={itNoticePeriod}
                              onChange={(e) => setItNoticePeriod(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium min-h-[42px]"
                            >
                              <option value="Immediate (0–15 Days)">Immediate (0–15 Days)</option>
                              <option value="30 Days">30 Days</option>
                              <option value="60 Days">60 Days</option>
                              <option value="Serving Notice Period">Serving Notice Period</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Current / Target Role</label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {IT_EXP_ROLES.map(r => (
                              <button
                                type="button"
                                key={r}
                                onClick={() => setItCurrentRole(r)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                  itCurrentRole === r
                                    ? 'bg-brand text-white border-brand'
                                    : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700'
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={itCurrentRole}
                            onChange={(e) => setItCurrentRole(e.target.value)}
                            placeholder="e.g. Software Engineer"
                            className="w-full px-3 py-2 text-xs placeholder:text-xs placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Core Tech Stack</label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {IT_EXP_SKILLS.map(s => (
                              <button
                                type="button"
                                key={s}
                                onClick={() => toggleSkillItem(itStack, setItStack, s)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                  itStack.includes(s)
                                    ? 'bg-brand text-white border-brand'
                                    : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={itStack}
                            onChange={(e) => setItStack(e.target.value)}
                            placeholder="e.g. React, Node.js, TypeScript"
                            className="w-full px-3 py-2 text-xs placeholder:text-xs placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Work Mode</label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {['Hybrid', 'Remote', 'In-Office'].map(m => (
                                <button
                                  type="button"
                                  key={m}
                                  onClick={() => setItExpWorkMode(m)}
                                  className={`py-2 text-[11px] font-bold rounded-xl border transition-all ${
                                    itExpWorkMode === m
                                      ? 'bg-brand text-white border-brand'
                                      : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700'
                                  }`}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Target Cities</label>
                            <div className="flex flex-wrap gap-1.5">
                              {POPULAR_CITIES.map(c => (
                                <button
                                  type="button"
                                  key={c}
                                  onClick={() => toggleCityItem(itExpCities, setItExpCities, c)}
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                    itExpCities.includes(c)
                                      ? 'bg-brand text-white border-brand'
                                      : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700'
                                  }`}
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* NON-IT FRESHER */}
                    {mainCategory === 'non-it' && nonItLevel === 'fresher' && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Degree / Course</label>
                            <select
                              value={nonItDegree}
                              onChange={(e) => setNonItDegree(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium min-h-[42px]"
                            >
                              <option value="B.Com / BBA">B.Com / BBA</option>
                              <option value="MBA / PGDM">MBA / PGDM</option>
                              <option value="BA / B.Sc (Economics / Stats)">BA / B.Sc (Economics / Stats)</option>
                              <option value="Other Graduate">Other Graduate</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Batch / Passing Year</label>
                            <select
                              value={nonItBatch}
                              onChange={(e) => setNonItBatch(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium min-h-[42px]"
                            >
                              <option value="2026">2026</option>
                              <option value="2025">2025</option>
                              <option value="2024">2024</option>
                              <option value="2023">2023</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Target Business Role</label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {NON_IT_FRESHER_ROLES.map(r => (
                              <button
                                type="button"
                                key={r}
                                onClick={() => setNonItTargetDomain(r)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                  nonItTargetDomain === r
                                    ? 'bg-brand text-white border-brand'
                                    : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700'
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={nonItTargetDomain}
                            onChange={(e) => setNonItTargetDomain(e.target.value)}
                            placeholder="e.g. Inside Sales & BD"
                            className="w-full px-3 py-2 text-xs placeholder:text-xs placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Key Competencies</label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {NON_IT_FRESHER_SKILLS.map(s => (
                              <button
                                type="button"
                                key={s}
                                onClick={() => toggleSkillItem(nonItSkills, setNonItSkills, s)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                  nonItSkills.includes(s)
                                    ? 'bg-brand text-white border-brand'
                                    : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={nonItSkills}
                            onChange={(e) => setNonItSkills(e.target.value)}
                            placeholder="e.g. CRM, Excel, Client Relations"
                            className="w-full px-3 py-2 text-xs placeholder:text-xs placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand"
                          />
                        </div>
                      </>
                    )}

                    {/* NON-IT EXPERIENCED */}
                    {mainCategory === 'non-it' && nonItLevel === 'experienced' && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Experience</label>
                            <select
                              value={nonItExperience}
                              onChange={(e) => setNonItExperience(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium min-h-[42px]"
                            >
                              <option value="1–3 Years">1–3 Years</option>
                              <option value="3–6 Years">3–6 Years</option>
                              <option value="6+ Years">6+ Years</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Notice Period</label>
                            <select
                              value={nonItNoticePeriod}
                              onChange={(e) => setNonItNoticePeriod(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium min-h-[42px]"
                            >
                              <option value="Immediate (0–15 Days)">Immediate (0–15 Days)</option>
                              <option value="30 Days">30 Days</option>
                              <option value="60 Days">60 Days</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Role Specialization</label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {NON_IT_EXP_ROLES.map(r => (
                              <button
                                type="button"
                                key={r}
                                onClick={() => setNonItCurrentRole(r)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                  nonItCurrentRole === r
                                    ? 'bg-brand text-white border-brand'
                                    : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700'
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={nonItSpecialization}
                            onChange={(e) => setNonItSpecialization(e.target.value)}
                            placeholder="e.g. Enterprise B2B Sales, Account Management"
                            className="w-full px-3 py-2 text-xs placeholder:text-xs placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand"
                          />
                        </div>
                      </>
                    )}

                    {/* GIG & FLEET */}
                    {mainCategory === 'gig' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Primary Role</label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {GIG_ROLES.map(r => (
                              <button
                                type="button"
                                key={r}
                                onClick={() => setGigRole(r)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                  gigRole === r
                                    ? 'bg-brand text-white border-brand'
                                    : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700'
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Assets Owned (Multi-select)</label>
                          <div className="flex flex-wrap gap-1.5">
                            {GIG_ASSETS.map(a => (
                              <button
                                type="button"
                                key={a}
                                onClick={() => toggleAssetItem(a)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                  assetsOwned.includes(a)
                                    ? 'bg-brand text-white border-brand'
                                    : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700'
                                }`}
                              >
                                {a}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Shift Preference</label>
                            <select
                              value={shiftPreference}
                              onChange={(e) => setShiftPreference(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium min-h-[42px]"
                            >
                              <option value="Flexible / Peak Hours">Flexible / Peak Hours</option>
                              <option value="Day Shift (Morning to Eve)">Day Shift</option>
                              <option value="Night Shift (Late Delivery)">Night Shift</option>
                              <option value="Weekend Only">Weekend Only</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Availability to Join</label>
                            <select
                              value={joiningAvailability}
                              onChange={(e) => setJoiningAvailability(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium min-h-[42px]"
                            >
                              <option value="Immediate (Today / 24h)">Immediate (Today / 24h)</option>
                              <option value="Within 2-3 Days">Within 2–3 Days</option>
                              <option value="Next Week">Next Week</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {/* OTHER DISCIPLINES */}
                    {mainCategory === 'others' && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Sector</label>
                            <select
                              value={otherSector}
                              onChange={(e) => setOtherSector(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium min-h-[42px]"
                            >
                              {OTHER_SECTORS.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Experience Level</label>
                            <select
                              value={otherExperience}
                              onChange={(e) => setOtherExperience(e.target.value)}
                              className="w-full px-3 py-2.5 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium min-h-[42px]"
                            >
                              <option value="Fresher / Trainee">Fresher / Trainee</option>
                              <option value="1–3 Years">1–3 Years</option>
                              <option value="3+ Years">3+ Years</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Skills & Qualifications</label>
                          <input
                            type="text"
                            value={otherSkills}
                            onChange={(e) => setOtherSkills(e.target.value)}
                            placeholder="e.g. Customer Care, POS Billing, Fluent English"
                            className="w-full px-3 py-2 text-xs placeholder:text-xs placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white outline-none focus:border-brand"
                          />
                        </div>
                      </>
                    )}

                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                      <span>Back to Step 1</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:flex-1 min-h-[48px] px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover active:scale-[0.98] text-white text-sm font-bold shadow-md shadow-brand/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Complete Profile & Enter Platform</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full py-5 border-t border-slate-200/80 dark:border-neutral-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Startaply Inc. Strictly ₹0 candidate brokerage.</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="hover:underline">Terms of Service</Link>
            <Link to="/about" className="hover:underline">About</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default SignupPage;
