import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Briefcase,
  GraduationCap,
  Users,
  PartyPopper,
  BookOpen,
  Info,
  MoreHorizontal,
  X,
  Search,
} from 'lucide-react';
import BrandLogo from './BrandLogo';

const HIDDEN_ROUTES = ['/admin', '/admin-login', '/admin/dashboard'];

const PRIMARY_TABS = [
  { id: 'home',      label: 'Home',        path: '/',            icon: Home },
  { id: 'jobs',      label: 'Jobs',        path: '/jobs',        icon: Briefcase },
  { id: 'companies', label: 'Companies',   path: '/companies',   icon: Users },
  { id: 'melas',     label: 'Job Melas',   path: '/job-melas',   icon: PartyPopper },
];

const MORE_ITEMS = [
  { label: 'Preparation Hub', path: '/preparation', icon: BookOpen },
  { label: 'IT & Software',   path: '/jobs?section=it', icon: GraduationCap },
  { label: 'College Collabs', path: '/#collabs', icon: GraduationCap, isHash: true },
  { label: 'About Us',        path: '/about',       icon: Info },
];

const isRouteActive = (path, pathname) => {
  if (!path) return false;
  if (path.includes('#')) return false;
  const current = decodeURIComponent(pathname);
  const target  = decodeURIComponent(path.split('?')[0]);
  if (target === '/') return current === '/';
  if (target === '/job-melas' || target === '/job-mela') {
    return current.startsWith('/job-mela');
  }
  if (target === '/companies' || target === '/company') {
    return current.startsWith('/companies') || current.startsWith('/company');
  }
  if (target === '/jobs') {
    return current === '/jobs' || current.startsWith('/jobs?') || current.startsWith('/category');
  }
  return current === target || current.startsWith(target);
};

const isMoreActive = (pathname) =>
  MORE_ITEMS.some(({ path }) => isRouteActive(path, pathname));

const MobileBottomNav = () => {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const hidden = HIDDEN_ROUTES.some(r => location.pathname.startsWith(r));

  useEffect(() => {
    if (hidden) return;
    document.body.classList.add('has-mobile-nav');
    return () => document.body.classList.remove('has-mobile-nav');
  }, [hidden]);

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  const closeMore = useCallback(() => setMoreOpen(false), []);
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeMore(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moreOpen, closeMore]);

  if (hidden) return null;

  const moreActive = isMoreActive(location.pathname);

  return (
    <>
      {/* ── More Sheet Backdrop ── */}
      {moreOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMore}
          aria-hidden="true"
        />
      )}

      {/* ── More Sheet ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800 z-50 lg:hidden rounded-t-[2rem] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] transition-transform duration-300 ease-out shadow-2xl ${
          moreOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-label="More navigation options"
        aria-modal="true"
      >
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-4" />
        <div className="flex justify-between items-center mb-5 px-1 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <BrandLogo variant="horizontal" height={26} />
          </div>
          <button
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus-visible"
            onClick={closeMore}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {MORE_ITEMS.map(({ label, path, icon: Icon, isHash }) => {
            const active = isRouteActive(path, location.pathname);
            const content = (
              <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                active
                  ? 'bg-brand text-on-brand border-brand shadow-sm'
                  : 'bg-slate-50 dark:bg-[#121212] border-slate-200/80 dark:border-neutral-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  active ? 'bg-white/20 text-white' : 'bg-brand-soft text-brand dark:text-brand-hover'
                }`}>
                  <Icon size={18} strokeWidth={2.2} />
                </div>
                <span className="text-xs font-bold truncate">{label}</span>
              </div>
            );

            if (isHash) {
              return (
                <a
                  key={label}
                  href={path}
                  onClick={closeMore}
                  className="block active:scale-95 transition-transform"
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={label}
                to={path}
                onClick={closeMore}
                className="block active:scale-95 transition-transform"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Bar Dock ── */}
      <nav className="fixed bottom-0 inset-x-0 h-16 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-white/10 z-40 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]" aria-label="Mobile navigation">
        <div className="flex w-full h-full max-w-[500px] mx-auto px-2 justify-around items-center pb-[env(safe-area-inset-bottom)]">
          {PRIMARY_TABS.map(({ id, label, path, icon: Icon }) => {
            const active = isRouteActive(path, location.pathname);
            return (
              <Link
                key={id}
                to={path}
                className="relative flex-1 flex flex-col items-center justify-center h-full py-1 border-none bg-transparent active:scale-90 transition-transform duration-150 focus-visible group"
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <span className="absolute top-1.5 w-6 h-1 rounded-full bg-brand dark:bg-brand-hover" />
                )}
                <span className={`transition-colors duration-150 ${active ? 'text-brand dark:text-brand-hover' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                </span>
                <span className={`text-[10px] font-bold tracking-tight mt-1 transition-colors duration-150 ${active ? 'text-brand dark:text-brand-hover font-black' : 'text-slate-500 dark:text-slate-400'}`}>
                  {label}
                </span>
              </Link>
            );
          })}

          <button
            className="relative flex-1 flex flex-col items-center justify-center h-full py-1 border-none bg-transparent active:scale-90 transition-transform duration-150 focus-visible group"
            onClick={() => setMoreOpen(prev => !prev)}
            aria-label="More options"
            aria-expanded={moreOpen}
          >
            {(moreActive || moreOpen) && (
              <span className="absolute top-1.5 w-6 h-1 rounded-full bg-brand dark:bg-brand-hover" />
            )}
            <span className={`transition-colors duration-150 ${(moreActive || moreOpen) ? 'text-brand dark:text-brand-hover' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
              <MoreHorizontal size={20} strokeWidth={(moreActive || moreOpen) ? 2.5 : 2} />
            </span>
            <span className={`text-[10px] font-bold tracking-tight mt-1 transition-colors duration-150 ${(moreActive || moreOpen) ? 'text-brand dark:text-brand-hover font-black' : 'text-slate-500 dark:text-slate-400'}`}>
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
