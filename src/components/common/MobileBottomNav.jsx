import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  GraduationCap,
  Building2,
  Users,
  PartyPopper,
  BookOpen,
  Info,
  MoreHorizontal,
  X,
  Search,
} from 'lucide-react';

const HIDDEN_ROUTES = ['/admin', '/admin-login', '/admin/dashboard'];

const PRIMARY_TABS = [
  { id: 'home',    label: 'Home',        path: '/',                               icon: Home },
  { id: 'it',      label: 'IT Jobs',     path: '/category/IT%20%26%20Non-IT%20Jobs', icon: GraduationCap },
  { id: 'govt',    label: 'Govt Jobs',   path: '/category/Government%20Jobs',     icon: Building2 },
];

const MORE_ITEMS = [
  { label: 'Browse Jobs', path: '/jobs',        icon: Search,        isPrimary: true },
  { label: 'Companies',   path: '/companies',   icon: Users },
  { label: 'Job Melas',   path: '/job-melas',   icon: PartyPopper },
  { label: 'Preparation', path: '/preparation', icon: BookOpen },
  { label: 'About Us',    path: '/about',       icon: Info },
];

const isRouteActive = (path, pathname) => {
  if (!path) return false;
  if (path.includes('#')) return false;
  const current = decodeURIComponent(pathname);
  const target  = decodeURIComponent(path.split('?')[0]);
  if (target === '/') return current === '/';
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
          className="fixed inset-0 bg-overlay z-40 lg:hidden"
          onClick={closeMore}
          aria-hidden="true"
        />
      )}

      {/* ── More Sheet ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-surface-raised border-t border-border z-50 lg:hidden rounded-t-xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] transition-transform duration-base ease-standard ${
          moreOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-label="More navigation options"
        aria-modal="true"
      >
        <div className="flex justify-between items-center mb-4 px-2">
          <span className="text-lg font-bold text-content">More</span>
          <button
            className="p-2 rounded-full bg-surface-muted text-content-muted hover:text-content focus-visible"
            onClick={closeMore}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {MORE_ITEMS.map(({ label, path, icon: Icon, isPrimary, isHash }) => {
            const active = isRouteActive(path, location.pathname);
            const content = (
              <>
                <div className={`w-12 h-12 rounded-md flex items-center justify-center mb-1 transition-colors duration-fast ${
                  active
                    ? 'bg-brand text-on-brand'
                    : isPrimary
                      ? 'bg-brand text-on-brand'
                      : 'bg-surface-muted text-content-muted group-hover:text-content group-hover:bg-surface'
                }`}>
                  <Icon size={24} strokeWidth={2} />
                </div>
                <span className={`text-xs font-semibold text-center transition-colors duration-fast ${
                  active || isPrimary ? 'text-brand' : 'text-content-muted group-hover:text-content'
                }`}>{label}</span>
              </>
            );

            if (isHash) {
              return (
                <a
                  key={label}
                  href={path}
                  onClick={closeMore}
                  className="flex flex-col items-center justify-center p-2 rounded-md border-none bg-transparent group focus-visible"
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
                className="flex flex-col items-center justify-center p-2 rounded-md border-none bg-transparent group focus-visible"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <nav className="fixed bottom-0 inset-x-0 h-16 bg-surface-raised border-t border-border z-40 lg:hidden" aria-label="Mobile navigation">
        <div className="flex w-full h-full max-w-[500px] mx-auto px-2 justify-around items-center pb-[env(safe-area-inset-bottom)]">
          {PRIMARY_TABS.map(({ id, label, path, icon: Icon }) => {
            const active = isRouteActive(path, location.pathname);
            return (
              <Link
                key={id}
                to={path}
                className={`flex-1 flex flex-col items-center justify-center h-full p-1 border-none bg-transparent active:scale-95 transition-transform duration-fast focus-visible group`}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                <span className={`mb-1 transition-colors duration-fast ${active ? 'text-brand' : 'text-content-secondary group-hover:text-content'}`}>
                  <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                </span>
                <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-fast ${active ? 'text-brand' : 'text-content-secondary group-hover:text-content'}`}>
                  {label}
                </span>
              </Link>
            );
          })}

          <button
            className={`flex-1 flex flex-col items-center justify-center h-full p-1 border-none bg-transparent active:scale-95 transition-transform duration-fast focus-visible group`}
            onClick={() => setMoreOpen(prev => !prev)}
            aria-label="More options"
            aria-expanded={moreOpen}
          >
            <span className={`mb-1 transition-colors duration-fast ${(moreActive || moreOpen) ? 'text-brand' : 'text-content-secondary group-hover:text-content'}`}>
              <MoreHorizontal size={24} strokeWidth={(moreActive || moreOpen) ? 2.5 : 2} />
            </span>
            <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-fast ${(moreActive || moreOpen) ? 'text-brand' : 'text-content-secondary group-hover:text-content'}`}>
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
