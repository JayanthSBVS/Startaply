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
  MessageSquare,
  MoreHorizontal,
  X,
  Search,
} from 'lucide-react';

/* ─── Routes where the bottom nav should NOT appear ─────────────────────── */
const HIDDEN_ROUTES = ['/admin', '/admin-login', '/admin/dashboard'];

/* ─── Primary tabs (always visible) ─────────────────────────────────────── */
const PRIMARY_TABS = [
  { id: 'home',    label: 'Home',        path: '/',                               icon: Home },
  { id: 'it',      label: 'IT Jobs',     path: '/category/IT%20%26%20Non-IT%20Jobs', icon: GraduationCap },
  { id: 'govt',    label: 'Govt Jobs',   path: '/category/Government%20Jobs',     icon: Building2 },
];

/* ─── More sheet links ───────────────────────────────────────────────────── */
const MORE_ITEMS = [
  { label: 'Browse Jobs', path: '/jobs',        icon: Search,        isPrimary: true },
  { label: 'Companies',   path: '/companies',   icon: Users },
  { label: 'Job Melas',   path: '/job-melas',   icon: PartyPopper },
  { label: 'Preparation', path: '/preparation', icon: BookOpen },
  { label: 'About Us',    path: '/about',       icon: Info },
  { label: 'Feedback',    path: '/#feedback',   icon: MessageSquare, isHash: true },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const isRouteActive = (path, pathname) => {
  // Hash-anchor links (e.g. /#feedback) must never be marked active
  if (path.includes('#')) return false;
  const current = decodeURIComponent(pathname);
  const target  = decodeURIComponent(path.split('?')[0]);
  if (target === '/') return current === '/';
  return current === target || current.startsWith(target);
};

const isMoreActive = (pathname) =>
  MORE_ITEMS.some(({ path }) => isRouteActive(path, pathname));

/* ═══════════════════════════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════════════════════════ */
const MobileBottomNav = () => {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [pressing, setPressing] = useState(null); // id of tab being pressed

  /* Hide on admin/internal routes */
  const hidden = HIDDEN_ROUTES.some(r => location.pathname.startsWith(r));

  /* Inject body padding so page content never hides behind the bar */
  useEffect(() => {
    if (hidden) return;
    document.body.classList.add('has-mobile-nav');
    return () => document.body.classList.remove('has-mobile-nav');
  }, [hidden]);

  /* Close More sheet on route change */
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  /* Close More sheet on backdrop click / Escape */
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
      {/* ── More Sheet Backdrop ────────────────────────────────────────── */}
      {moreOpen && (
        <div
          className="mobile-nav-backdrop lg:hidden"
          onClick={closeMore}
          aria-hidden="true"
        />
      )}

      {/* ── More Sheet ────────────────────────────────────────────────── */}
      <div
        className={`mobile-nav-sheet lg:hidden ${moreOpen ? 'mobile-nav-sheet--open' : ''}`}
        role="dialog"
        aria-label="More navigation options"
        aria-modal="true"
      >
        {/* Sheet header */}
        <div className="mobile-nav-sheet__header">
          <span className="mobile-nav-sheet__title">More</span>
          <button
            className="mobile-nav-sheet__close"
            onClick={closeMore}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sheet grid */}
        <div className="mobile-nav-sheet__grid">
          {MORE_ITEMS.map(({ label, path, icon: Icon, isPrimary, isHash }) => {
            const active = isRouteActive(path, location.pathname);
            const content = (
              <>
                <div className={`mobile-nav-sheet__item-icon ${active ? 'mobile-nav-sheet__item-icon--active' : ''} ${isPrimary ? 'mobile-nav-sheet__item-icon--primary' : ''}`}>
                  <Icon size={isPrimary ? 24 : 22} strokeWidth={isPrimary ? 2.5 : 2} />
                </div>
                <span className={`mobile-nav-sheet__item-label ${isPrimary ? 'mobile-nav-sheet__item-label--primary' : ''}`}>{label}</span>
              </>
            );

            if (isHash) {
              return (
                <a
                  key={label}
                  href={path}
                  onClick={closeMore}
                  className={`mobile-nav-sheet__item ${isPrimary ? 'mobile-nav-sheet__item--primary' : ''}`}
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
                className={`mobile-nav-sheet__item ${active ? 'mobile-nav-sheet__item--active' : ''} ${isPrimary ? 'mobile-nav-sheet__item--primary' : ''}`}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Bar ────────────────────────────────────────────────── */}
      <nav className="mobile-bottom-nav lg:hidden" aria-label="Mobile navigation">
        <div className="mobile-bottom-nav__inner">

          {/* Primary tabs */}
          {PRIMARY_TABS.map(({ id, label, path, icon: Icon }) => {
            const active = isRouteActive(path, location.pathname);
            return (
              <Link
                key={id}
                to={path}
                className={`mobile-bottom-nav__tab ${active ? 'mobile-bottom-nav__tab--active' : ''} ${pressing === id ? 'mobile-bottom-nav__tab--pressing' : ''}`}
                onPointerDown={() => setPressing(id)}
                onPointerUp={() => setPressing(null)}
                onPointerLeave={() => setPressing(null)}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                {active && <span className="mobile-bottom-nav__pill" />}
                <span className={`mobile-bottom-nav__icon ${active ? 'mobile-bottom-nav__icon--active' : ''}`}>
                  <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                </span>
                <span className={`mobile-bottom-nav__label ${active ? 'mobile-bottom-nav__label--active' : ''}`}>
                  {label}
                </span>
              </Link>
            );
          })}

          {/* More tab */}
          <button
            className={`mobile-bottom-nav__tab ${moreActive || moreOpen ? 'mobile-bottom-nav__tab--active' : ''} ${pressing === 'more' ? 'mobile-bottom-nav__tab--pressing' : ''}`}
            onClick={() => setMoreOpen(prev => !prev)}
            onPointerDown={() => setPressing('more')}
            onPointerUp={() => setPressing(null)}
            onPointerLeave={() => setPressing(null)}
            aria-label="More options"
            aria-expanded={moreOpen}
          >
            {(moreActive || moreOpen) && <span className="mobile-bottom-nav__pill" />}
            <span className={`mobile-bottom-nav__icon ${moreActive || moreOpen ? 'mobile-bottom-nav__icon--active' : ''}`}>
              <MoreHorizontal size={22} strokeWidth={moreActive || moreOpen ? 2.2 : 1.8} />
            </span>
            <span className={`mobile-bottom-nav__label ${moreActive || moreOpen ? 'mobile-bottom-nav__label--active' : ''}`}>
              More
            </span>
          </button>

        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
