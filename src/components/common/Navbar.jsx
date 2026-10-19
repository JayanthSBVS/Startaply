import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap, Users, PartyPopper, BookOpen, Home, LifeBuoy,
  Search, User, LogOut, SlidersHorizontal, ChevronDown,
  MapPin, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import SupportModal from './SupportModal';
import ProfilePreferencesModal from './ProfilePreferencesModal';
import BrandLogo from './BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { getCandidateProfile, getComboBadgeInfo } from '../../utils/candidatePersonalization';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const candidateProfile = useMemo(() => getCandidateProfile(user), [user]);
  const comboBadge = useMemo(() => getComboBadgeInfo(candidateProfile), [candidateProfile]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-login');
  const isLandingRoute = location.pathname === '/landing' || (!user && location.pathname === '/');
  if (isAdminRoute || isLandingRoute) return null;

  const menuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Jobs', path: '/jobs', icon: GraduationCap },
    { name: 'Companies', path: '/companies', icon: Users },
    { name: 'Job Melas', path: '/job-melas', icon: PartyPopper },
    { name: 'Preparation', path: '/preparation', icon: BookOpen },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    const currentPath = decodeURIComponent(location.pathname);
    const targetPath = decodeURIComponent(path.split('?')[0]);
    return currentPath === targetPath || (targetPath !== '/' && currentPath.startsWith(targetPath));
  };

  const userInitial = (user?.name?.trim() || user?.email?.trim() || 'U').charAt(0).toUpperCase();

  return (
    <header className={`fixed top-0 inset-x-0 z-50 h-14 md:h-16 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 transition-all duration-200 ${scrolled ? 'shadow-sm' : ''}`}>
      <nav className="h-full w-full max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-10 flex justify-between items-center">

        {/* ── Brand Logo ── */}
        <Link to="/" className="flex items-center shrink-0 group focus-visible rounded-lg" aria-label="Startaply Home">
          <BrandLogo variant="horizontal" height={28} className="group-hover:opacity-95 transition-opacity" />
        </Link>

        {/* ── Desktop Navigation Links ── */}
        <div className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-3.5 py-2 rounded-xl transition-all duration-150 focus-visible ${
                  active
                    ? 'text-brand bg-brand-soft font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* ── Desktop Actions (Theme, User Profile & Preferences) ── */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <ThemeToggle />

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />

          {user ? (
            <div className="relative" ref={profileMenuRef}>
              {/* Unique Interactive Candidate Pill */}
              <button
                onClick={() => setIsProfileMenuOpen(prev => !prev)}
                className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  isProfileMenuOpen
                    ? 'bg-slate-100 dark:bg-neutral-800 border-brand/50 shadow-sm'
                    : 'bg-slate-50/80 dark:bg-neutral-900/80 hover:bg-slate-100 dark:hover:bg-neutral-800 border-slate-200 dark:border-neutral-800'
                }`}
                aria-label="User Profile and Preferences"
                aria-expanded={isProfileMenuOpen}
              >
                {/* Clean Avatar Circle (No online dot) */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-indigo-600 text-white font-extrabold text-xs shadow-sm shadow-brand/20 shrink-0">
                  {userInitial}
                </div>

                {/* Candidate Name & Combo Pill */}
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight max-w-[120px] truncate">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
                    {comboBadge.label}
                  </span>
                </div>

                {/* Chevron */}
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180 text-brand' : ''}`}
                />
              </button>

              {/* Floating Modern Profile Popover Card */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-neutral-800 overflow-hidden z-50 divide-y divide-slate-100 dark:divide-neutral-800"
                  >
                    {/* Header Card */}
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-brand-soft/30 dark:from-neutral-900 dark:to-neutral-850">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-brand to-indigo-600 text-white font-extrabold text-base shadow-md shadow-brand/20 shrink-0">
                          {userInitial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {user.name || 'Candidate'}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* Active Track Badge - Clean without extra icons */}
                      <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-neutral-800 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          {comboBadge.fullTitle}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${comboBadge.pillClass}`}>
                          Active Feed
                        </span>
                      </div>
                    </div>

                    {/* Preferences Trigger */}
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsPreferencesOpen(true);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-brand-soft/60 dark:hover:bg-brand/10 transition-colors group text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center group-hover:scale-105 transition-transform">
                            <SlidersHorizontal size={16} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              Edit Preferences
                              <span className="text-[9px] font-extrabold bg-brand text-white px-1.5 py-0.2 rounded-md">LIVE</span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              Change track, skills & location
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-brand group-hover:translate-x-0.5 transition-transform">
                          →
                        </span>
                      </button>
                    </div>

                    {/* Quick Profile Summary */}
                    <div className="px-4 py-3 bg-slate-50/50 dark:bg-neutral-950/40 text-[11px] space-y-1.5 text-slate-600 dark:text-slate-400">
                      {user.city && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-slate-400" />
                          <span>Location: <strong className="text-slate-800 dark:text-slate-200">{user.city}</strong></span>
                        </div>
                      )}
                      {user.subTrack && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                          <span className="truncate">Focus: <strong className="text-slate-800 dark:text-slate-200">{user.subTrack}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsSupportOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <LifeBuoy size={14} className="text-slate-400" />
                        Help & Support Desk
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors mt-0.5"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-1">
              <Link
                to="/login"
                className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-brand px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="flex items-center justify-center min-h-[38px] bg-brand hover:bg-brand-hover text-white px-4 rounded-xl text-xs font-bold transition-all duration-150 shadow-sm shadow-brand/20 active:scale-95"
              >
                Join Free
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile Right App Bar ── */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            to="/jobs"
            className="flex items-center justify-center min-h-[38px] min-w-[38px] text-slate-600 dark:text-slate-300 hover:text-brand active:bg-slate-100 dark:active:bg-white/10 rounded-xl transition-colors focus-visible outline-none"
            aria-label="Search Jobs"
          >
            <Search size={18} />
          </Link>

          <ThemeToggle />

          {user ? (
            <button
              onClick={() => setIsPreferencesOpen(true)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-indigo-600 text-white font-bold text-xs shadow-sm ring-2 ring-brand/30"
              title="Edit Career Preferences"
              aria-label="Open Profile Preferences"
            >
              {userInitial}
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center min-h-[38px] min-w-[38px] text-slate-600 dark:text-slate-300 hover:text-brand active:bg-slate-100 dark:active:bg-white/10 rounded-xl transition-colors focus-visible outline-none"
              aria-label="Sign In"
            >
              <User size={18} />
            </Link>
          )}
        </div>

      </nav>

      {/* Support Modal */}
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />

      {/* Interactive Candidate Profile & Career Preferences Modal */}
      <ProfilePreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </header>
  );
};

export default Navbar;
