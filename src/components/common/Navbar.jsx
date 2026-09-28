import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Users, PartyPopper, BookOpen, Home, LifeBuoy, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import SupportModal from './SupportModal';
import BrandLogo from './BrandLogo';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-login');
  if (isAdminRoute) return null;

  const menuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'IT & Tech', path: '/category/IT%20%26%20Non-IT%20Jobs', icon: GraduationCap },
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

  return (
    <header className={`fixed top-0 inset-x-0 z-50 h-14 md:h-16 bg-white/85 dark:bg-[#0b0f14]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 transition-all duration-200 ${scrolled ? 'shadow-sm' : ''}`}>
      <nav className="h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">

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

        {/* ── Desktop Actions (Support, Theme, Browse Jobs) ── */}
        <div className="hidden lg:flex items-center gap-3.5 shrink-0">
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-brand dark:hover:text-brand-hover transition-colors focus-visible outline-none px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
            aria-label="Contact Support"
          >
            <LifeBuoy size={16} className="text-brand" /> Support
          </button>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
          <ThemeToggle />
          <Link
            to="/jobs"
            className="flex items-center justify-center min-h-[40px] bg-brand hover:bg-brand-hover text-on-brand px-5 rounded-xl text-xs font-bold transition-all duration-150 focus-visible shadow-sm shadow-brand/20 active:scale-95"
          >
            Explore Jobs
          </Link>
        </div>

        {/* ── Mobile Right App Bar ── */}
        <div className="flex lg:hidden items-center gap-1.5">
          <Link
            to="/jobs"
            className="flex items-center justify-center min-h-[38px] min-w-[38px] text-slate-600 dark:text-slate-300 hover:text-brand active:bg-slate-100 dark:active:bg-white/10 rounded-xl transition-colors focus-visible outline-none"
            aria-label="Search Jobs"
          >
            <Search size={18} />
          </Link>
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="flex items-center justify-center min-h-[38px] min-w-[38px] text-slate-600 dark:text-slate-300 hover:text-brand active:bg-slate-100 dark:active:bg-white/10 rounded-xl transition-colors focus-visible outline-none"
            aria-label="Help and Support"
          >
            <LifeBuoy size={18} />
          </button>
          <ThemeToggle />
        </div>

      </nav>
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </header>
  );
};

export default Navbar;
