import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Building2, Users, PartyPopper, BookOpen, Info, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'IT & Non-IT Jobs', path: '/category/IT%20%26%20Non-IT%20Jobs', icon: GraduationCap },
    { name: 'Govt Jobs', path: '/category/Government%20Jobs', icon: Building2 },
    { name: 'Companies', path: '/companies', icon: Users },
    { name: 'Job Melas', path: '/job-melas', icon: PartyPopper },
    { name: 'Preparation', path: '/preparation', icon: BookOpen },
    { name: 'About Us', path: '/about', icon: Info },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    const currentPath = decodeURIComponent(location.pathname);
    const targetPath = decodeURIComponent(path.split('?')[0]);
    return currentPath === targetPath || (targetPath !== '/' && currentPath.startsWith(targetPath));
  };

  return (
    <motion.nav
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]'
          : 'bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-b border-slate-200/40 dark:border-slate-800/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex flex-col shrink-0 group">
          <motion.span
            className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none"
            whileHover={{ letterSpacing: '-0.02em' }}
            transition={{ duration: 0.2 }}
          >
            START<span className="text-emerald-500">APLY</span>
          </motion.span>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-[0.2em] mt-0.5 group-hover:text-emerald-500 transition-colors duration-300 uppercase">
            Find · Apply · Grow
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-0.5 text-sm font-semibold text-slate-600 dark:text-slate-400">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-link relative px-3.5 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap ${
                isActive(item.path)
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 active'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <Link
            to="/jobs"
            className="relative overflow-hidden bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 rounded-full text-sm font-bold shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 transition-all duration-200 btn-shimmer"
          >
            Browse Jobs
          </Link>
        </div>

        {/* Mobile: Theme Toggle Only */}
        <div className="flex lg:hidden items-center">
          <ThemeToggle />
        </div>

      </div>
    </motion.nav>
  );
};

export default Navbar;