import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail, Lock, ArrowRight, ArrowLeft,
  Eye, EyeOff, KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/common/BrandLogo';
import ThemeToggle from '../components/common/ThemeToggle';

const LoginPage = () => {
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
      const res = await axios.post('/api/auth/login', {
        email: email.trim(),
        password
      });

      if (res && res.data && res.data.token) {
        login(res.data.token, res.data.user);
        navigate('/');
      } else {
        throw new Error('Authentication response missing session token');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#F4F6FB] dark:bg-[#070B14] text-[#0A0F1D] dark:text-[#F8FAFC] flex flex-col justify-between selection:bg-brand selection:text-white transition-colors duration-200 relative overflow-hidden pb-[env(safe-area-inset-bottom)]">

      {/* ── AMBIENT BACKGROUND GLOW ── */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand/10 via-indigo-500/10 to-blue-400/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* ── TOP UTILITY STRIP ── */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="sm:hidden flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft size={18} />
          </Link>
          <Link to="/" className="flex items-center gap-2 group" aria-label="Startaply Home">
            <BrandLogo variant="horizontal" height={26} className="sm:h-7" />
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 min-h-[44px] px-3 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand dark:hover:text-white transition-colors rounded-xl"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div className="p-1">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── CENTERED ELEGANT FORM CARD ── */}
      <main className="max-w-md w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6 my-auto relative z-10 text-left">
        <div className="rounded-2xl sm:rounded-[2rem] bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/60 p-5 sm:p-10 transition-all">

          {/* Header & Icon */}
          <div className="mb-5 sm:mb-6 text-center">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-brand/10 dark:bg-brand/20 text-brand flex items-center justify-center mx-auto mb-3 shadow-xs">
              <KeyRound size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sign in to access your direct career feed &amp; passes
            </p>
          </div>

          {error && (
            <div className="mb-4 sm:mb-5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs p-3.5 rounded-xl border border-red-200 dark:border-red-900/50 font-medium leading-relaxed" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 text-base sm:text-sm placeholder:text-xs sm:placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert('Password reset verification link has been sent to your email.'); }}
                  className="text-xs text-brand hover:underline font-semibold py-1 px-1 min-h-[36px] inline-flex items-center"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 text-base sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 w-11 min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer active:scale-95 transition-transform"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                className="btn-graphic-hover w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-bold shadow-md shadow-brand/20 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In to Account'}</span>
                {!isLoading && <ArrowRight size={16} className="btn-icon" />}
              </button>
            </div>

          </form>

          {/* Bottom Switcher */}
          <div className="mt-6 sm:mt-7 pt-4 sm:pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Don’t have an account yet?{' '}
              <Link to="/signup" className="text-brand hover:underline font-bold inline-flex items-center min-h-[40px] px-1">
                Create a Free Account
              </Link>
            </p>
          </div>

        </div>
      </main>

      {/* ── FOOTER UTILITY ── */}
      <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Startaply Inc. All rights reserved. Strictly ₹0 candidate brokerage.
      </footer>

    </div>
  );
};

export default LoginPage;
