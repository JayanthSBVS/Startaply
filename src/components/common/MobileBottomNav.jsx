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
  Send,
  Check,
  Star,
} from 'lucide-react';
import { useJobs } from '../../context/JobsContext';

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
  { label: 'Feedback',    icon: MessageSquare, isModal: true },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const isRouteActive = (path, pathname) => {
  if (!path) return false; // Safety check for modals
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
  const { addFeedback } = useJobs();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [pressing, setPressing] = useState(null); // id of tab being pressed
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '', rating: 5 });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus('submitting');
    try {
      await addFeedback(form);
      setStatus('success');
      setForm({ name: '', email: '', message: '', rating: 5 });
      setTimeout(() => {
        setStatus('idle');
        setFeedbackOpen(false);
      }, 2500);
    } catch (err) {
      setStatus('error');
    }
  };

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
          {MORE_ITEMS.map(({ label, path, icon: Icon, isPrimary, isHash, isModal }) => {
            const active = isRouteActive(path, location.pathname);
            const content = (
              <>
                <div className={`mobile-nav-sheet__item-icon ${active ? 'mobile-nav-sheet__item-icon--active' : ''} ${isPrimary ? 'mobile-nav-sheet__item-icon--primary' : ''}`}>
                  <Icon size={isPrimary ? 24 : 22} strokeWidth={isPrimary ? 2.5 : 2} />
                </div>
                <span className={`mobile-nav-sheet__item-label ${isPrimary ? 'mobile-nav-sheet__item-label--primary' : ''}`}>{label}</span>
              </>
            );

            if (isModal) {
              return (
                <button
                  key={label}
                  onClick={() => {
                    closeMore();
                    setFeedbackOpen(true);
                  }}
                  className={`mobile-nav-sheet__item ${isPrimary ? 'mobile-nav-sheet__item--primary' : ''} w-full cursor-pointer focus:outline-none`}
                >
                  {content}
                </button>
              );
            }

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

      {/* Embedded Feedback Modal for seamless non-navigating mobile feedback */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden relative border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="absolute top-4 right-4">
              <button
                type="button"
                onClick={() => setFeedbackOpen(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors p-2 rounded-full"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-800 rounded-2xl mb-3 text-emerald-600 dark:text-emerald-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Your Feedback</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium text-center">Help us build a better platform for you.</p>
              </div>

              <form onSubmit={handleSubmit} className="text-left space-y-4">
                {status === 'success' && (
                  <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold shadow-inner">
                    <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0">
                      <Check size={12} />
                    </div>
                    <span>Thank you! Your feedback has been sent.</span>
                  </div>
                )}
                {status === 'error' && (
                  <div className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800/60 text-xs font-bold">
                    Failed to submit feedback. Please try again.
                  </div>
                )}

                <div>
                  <label htmlFor="modal-name" className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Your Name
                  </label>
                  <input
                    id="modal-name"
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-sm text-slate-900 dark:text-white"
                    placeholder="e.g. Rahul Kumar"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="modal-email" className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="modal-email"
                    type="email"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-sm text-slate-900 dark:text-white"
                    placeholder="e.g. rahul@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Rating
                  </label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm({ ...form, rating: star })}
                        className="p-0.5 active:scale-125 transition-transform"
                      >
                        <Star
                          size={22}
                          className={
                            star <= form.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="modal-message" className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Your Message
                  </label>
                  <textarea
                    id="modal-message"
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none font-medium text-sm text-slate-900 dark:text-white"
                    placeholder="Tell us what you think..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold py-3.5 mt-2 rounded-full transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 text-sm"
                >
                  {status === 'submitting' ? 'Submitting...' : <><Send size={16} /> Send Feedback</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;
