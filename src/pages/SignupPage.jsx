import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Lock, Phone, MapPin, Linkedin, ArrowRight, ArrowLeft, 
  CheckCircle2, ShieldCheck, GraduationCap, Briefcase, Truck, Sparkles, Check,
  Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/common/BrandLogo';
import ThemeToggle from '../components/common/ThemeToggle';

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1: Identity & Credentials, 2: Career Track & Profile

  // Step 1 State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [whatsappSync, setWhatsappSync] = useState(true);
  const [city, setCity] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [error, setError] = useState('');

  // Step 2 State
  const [careerTrack, setCareerTrack] = useState('graduate'); // 'graduate' | 'lateral' | 'gig'
  const [experienceStage, setExperienceStage] = useState('fresher'); // 'fresher' | 'experienced'
  const [qualification, setQualification] = useState('');
  const [skills, setSkills] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const mockCandidateUser = {
        id: 'candidate_' + Date.now(),
        name: fullName,
        email: email,
        phone: phone,
        city: city,
        role: 'candidate',
        careerTrack: careerTrack,
        experienceStage: experienceStage,
        qualification: qualification,
        skills: skills,
        linkedinUrl: linkedinUrl
      };
      const mockToken = 'mock_jwt_candidate_' + Date.now();

      login(mockToken, mockCandidateUser);
      navigate('/');
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6FB] dark:bg-[#070B14] text-[#0A0F1D] dark:text-[#F8FAFC] flex flex-col justify-between selection:bg-brand selection:text-white transition-colors duration-200">
      
      {/* ── TOP UTILITY STRIP ── */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" aria-label="Startaply Home">
          <BrandLogo variant="horizontal" height={28} />
        </Link>

        <div className="flex items-center gap-4">
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

      {/* ── MAIN REGISTRATION CONTAINER ── */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 soft-shadow overflow-hidden">
          
          {/* ── LEFT EDITORIAL & BENEFITS PANE (DESKTOP) ── */}
          <div className="hidden lg:flex lg:col-span-5 bg-slate-50 dark:bg-slate-950 p-10 flex-col justify-between relative overflow-hidden border-r border-slate-200/80 dark:border-slate-800/80 text-left">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand">
                100% FREE CANDIDATE PASSPORT
              </span>

              <h2 className="text-3xl font-black text-slate-950 dark:text-white mt-3 leading-tight tracking-tight">
                Direct corporate opportunities. Zero brokerage fees.
              </h2>
              
              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Join thousands of candidates who secured verified corporate roles, pool drives, and delivery operations passes directly with enterprise HR teams.
              </p>

              <div className="mt-8 space-y-4 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Zero Consultancy Fees:</strong> Strictly ₹0 registration or interview admission charges.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Direct Venue GPS Coordinates:</strong> Instant digital QR passes for corporate walk-in evaluation.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Free Interview Preparation Hub:</strong> Real screening technical questions, coding reviews, and HR STAR frameworks.</span>
                </div>
              </div>
            </div>

            {/* Stepper Indicator on Left Pane */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 1 ? 'bg-brand text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {step > 1 ? '✓' : '1'}
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Identity &amp; Credentials</div>
                  <div className="text-[11px] text-slate-500">Legal name, contact &amp; location</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 2 ? 'bg-brand text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  2
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Track &amp; Profile Preferences</div>
                  <div className="text-[11px] text-slate-500">Locks your opportunity feed</div>
                </div>
              </div>

              <div className="pt-2 text-[11px] font-mono text-slate-400">
                Encrypted &amp; Protected by Startaply Single Identity
              </div>
            </div>
          </div>

          {/* ── RIGHT REGISTRATION FORM WIZARD ── */}
          <div className="lg:col-span-7 p-7 sm:p-12 flex flex-col justify-center text-left">
            
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                {step === 1 ? 'Create Your Candidate Profile' : 'Select Your Opportunity Track'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {step === 1 
                  ? 'Step 1 of 2 — Verified candidate identity & communication credentials'
                  : 'Step 2 of 2 — Customizes your direct feed and recruiter recommendations'}
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs p-3.5 rounded-xl border border-red-200 dark:border-red-900/50 font-medium">
                {error}
              </div>
            )}

            {/* ── STEP 1: IDENTITY & CREDENTIALS ── */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-4">
                
                {/* Full Legal Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
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
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
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
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password & Mobile Number Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Password (Min 8 Chars) *
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
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-medium"
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
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
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
                        className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* City & LinkedIn Profile Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
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
                        className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      LinkedIn Profile (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Linkedin size={16} />
                      </div>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* WhatsApp Direct Notification Sync Checkbox */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="pr-4">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Direct WhatsApp Invitation Sync
                    </span>
                    <span className="text-[11px] text-slate-500">
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

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-bold shadow-xs active:scale-95 transition-all cursor-pointer min-h-[46px]"
                  >
                    <span>Continue to Track Selection</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

              </form>
            )}

            {/* ── STEP 2: TRACK & PREFERENCE SELECTION ── */}
            {step === 2 && (
              <form onSubmit={handleFinalSubmit} className="space-y-5">
                
                {/* 3 Career Tracks */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                    1. Select Your Primary Opportunity Track
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setCareerTrack('graduate')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        careerTrack === 'graduate'
                          ? 'bg-brand/10 border-brand text-brand dark:text-blue-400 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <GraduationCap size={20} className="mb-2" />
                      <div className="font-bold text-sm">Graduate &amp; Entry Tech</div>
                      <div className="text-[11px] opacity-80 mt-1">Class of 2024–26, Junior SDE, QA, Full-Stack</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCareerTrack('lateral')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        careerTrack === 'lateral'
                          ? 'bg-brand/10 border-brand text-brand dark:text-blue-400 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Briefcase size={20} className="mb-2" />
                      <div className="font-bold text-sm">Experienced Professional</div>
                      <div className="text-[11px] opacity-80 mt-1">1+ to 8+ Yrs, Tech Architecture &amp; Corporate</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCareerTrack('gig')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        careerTrack === 'gig'
                          ? 'bg-brand/10 border-brand text-brand dark:text-blue-400 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Truck size={20} className="mb-2" />
                      <div className="font-bold text-sm">Gig &amp; Delivery Services</div>
                      <div className="text-[11px] opacity-80 mt-1">Dispatch hubs, dark-stores &amp; on-demand fleet</div>
                    </button>
                  </div>
                </div>

                {/* Experience Stage */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    2. Experience Level
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setExperienceStage('fresher')}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        experienceStage === 'fresher'
                          ? 'bg-brand text-white border-brand shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Fresher / Entry Level (0–1 Yrs)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExperienceStage('experienced')}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        experienceStage === 'experienced'
                          ? 'bg-brand text-white border-brand shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Experienced Professional (1+ Yrs)
                    </button>
                  </div>
                </div>

                {/* Highest Qualification & Skills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Highest Qualification *
                    </label>
                    <input
                      type="text"
                      required
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. B.Tech / BCA / Degree / Diploma"
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Key Skills or Driving Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. React, Java OR 2-Wheeler License"
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand font-medium"
                    />
                  </div>
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
                    className="w-2/3 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all cursor-pointer min-h-[46px]"
                  >
                    {isLoading ? 'Creating Profile...' : 'Complete Profile & Enter Portal'}
                    {!isLoading && <ArrowRight size={16} />}
                  </button>
                </div>

              </form>
            )}

            {/* Switch to Sign In */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Already registered with Startaply?{' '}
                <Link to="/login" className="text-brand hover:underline font-bold">
                  Sign In to Account
                </Link>
              </p>
            </div>

          </div>

        </div>
      </main>

      {/* ── FOOTER UTILITY ── */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Startaply Inc. All rights reserved. Strictly ₹0 candidate brokerage.
      </footer>

    </div>
  );
};

export default SignupPage;
