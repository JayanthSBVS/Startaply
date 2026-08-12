import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Building2, Users, PartyPopper, BookOpen, Home, LifeBuoy } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import SupportModal from './SupportModal';

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

  return (
    <div className={`fixed top-0 inset-x-0 z-50 h-16 bg-surface-raised border-b border-border transition-shadow duration-fast ${scrolled ? 'shadow-sm' : ''}`}>
      <nav className="h-full w-full max-w-[1200px] mx-auto px-4 md:px-8 flex justify-between items-center">

        {/* ── Logo ── */}
        <Link to="/" className="flex flex-col shrink-0 group focus-visible rounded-sm">
          <span className="font-black tracking-tighter leading-none text-2xl text-content">
            START<span className="text-brand transition-colors duration-fast group-hover:text-brand-hover">APLY</span>
          </span>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <div className="hidden lg:flex items-center gap-2 text-sm font-semibold text-content-secondary">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-4 py-2 rounded-md transition-colors duration-fast focus-visible ${
                  active
                    ? 'text-brand bg-brand-soft'
                    : 'hover:text-content hover:bg-surface-muted'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* ── Desktop CTA & Theme Toggle ── */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-content-secondary hover:text-brand transition-colors focus-visible outline-none px-2 py-1"
          >
            <LifeBuoy size={18} /> Support
          </button>
          <ThemeToggle />
          <Link
            to="/jobs"
            className="flex items-center justify-center min-h-[44px] bg-brand hover:bg-brand-hover text-on-brand px-6 rounded-md text-sm font-semibold transition-colors duration-fast focus-visible shadow-xs"
          >
            Browse Jobs
          </Link>
        </div>

        {/* ── Mobile Right Side ── */}
        <div className="flex lg:hidden items-center gap-3">
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="flex items-center justify-center min-h-[44px] text-content-secondary hover:text-brand transition-colors focus-visible outline-none p-1"
            aria-label="Support"
          >
            <LifeBuoy size={20} />
          </button>
          <Link
            to="/jobs"
            className="flex items-center justify-center min-h-[44px] px-4 bg-brand hover:bg-brand-hover text-on-brand text-xs font-semibold rounded-md transition-colors duration-fast focus-visible shadow-xs"
          >
            Browse Jobs
          </Link>
          <ThemeToggle />
        </div>

      </nav>
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </div>
  );
};

export default Navbar;
