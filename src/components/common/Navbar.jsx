import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Building2, Users, PartyPopper, BookOpen, Info, Home } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const location = useLocation();

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
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* Logo — visible on all screen sizes */}
        <Link to="/" className="flex flex-col shrink-0 group">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            START<span className="text-emerald-600">APLY</span>
          </span>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-[0.2em] mt-1 group-hover:text-emerald-600 transition-colors uppercase">
            Find . Apply . Grow
          </span>
        </Link>

        {/* ── Desktop nav links (hidden on mobile) ── */}
        <div className="hidden lg:flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 overflow-x-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`transition-all duration-300 whitespace-nowrap px-4 py-2 rounded-full ${
                isActive(item.path)
                  ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
                  : 'hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-800/50'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* ── Desktop CTA (hidden on mobile) ── */}
        <div className="hidden lg:flex items-center gap-4 shrink-0 px-4">
          <ThemeToggle />
          <Link
            to="/jobs"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 transition-all"
          >
            Browse Jobs
          </Link>
        </div>

        {/* ── Mobile: theme toggle only (hamburger replaced by bottom nav) ── */}
        <div className="flex lg:hidden items-center">
          <ThemeToggle />
        </div>

      </div>
    </nav>
  );
};

export default Navbar;