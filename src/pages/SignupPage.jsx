import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Mail, Lock, Phone, MapPin, Linkedin, ArrowRight, ArrowLeft,
  Laptop, Building2, Truck, Layers, Check,
  Eye, EyeOff, Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/common/BrandLogo';
import ThemeToggle from '../components/common/ThemeToggle';

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
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)
  };
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

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
  const [gigRole, setGigRole] = useState('Delivery Partner (Food / Quick Commerce)');
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
  const toggleArrayItem = (setter, currentArr, item) => {
    setter(currentArr.includes(item)
      ? (currentArr.length > 1 ? currentArr.filter(i => i !== item) : currentArr)
      : [...currentArr, item]
    );
  };

  const addSkillTag = (getter, setter, skill) => {
    const skillsArr = getter ? getter.split(',').map(s => s.trim()) : [];
    if (!skillsArr.includes(skill)) {
      setter(skillsArr.length && getter ? `${getter}, ${skill}` : skill);
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

    // Strict Password Validation
    if (!isPasswordValid) {
      setError('Password does not meet strict security criteria (minimum 8 characters, uppercase, lowercase, number, and special character required).');
      return;
    }

    // Compulsory LinkedIn Profile Validation
    const trimmedLinkedin = linkedinUrl.trim();
    if (!trimmedLinkedin) {
      setError('LinkedIn profile URL is compulsory for verified candidate profiles.');
      return;
    }
    if (!/^(https?:\/\/)?([a-z0-9-]+\.)?linkedin\.com\/.+/i.test(trimmedLinkedin)) {
      setError('Please enter a valid LinkedIn URL (e.g. https://www.linkedin.com/in/yourname).');
      return;
    }

    setStep(2);
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
        linkedinUrl: linkedinUrl.trim(),
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6FB] dark:bg-[#070B14] text-[#0A0F1D] dark:text-[#F8FAFC] flex flex-col justify-between selection:bg-brand selection:text-white transition-colors duration-200 relative overflow-hidden">

      {/* ── AMBIENT BACKGROUND GLOW ── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-brand/10 via-indigo-500/10 to-emerald-400/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* ── TOP UTILITY STRIP ── */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-2 group" aria-label="Startaply Home">
          <BrandLogo variant="horizontal" height={28} />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div className="p-1">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── CENTERED REGISTRATION CARD ── */}
      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 my-auto relative z-10 text-left">
        <div className="rounded-[2rem] bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/60 p-7 sm:p-10 transition-all">

          {/* Header & Animated Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand/10 dark:bg-brand/20 text-brand flex items-center justify-center font-bold text-xs">
                  {step === 1 ? '1' : '2'}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {step === 1 ? 'Step 1 of 2: Identity & Verified Credentials' : 'Step 2 of 2: Career Preferences & Domain Track'}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-400">
                {step === 1 ? '50% COMPLETE' : '100% READY'}
              </span>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-brand transition-all duration-300 rounded-full"
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              {step === 1 ? 'Create Your Candidate Profile' : 'Configure Your Career Preferences'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {step === 1
                ? 'Join thousands securing direct walk-in passes & enterprise interviews'
                : 'Select your sector (IT, Non-IT, Gig, Others) and configure your targeted preferences'}
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs p-3.5 rounded-xl border border-red-200 dark:border-red-900/50 font-medium">
              {error}
            </div>
          )}

          {/* ── STEP 1: IDENTITY & CONTACT ── */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">

              {/* Full Name & Email (2 columns on sm) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rahul.sharma@gmail.com"
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Password with Strict Criteria & Mobile Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Password (Strict Policy) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full pl-10 pr-10 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Strict Password Checklist */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                    <div className={`flex items-center gap-1 ${passwordCriteria.minLen ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <Check size={11} className={passwordCriteria.minLen ? 'opacity-100' : 'opacity-30'} /> 8+ Chars
                    </div>
                    <div className={`flex items-center gap-1 ${passwordCriteria.hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <Check size={11} className={passwordCriteria.hasUpper ? 'opacity-100' : 'opacity-30'} /> Upper (A-Z)
                    </div>
                    <div className={`flex items-center gap-1 ${passwordCriteria.hasLower ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <Check size={11} className={passwordCriteria.hasLower ? 'opacity-100' : 'opacity-30'} /> Lower (a-z)
                    </div>
                    <div className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <Check size={11} className={passwordCriteria.hasNumber ? 'opacity-100' : 'opacity-30'} /> Number (0-9)
                    </div>
                    <div className={`flex items-center gap-1 col-span-2 sm:col-span-1 ${passwordCriteria.hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <Check size={11} className={passwordCriteria.hasSpecial ? 'opacity-100' : 'opacity-30'} /> Special (!@#$)
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Mobile Number (10 Digits) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Used for direct SMS entry passes and interview venue coordinates.
                  </p>
                </div>
              </div>

              {/* City & Compulsory LinkedIn URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Current City *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Hyderabad / Bengaluru"
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    LinkedIn Profile URL * (Compulsory)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Linkedin size={16} />
                    </div>
                    <input
                      type="url"
                      required
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://www.linkedin.com/in/username"
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Direct Invite Sync Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="pr-4">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Direct WhatsApp Invitation Sync
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Receive drive pass QR codes and venue Google Map pins directly on WhatsApp
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappSync}
                  onChange={(e) => setWhatsappSync(e.target.checked)}
                  className="w-4 h-4 text-brand rounded focus:ring-brand cursor-pointer"
                />
              </div>

              {/* Next Step Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-graphic-hover w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-bold shadow-md shadow-brand/20 active:scale-[0.98] transition-all cursor-pointer min-h-[46px]"
                >
                  <span>Continue to Career Track &amp; Preferences</span>
                  <ArrowRight size={16} className="btn-icon" />
                </button>
              </div>

            </form>
          )}

          {/* ── STEP 2: CAREER TRACK & PREFERENCES ── */}
          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">

              {/* 1. Main Opportunity Track Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                  1. Select Primary Domain Track
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                  {/* Option 1: IT */}
                  <button
                    type="button"
                    onClick={() => setMainCategory('it')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      mainCategory === 'it'
                        ? 'bg-brand/10 border-brand text-brand dark:text-blue-400 shadow-xs ring-2 ring-brand/30'
                        : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <Laptop size={20} className="mb-2 text-brand" />
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">IT / Software</div>
                    <div className="text-[11px] opacity-80 mt-0.5 leading-snug">Full-Stack, QA, Cloud &amp; AI</div>
                  </button>

                  {/* Option 2: Non-IT */}
                  <button
                    type="button"
                    onClick={() => setMainCategory('non-it')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      mainCategory === 'non-it'
                        ? 'bg-brand/10 border-brand text-brand dark:text-blue-400 shadow-xs ring-2 ring-brand/30'
                        : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <Building2 size={20} className="mb-2 text-indigo-500" />
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Non-IT Corporate</div>
                    <div className="text-[11px] opacity-80 mt-0.5 leading-snug">Sales, HR, Marketing &amp; Ops</div>
                  </button>

                  {/* Option 3: Gig (No fresher/exp) */}
                  <button
                    type="button"
                    onClick={() => setMainCategory('gig')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      mainCategory === 'gig'
                        ? 'bg-brand/10 border-brand text-brand dark:text-blue-400 shadow-xs ring-2 ring-brand/30'
                        : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <Truck size={20} className="mb-2 text-emerald-500" />
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Gig &amp; Fleet</div>
                    <div className="text-[11px] opacity-80 mt-0.5 leading-snug">Delivery, warehouse &amp; dispatch</div>
                  </button>

                  {/* Option 4: Others */}
                  <button
                    type="button"
                    onClick={() => setMainCategory('others')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      mainCategory === 'others'
                        ? 'bg-brand/10 border-brand text-brand dark:text-blue-400 shadow-xs ring-2 ring-brand/30'
                        : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <Layers size={20} className="mb-2 text-amber-500" />
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Other Disciplines</div>
                    <div className="text-[11px] opacity-80 mt-0.5 leading-snug">Retail, BPO, Media &amp; Allied</div>
                  </button>

                </div>
              </div>

              {/* 2. Sub-Level Experience Stage (For IT & Non-IT only; Gig has none) */}
              {(mainCategory === 'it' || mainCategory === 'non-it') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    2. Select Career Experience Stage *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => mainCategory === 'it' ? setItLevel('fresher') : setNonItLevel('fresher')}
                      className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
                        (mainCategory === 'it' ? itLevel === 'fresher' : nonItLevel === 'fresher')
                          ? 'bg-brand text-white border-brand shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      🎓 Fresher / Campus Graduate (0–1 Yrs)
                    </button>
                    <button
                      type="button"
                      onClick={() => mainCategory === 'it' ? setItLevel('experienced') : setNonItLevel('experienced')}
                      className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
                        (mainCategory === 'it' ? itLevel === 'experienced' : nonItLevel === 'experienced')
                          ? 'bg-brand text-white border-brand shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      💼 Experienced Professional (1+ Yrs)
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Detailed Preferences Container */}
              <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Sliders size={14} className="text-brand" />
                    {mainCategory === 'it'
                      ? (itLevel === 'fresher' ? 'IT Graduate & Entry Tech Preferences' : 'IT Lateral Engineering Preferences')
                      : mainCategory === 'non-it'
                      ? (nonItLevel === 'fresher' ? 'Non-IT Campus & Business Preferences' : 'Non-IT Lateral Corporate Preferences')
                      : mainCategory === 'gig'
                      ? 'Gig & Field Operational Readiness'
                      : 'Specialized Discipline Criteria'}
                  </span>
                  <span className="text-[11px] font-semibold text-brand dark:text-blue-400">
                    Tailored Opportunity Feed
                  </span>
                </div>

                {/* ── IT / TECH PREFERENCES ── */}
                {mainCategory === 'it' && (
                  <>
                    {/* IT Fresher */}
                    {itLevel === 'fresher' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Degree / Technical Course *
                            </label>
                            <select
                              value={itDegree}
                              onChange={(e) => setItDegree(e.target.value)}
                              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium cursor-pointer"
                            >
                              <option value="B.Tech / B.E. (CS / IT / ECE)">B.Tech / B.E. (CS / IT / ECE)</option>
                              <option value="BCA / MCA">BCA / MCA</option>
                              <option value="B.Sc / M.Sc (Computer Science / Data)">B.Sc / M.Sc (CS / Data)</option>
                              <option value="Diploma in Engineering">Diploma in Computer / Tech</option>
                              <option value="Other Bachelor's Degree">Other Graduate with Tech Training</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Graduation Year / Batch *
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                              {['2024', '2025', '2026', '2027'].map((yr) => (
                                <button
                                  key={yr}
                                  type="button"
                                  onClick={() => setItBatch(yr)}
                                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    itBatch === yr
                                      ? 'bg-brand text-white shadow-xs'
                                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {yr}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                            Target IT Domain *
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {['Full-Stack Web', 'Frontend Engineering', 'Backend & APIs', 'AI & Data Science', 'QA / Automation', 'Cloud & DevOps'].map((domain) => (
                              <button
                                key={domain}
                                type="button"
                                onClick={() => setItTargetDomain(domain)}
                                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                  itTargetDomain === domain
                                    ? 'bg-brand text-white shadow-xs'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {domain}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                            Technical Skills *
                          </label>
                          <input
                            type="text"
                            required
                            value={itSkills}
                            onChange={(e) => setItSkills(e.target.value)}
                            placeholder="e.g. React, JavaScript, SQL, Python"
                            className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium"
                          />
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="text-[11px] text-slate-400 font-medium">Quick Add:</span>
                            {['React', 'Python', 'Java', 'SQL', 'Node.js', 'C++', 'TypeScript', 'Docker'].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => addSkillTag(itSkills, setItSkills, s)}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700/60 hover:bg-brand/10 hover:text-brand text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                              >
                                + {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Preferred Work Mode
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {['In-Office', 'Hybrid', 'Remote'].map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setItWorkMode(m)}
                                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    itWorkMode === m
                                      ? 'bg-brand text-white shadow-xs'
                                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Target Tech Hubs
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {['Bengaluru', 'Hyderabad', 'Pune', 'Delhi NCR', 'Chennai', 'Mumbai'].map((cityName) => {
                                const isSel = itCities.includes(cityName);
                                return (
                                  <button
                                    key={cityName}
                                    type="button"
                                    onClick={() => toggleArrayItem(setItCities, itCities, cityName)}
                                    className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                      isSel
                                        ? 'bg-brand/15 text-brand dark:text-blue-400 border border-brand/30'
                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    {isSel && <Check size={12} />}
                                    {cityName}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* IT Experienced */}
                    {itLevel === 'experienced' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Total IT Experience *
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {['1–3 Years', '3–5 Years', '5–8 Years', '8+ Years'].map((exp) => (
                                <button
                                  key={exp}
                                  type="button"
                                  onClick={() => setItExperience(exp)}
                                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    itExperience === exp
                                      ? 'bg-brand text-white shadow-xs'
                                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {exp}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Current / Recent Tech Role *
                            </label>
                            <input
                              type="text"
                              required
                              value={itCurrentRole}
                              onChange={(e) => setItCurrentRole(e.target.value)}
                              placeholder="e.g. Senior Frontend Engineer"
                              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                            Core Tech Stack &amp; Architecture *
                          </label>
                          <input
                            type="text"
                            required
                            value={itStack}
                            onChange={(e) => setItStack(e.target.value)}
                            placeholder="e.g. React, Node.js, AWS, Kubernetes, PostgreSQL"
                            className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium"
                          />
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="text-[11px] text-slate-400 font-medium">Quick Add:</span>
                            {['React', 'Node.js', 'AWS', 'Spring Boot', 'Python / Go', 'Microservices', 'Kubernetes'].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => addSkillTag(itStack, setItStack, s)}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700/60 hover:bg-brand/10 hover:text-brand text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                              >
                                + {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                            Official Notice Period *
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {['Immediate (0–15 Days)', '30 Days', '60 Days', '90 Days'].map((np) => (
                              <button
                                key={np}
                                type="button"
                                onClick={() => setItNoticePeriod(np)}
                                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                                  itNoticePeriod === np
                                    ? 'bg-brand text-white shadow-xs'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {np}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Work Setup
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {['Hybrid', 'Remote Preferred', 'In-Office'].map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setItExpWorkMode(m)}
                                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    itExpWorkMode === m
                                      ? 'bg-brand text-white shadow-xs'
                                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Target Metros
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {['Bengaluru', 'Hyderabad', 'Pune', 'Delhi NCR', 'Mumbai', 'Chennai'].map((cityName) => {
                                const isSel = itExpCities.includes(cityName);
                                return (
                                  <button
                                    key={cityName}
                                    type="button"
                                    onClick={() => toggleArrayItem(setItExpCities, itExpCities, cityName)}
                                    className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                      isSel
                                        ? 'bg-brand/15 text-brand dark:text-blue-400 border border-brand/30'
                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    {isSel && <Check size={12} />}
                                    {cityName}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
                  </>
                )}

                {/* ── NON-IT / CORPORATE PREFERENCES ── */}
                {mainCategory === 'non-it' && (
                  <>
                    {/* Non-IT Fresher */}
                    {nonItLevel === 'fresher' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Degree / Educational Stream *
                            </label>
                            <select
                              value={nonItDegree}
                              onChange={(e) => setNonItDegree(e.target.value)}
                              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium cursor-pointer"
                            >
                              <option value="B.Com / BBA">B.Com / BBA (Commerce &amp; Management)</option>
                              <option value="MBA / PGDM">MBA / PGDM (Sales, HR, Finance, Ops)</option>
                              <option value="BA / Humanities">BA / Humanities / Journalism</option>
                              <option value="B.Sc General">B.Sc General / Mathematics / Science</option>
                              <option value="Any Bachelor's Degree">Any Other Bachelor's / Diploma</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Graduation Year / Batch *
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                              {['2024', '2025', '2026', '2027'].map((yr) => (
                                <button
                                  key={yr}
                                  type="button"
                                  onClick={() => setNonItBatch(yr)}
                                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    nonItBatch === yr
                                      ? 'bg-brand text-white shadow-xs'
                                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {yr}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                            Target Corporate Domain *
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              'Inside Sales & BD',
                              'HR & Talent Acquisition',
                              'Digital Marketing & Growth',
                              'Finance & Corporate Accounts',
                              'Operations & Customer Success',
                              'Content & Creative'
                            ].map((domain) => (
                              <button
                                key={domain}
                                type="button"
                                onClick={() => setNonItTargetDomain(domain)}
                                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                  nonItTargetDomain === domain
                                    ? 'bg-brand text-white shadow-xs'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {domain}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                            Key Business Skills *
                          </label>
                          <input
                            type="text"
                            required
                            value={nonItSkills}
                            onChange={(e) => setNonItSkills(e.target.value)}
                            placeholder="e.g. Salesforce CRM, Excel, Cold Outreach, Client Servicing"
                            className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium"
                          />
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="text-[11px] text-slate-400 font-medium">Quick Add:</span>
                            {['Salesforce', 'Advanced Excel', 'Cold Calling', 'Financial Modeling', 'SEO & Ads', 'Talent Sourcing'].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => addSkillTag(nonItSkills, setNonItSkills, s)}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700/60 hover:bg-brand/10 hover:text-brand text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                              >
                                + {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Preferred Work Mode
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {['In-Office', 'Hybrid', 'Remote'].map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setNonItWorkMode(m)}
                                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    nonItWorkMode === m
                                      ? 'bg-brand text-white shadow-xs'
                                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Target Hiring Cities
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai'].map((cityName) => {
                                const isSel = nonItCities.includes(cityName);
                                return (
                                  <button
                                    key={cityName}
                                    type="button"
                                    onClick={() => toggleArrayItem(setNonItCities, nonItCities, cityName)}
                                    className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                      isSel
                                        ? 'bg-brand/15 text-brand dark:text-blue-400 border border-brand/30'
                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    {isSel && <Check size={12} />}
                                    {cityName}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Non-IT Experienced */}
                    {nonItLevel === 'experienced' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Total Experience *
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {['1–3 Years', '3–5 Years', '5–8 Years', '8+ Years'].map((exp) => (
                                <button
                                  key={exp}
                                  type="button"
                                  onClick={() => setNonItExperience(exp)}
                                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    nonItExperience === exp
                                      ? 'bg-brand text-white shadow-xs'
                                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {exp}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Current / Recent Designation *
                            </label>
                            <input
                              type="text"
                              required
                              value={nonItCurrentRole}
                              onChange={(e) => setNonItCurrentRole(e.target.value)}
                              placeholder="e.g. Business Development Manager / HR Partner"
                              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                            Functional Specialization &amp; Scope *
                          </label>
                          <input
                            type="text"
                            required
                            value={nonItSpecialization}
                            onChange={(e) => setNonItSpecialization(e.target.value)}
                            placeholder="e.g. Enterprise B2B Sales, Account Management, Payroll, Performance Marketing"
                            className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium"
                          />
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="text-[11px] text-slate-400 font-medium">Quick Add:</span>
                            {['Enterprise B2B', 'Talent Acquisition', 'Performance Marketing', 'Corporate Accounts', 'Supply Chain Ops'].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => addSkillTag(nonItSpecialization, setNonItSpecialization, s)}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700/60 hover:bg-brand/10 hover:text-brand text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                              >
                                + {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                            Official Notice Period *
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {['Immediate (0–15 Days)', '30 Days', '60 Days', '90 Days'].map((np) => (
                              <button
                                key={np}
                                type="button"
                                onClick={() => setNonItNoticePeriod(np)}
                                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                                  nonItNoticePeriod === np
                                    ? 'bg-brand text-white shadow-xs'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {np}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Work Setup
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {['In-Office', 'Hybrid', 'Remote'].map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => setNonItExpWorkMode(m)}
                                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    nonItExpWorkMode === m
                                      ? 'bg-brand text-white shadow-xs'
                                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Target Corporate Hubs
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai'].map((cityName) => {
                                const isSel = nonItExpCities.includes(cityName);
                                return (
                                  <button
                                    key={cityName}
                                    type="button"
                                    onClick={() => toggleArrayItem(setNonItExpCities, nonItExpCities, cityName)}
                                    className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                      isSel
                                        ? 'bg-brand/15 text-brand dark:text-blue-400 border border-brand/30'
                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                                  >
                                    {isSel && <Check size={12} />}
                                    {cityName}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
                  </>
                )}

                {/* ── GIG & DELIVERY FLEET (NO FRESHER / EXPERIENCED SPLIT) ── */}
                {mainCategory === 'gig' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Preferred Operational Role *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          'Delivery Partner (Food / Quick Commerce)',
                          'Warehouse / Dark Store Associate',
                          'E-Commerce Courier & Logistics',
                          'Field Onboarding Specialist'
                        ].map((roleChoice) => (
                          <button
                            key={roleChoice}
                            type="button"
                            onClick={() => setGigRole(roleChoice)}
                            className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                              gigRole === roleChoice
                                ? 'bg-brand text-white shadow-xs'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            {roleChoice}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Assets &amp; Readiness Owned (Select All that Apply) *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          'Two-Wheeler / Bike',
                          'Valid Driving License',
                          'Android Smartphone',
                          'PAN & Bank Account'
                        ].map((asset) => {
                          const hasAsset = assetsOwned.includes(asset);
                          return (
                            <button
                              key={asset}
                              type="button"
                              onClick={() => toggleArrayItem(setAssetsOwned, assetsOwned, asset)}
                              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                                hasAsset
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center ${hasAsset ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-600'}`}>
                                {hasAsset && <Check size={12} strokeWidth={3} />}
                              </div>
                              <span>{asset}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          Shift &amp; Working Hours
                        </label>
                        <select
                          value={shiftPreference}
                          onChange={(e) => setShiftPreference(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium cursor-pointer"
                        >
                          <option value="Flexible / Peak Hours">Flexible / Peak Hours</option>
                          <option value="Morning Shift (6 AM - 2 PM)">Morning Shift (6 AM - 2 PM)</option>
                          <option value="Evening Peak (2 PM - 10 PM)">Evening Peak (2 PM - 10 PM)</option>
                          <option value="Full Day (10 Hours)">Full Day (10 Hours)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          Joining Availability
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {['Immediate (Today / 24h)', 'Within 48 Hours', 'Next Week'].map((avail) => (
                            <button
                              key={avail}
                              type="button"
                              onClick={() => setJoiningAvailability(avail)}
                              className={`py-2 px-1 text-[11px] rounded-xl font-bold transition-all cursor-pointer text-center ${
                                joiningAvailability === avail
                                  ? 'bg-brand text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {avail.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Preferred Local Delivery Hub / Area
                      </label>
                      <input
                        type="text"
                        value={deliveryArea}
                        onChange={(e) => setDeliveryArea(e.target.value)}
                        placeholder="e.g. Koramangala / HSR / Indiranagar / Powai / Hitec City"
                        className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* ── OTHER DISCIPLINES PREFERENCES ── */}
                {mainCategory === 'others' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Specialized Sector / Field *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          'Retail & Store Management',
                          'Customer Support & BPO',
                          'Healthcare & Allied Services',
                          'Hospitality & Front Office',
                          'Media & Video Production',
                          'Vocational & Facility Management'
                        ].map((sector) => (
                          <button
                            key={sector}
                            type="button"
                            onClick={() => setOtherSector(sector)}
                            className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                              otherSector === sector
                                ? 'bg-brand text-white shadow-xs'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            {sector}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          Experience Level *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Fresher / Trainee', '1–3 Years', '3+ Years'].map((exp) => (
                            <button
                              key={exp}
                              type="button"
                              onClick={() => setOtherExperience(exp)}
                              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                otherExperience === exp
                                  ? 'bg-brand text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {exp}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                          Preferred Shift Schedule
                        </label>
                        <select
                          value={otherShift}
                          onChange={(e) => setOtherShift(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium cursor-pointer"
                        >
                          <option value="Day Shift (Retail / Corporate)">Day Shift (General Hours)</option>
                          <option value="Rotational Shifts (24/7 Ops)">Rotational Shifts (24/7)</option>
                          <option value="Night Shift (International Support)">Night Shift (Global)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Key Competencies &amp; Language Capabilities *
                      </label>
                      <input
                        type="text"
                        required
                        value={otherSkills}
                        onChange={(e) => setOtherSkills(e.target.value)}
                        placeholder="e.g. Customer Care, POS Billing, Fluent English, Hindi, Inventory"
                        className="w-full px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Target Preferred Work Locations
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {['Bengaluru', 'Hyderabad', 'Pune', 'Delhi NCR', 'Mumbai', 'Chennai', 'Kolkata'].map((cityName) => {
                          const isSel = otherCities.includes(cityName);
                          return (
                            <button
                              key={cityName}
                              type="button"
                              onClick={() => toggleArrayItem(setOtherCities, otherCities, cityName)}
                              className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                isSel
                                  ? 'bg-brand/15 text-brand dark:text-blue-400 border border-brand/30'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {isSel && <Check size={12} />}
                              {cityName}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* Back & Submit Row */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[46px]"
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-graphic-hover w-2/3 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold shadow-md shadow-brand/20 active:scale-[0.98] transition-all cursor-pointer min-h-[46px]"
                >
                  <span>{isLoading ? 'Creating Profile...' : 'Complete & Enter Portal'}</span>
                  {!isLoading && <ArrowRight size={16} className="btn-icon" />}
                </button>
              </div>

            </form>
          )}

          {/* Switch to Sign In */}
          <div className="mt-7 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Already registered with Startaply?{' '}
              <Link to="/login" className="text-brand hover:underline font-bold">
                Sign In to Account
              </Link>
            </p>
          </div>

        </div>
      </main>

      {/* ── FOOTER UTILITY ── */}
      <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Startaply Inc. All rights reserved. Strictly ₹0 candidate brokerage.
      </footer>

    </div>
  );
};

export default SignupPage;
