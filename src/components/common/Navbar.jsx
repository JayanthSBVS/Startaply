import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Building2, Users, PartyPopper, BookOpen, Info, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Exclude rendering Navbar on admin dashboard and login screens
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-login');
  if (isAdminRoute) return null;

  const menuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'IT & Tech', path: '/category/IT%20%26%20Non-IT%20Jobs', icon: GraduationCap },
    { name: 'Govt', path: '/category/Government%20Jobs', icon: Building2 },
    { name: 'Companies', path: '/companies', icon: Users },
    { name: 'Melas', path: '/job-melas', icon: PartyPopper },
    { name: 'Prep', path: '/preparation', icon: BookOpen },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    const currentPath = decodeURIComponent(location.pathname);
    const targetPath = decodeURIComponent(path.split('?')[0]);
    return currentPath === targetPath || (targetPath !== '/' && currentPath.startsWith(targetPath));
  };

  const isHome = location.pathname === '/';
  const isDarkNav = scrolled || isHome;

  return (
    <div className={`fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none transition-all duration-500 ${
      scrolled ? 'p-2 md:p-4' : 'p-0'
    }`}>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled
            ? 'w-[95%] max-w-5xl rounded-[2rem] py-1.5 backdrop-blur-2xl bg-black/45 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
            : `w-full rounded-none py-4 backdrop-blur-xl ${
                isHome 
                  ? 'bg-black/20 border-none' 
                  : 'bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/60 dark:border-white/5 shadow-sm'
              }`
        }`}
      >
        <div className={`flex justify-between items-center w-full transition-all duration-500 ${
          scrolled ? 'px-4 md:px-8' : 'max-w-7xl mx-auto px-4 md:px-8'
        }`}>
          {/* ── Logo ── */}
          <Link to="/" className="flex flex-col shrink-0 group z-10">
            <span
              className={`font-black tracking-tighter leading-none transition-colors duration-300 ${
                scrolled ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'
              } ${isDarkNav ? 'text-white' : 'text-slate-900 dark:text-white'}`}
            >
              START<span className="text-emerald-500 dark:text-emerald-400 group-hover:text-emerald-400 dark:group-hover:text-emerald-300 transition-colors duration-300">APLY</span>
            </span>
            {!scrolled && (
              <span className={`text-[9px] md:text-[10px] font-bold tracking-[0.25em] mt-0.5 transition-colors duration-300 uppercase ${
                isDarkNav ? 'text-slate-300 group-hover:text-emerald-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
              }`}>
                Opportunity Engine
              </span>
            )}
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className={`hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-semibold ${isDarkNav ? 'text-white/90' : 'text-slate-600 dark:text-white/80'}`}>
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-link relative px-4 py-2 rounded-xl transition-all duration-300 whitespace-nowrap overflow-hidden group ${
                  isActive(item.path)
                    ? (isDarkNav 
                        ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 active shadow-sm'
                        : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20 active shadow-sm')
                    : `hover:text-emerald-400 dark:hover:text-emerald-400 ${isDarkNav ? 'hover:bg-white/10' : 'hover:bg-slate-100 dark:hover:bg-white/10'}`
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* ── Desktop CTA ── */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <ThemeToggle />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/jobs"
                className="relative overflow-hidden group bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-2.5 rounded-full text-sm font-bold shadow-[0_4px_16px_rgba(16,185,129,0.25)] transition-all duration-300 block border border-emerald-400"
              >
                <span className="relative z-10 flex items-center gap-2">Browse Jobs</span>
              </Link>
            </motion.div>
          </div>

          {/* ── Mobile Toggle ── */}
          <div className="flex lg:hidden items-center gap-3 z-10">
            <ThemeToggle />
          </div>

        </div>


      </motion.nav>
    </div>
  );
};

export default Navbar;
