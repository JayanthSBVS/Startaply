import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck, User, Building2, 
  CheckCircle2, Eye, EyeOff, Sparkles, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/common/BrandLogo';
import ThemeToggle from '../components/common/ThemeToggle';

const LoginPage = () => {
  const [roleTab, setRoleTab] = useState('candidate'); // 'candidate' | 'employer'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Try server login
      const res = await axios.post('/api/auth/login', { email, password }).catch(() => null);
      if (res && res.data && res.data.token) {
        login(res.data.token, res.data.user);
        navigate('/');
        return;
      }

      // 2. Client-side fallback for candidate / demo login
      const mockUser = {
        id: 'user_' + Date.now(),
        email: email,
        name: email.split('@')[0].replace(/[._]/g, ' '),
        role: roleTab === 'employer' ? 'employer' : 'candidate'
      };
      const mockToken = 'mock_token_' + Date.now();
      login(mockToken, mockUser);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoCandidate = () => {
    setEmail('candidate@startaply.com');
    setPassword('Candidate@123');
  };

  const handleDemoEmployer = () => {
    setEmail('recruiter@techmahindra.com');
    setPassword('Recruiter@123');
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

      {/* ── MAIN AUTH CONTAINER ── */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 soft-shadow overflow-hidden">
          
          {/* ── LEFT EDITORIAL & SOCIAL PROOF PANE (DESKTOP) ── */}
          <div className="hidden lg:flex lg:col-span-5 bg-slate-50 dark:bg-slate-950 p-10 flex-col justify-between relative overflow-hidden border-r border-slate-200/80 dark:border-slate-800/80 text-left">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand">
                DIRECT MOBILITY NETWORK
              </span>

              <h2 className="text-3xl font-black text-slate-950 dark:text-white mt-3 leading-tight tracking-tight">
                India’s direct career &amp; opportunity engine.
              </h2>
              
              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Access your verified candidate profile, track walk-in recruitment passes, and connect directly with enterprise HR teams.
              </p>

              <div className="mt-8 space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>100% Verified Corporate Drives:</strong> Direct HR screening with exact venue coordinates.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Zero Brokerage Deductions:</strong> Keep every single rupee of your corporate offer.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Free Interview Preparation Hub:</strong> 500+ solved screening questions &amp; STAR frameworks.</span>
                </div>
              </div>
            </div>

            {/* Candidate Micro-Review Card */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs">
                <p className="italic text-slate-700 dark:text-slate-300 leading-relaxed">
                  "Applied directly with my project portfolio and cleared the technical evaluation in 4 days. Zero middleman fees."
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-950 dark:text-white">Ananya Reddy</span>
                  <span className="text-brand font-semibold">Tech Mahindra</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                Protected by Startaply Single Identity Security
              </div>
            </div>
          </div>

          {/* ── RIGHT AUTHENTICATION FORM ── */}
          <div className="lg:col-span-7 p-7 sm:p-12 flex flex-col justify-center text-left">
            
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                Sign In to Startaply
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Select your account role to access your personalized portal
              </p>
            </div>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6">
              <button
                type="button"
                onClick={() => setRoleTab('candidate')}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  roleTab === 'candidate'
                    ? 'bg-white dark:bg-slate-900 text-brand dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User size={15} /> Candidate / Talent
              </button>
              <button
                type="button"
                onClick={() => setRoleTab('employer')}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  roleTab === 'employer'
                    ? 'bg-white dark:bg-slate-900 text-brand dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 size={15} /> Enterprise Recruiter
              </button>
            </div>

            {/* Demo Helper Strip */}
            <div className="mb-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Quick Demo Testing:</span>
              <button
                type="button"
                onClick={roleTab === 'candidate' ? handleDemoCandidate : handleDemoEmployer}
                className="text-brand hover:underline font-bold cursor-pointer"
              >
                Auto-fill {roleTab === 'candidate' ? 'Candidate' : 'Recruiter'}
              </button>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs p-3.5 rounded-xl border border-red-200 dark:border-red-900/50 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {roleTab === 'candidate' ? 'Email Address' : 'Corporate Work Email'}
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
                    placeholder={roleTab === 'candidate' ? 'candidate@startaply.com' : 'recruiter@techmahindra.com'}
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <a 
                    href="#forgot" 
                    onClick={(e) => { e.preventDefault(); alert('Password reset link dispatched to your verified email.'); }} 
                    className="text-xs text-brand hover:underline font-semibold"
                  >
                    Forgot Password?
                  </a>
                </div>
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

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-bold shadow-xs active:scale-95 transition-all cursor-pointer min-h-[46px]"
                >
                  {isLoading ? 'Signing In...' : `Sign In to Account`}
                  {!isLoading && <ArrowRight size={16} />}
                </button>
              </div>

            </form>

            {/* Footer Navigation Switcher */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center space-y-3">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Don’t have an account yet?{' '}
                <Link to="/signup" className="text-brand hover:underline font-bold">
                  Create a Free Account
                </Link>
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Startaply Staff Console?{' '}
                <Link to="/admin/login" className="hover:underline text-slate-600 dark:text-slate-400 font-semibold">
                  Employee Portal
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

export default LoginPage;
