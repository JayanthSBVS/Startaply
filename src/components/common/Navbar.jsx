import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Building2, Users, PartyPopper, BookOpen, Home, LifeBuoy } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import SupportModal from './SupportModal';

const TelegramIcon = ({ size = 18, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.75 3.99-1.74 6.66-2.89 8.01-3.45 3.82-1.59 4.62-1.87 5.14-1.88.11 0 .37.03.54.17.14.12.18.29.2.42-.01.07.01.24 0 .38z"/>
  </svg>
);

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
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <a
            href="https://t.me/startaply"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-3.5 py-1.5 rounded-full text-xs font-black transition-all shadow-md shadow-sky-500/20 hover:scale-105 active:scale-95 border border-sky-400/30 relative overflow-hidden group"
            title="Join our official Telegram channel for instant job alerts!"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <TelegramIcon size={16} className="text-white drop-shadow-sm" />
              <span>Telegram</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </span>
          </a>

          <button 
            onClick={() => setIsSupportOpen(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-content-secondary hover:text-brand transition-colors focus-visible outline-none px-2 py-1"
          >
            <LifeBuoy size={18} /> Support
          </button>
          <ThemeToggle />
          <Link
            to="/jobs"
            className="flex items-center justify-center min-h-[38px] bg-brand hover:bg-brand-hover text-on-brand px-5 rounded-full text-xs font-bold transition-colors duration-fast focus-visible shadow-xs"
          >
            Browse Jobs
          </Link>
        </div>

        {/* ── Mobile Right Side ── */}
        <div className="flex lg:hidden items-center gap-2">
          <a
            href="https://t.me/startaply"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-2.5 py-1.5 rounded-full text-[11px] font-black transition-all shadow-sm shadow-sky-500/20 active:scale-95"
            aria-label="Telegram"
          >
            <TelegramIcon size={15} />
            <span>Telegram</span>
          </a>
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="flex items-center justify-center min-h-[44px] text-content-secondary hover:text-brand transition-colors focus-visible outline-none p-1"
            aria-label="Support"
          >
            <LifeBuoy size={20} />
          </button>
          <ThemeToggle />
        </div>

      </nav>
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </div>
  );
};

export default Navbar;
