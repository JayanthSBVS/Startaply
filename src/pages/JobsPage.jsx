import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Search, Briefcase, Building2, Monitor, GraduationCap,
  Star, Zap, X
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import JobCard from '../components/jobs/JobCard';
import JobDetailsPanel from '../components/jobs/JobDetailsPanel';
import { subscribeToFreshness } from '../utils/dataFreshness';
import axios from 'axios';

// ─── Section definitions ───────────────────────────────────────────────────
const SECTIONS = [
  { id: 'all',        label: 'All Jobs',        icon: Briefcase,     color: 'brand',    desc: 'Every live opening across India' },
  { id: 'it',         label: 'IT & Software',   icon: Monitor,       color: 'blue',     desc: 'Developers, QA, Cloud, Data & AI' },
  { id: 'nonit',      label: 'Non-IT & Ops',    icon: Briefcase,     color: 'purple',   desc: 'BPO, Sales, HR, Operations, Banking' },
  { id: 'gig',        label: 'Gig & Freelance', icon: Zap,           color: 'orange',   desc: 'Contract, remote & flexible gigs' },
  { id: 'freshers',   label: 'Freshers (0-1y)', icon: GraduationCap, color: 'teal',     desc: 'Entry level & 0-1 years experience' },
  { id: 'featured',   label: 'Featured Roles',  icon: Star,          color: 'rose',     desc: 'Hand-picked top verified roles' },
  { id: 'today',      label: "Today's Jobs",    icon: Zap,           color: 'amber',    desc: 'Posted within the last 24 hours' },
];

const colorMap = {
  brand:   { pill: 'bg-brand text-on-brand shadow-brand/25',          idle: 'bg-brand-soft text-brand dark:text-brand-hover border-brand/20', dot: 'bg-brand',     iconBg: 'bg-brand-soft text-brand dark:text-brand-hover' },
  amber:   { pill: 'bg-amber-600 text-white shadow-amber-600/20',     idle: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',         dot: 'bg-amber-500',   iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  blue:    { pill: 'bg-blue-600 text-white shadow-blue-600/20',       idle: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',             dot: 'bg-blue-500',    iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  purple:  { pill: 'bg-indigo-600 text-white shadow-indigo-600/20',   idle: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',     dot: 'bg-indigo-500',  iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  teal:    { pill: 'bg-teal-600 text-white shadow-teal-600/20',       idle: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',             dot: 'bg-teal-500',    iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
  rose:    { pill: 'bg-rose-600 text-white shadow-rose-600/20',       idle: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',             dot: 'bg-rose-500',    iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  orange:  { pill: 'bg-orange-600 text-white shadow-orange-600/20',   idle: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',     dot: 'bg-orange-500',  iconBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
};

// ─── Derive initial state from URL ─────────────────────────────────────────
function getInitialState(searchParams) {
  const section = searchParams.get('section') || 'all';
  const search = searchParams.get('search') || searchParams.get('company') || searchParams.get('q') || '';
  const workMode = searchParams.get('workMode') || 'All';
  return { section, search, workMode };
}

const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Use a ref to track if we've initialized to avoid re-syncing on every render
  const [init] = useState(() => getInitialState(searchParams));

  const [search, setSearch]             = useState(init.search);
  const [activeSection, setActiveSection] = useState(init.section);
  const [workMode, setWorkMode]         = useState(init.workMode);
  const [selectedJob, setSelectedJob]   = useState(null);

  const [localJobs, setLocalJobs] = useState([]);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [hasMore, setHasMore]     = useState(true);
  const [failed, setFailed]       = useState(false);
  const [jobsUpdateAvailable, setJobsUpdateAvailable] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [manualRefreshSuccessToken, setManualRefreshSuccessToken] = useState(0);

  const resultsHeadingRef = useRef(null);
  const isManualRef = useRef(false);

  const requestSequenceRef = useRef(0);
  const pageRef = useRef(page);

  // Sync page ref
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const [debouncedSearch, setDebouncedSearch] = useState(init.search);

  // Cross-tab freshness and focus/reconnect listeners
  useEffect(() => {
    const triggerRefresh = () => {
      if (pageRef.current > 1) {
        setJobsUpdateAvailable(true);
      } else {
        setRefreshCounter(c => c + 1);
      }
    };

    const unsubscribe = subscribeToFreshness('jobs', triggerRefresh);
    window.addEventListener('focus', triggerRefresh);
    window.addEventListener('online', triggerRefresh);
    return () => {
      unsubscribe();
      window.removeEventListener('focus', triggerRefresh);
      window.removeEventListener('online', triggerRefresh);
    };
  }, []);

  // Deterministic post-render focus for manual refresh success
  useEffect(() => {
    if (manualRefreshSuccessToken > 0) {
      if (resultsHeadingRef.current) {
        try {
          resultsHeadingRef.current.focus({ preventScroll: true });
        } catch (e) {
          resultsHeadingRef.current.focus();
        }
      }
    }
  }, [manualRefreshSuccessToken]);

  useEffect(() => {
    document.title = "Search Jobs | Startaply";
  }, []);

  // Sync typing search with state after a snappy 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync state from URL search params when they change externally
  useEffect(() => {
    const state = getInitialState(searchParams);
    if (state.search !== search) {
      setSearch(state.search);
      setDebouncedSearch(state.search);
    }
    if (state.section !== activeSection) {
      setActiveSection(state.section);
    }
    if (state.workMode !== workMode) {
      setWorkMode(state.workMode);
    }
  }, [searchParams]);

  // Sync URL params when state changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams); // Preserve existing params
    
    // Update our specific params
    if (activeSection !== 'all') newParams.set('section', activeSection);
    else newParams.delete('section');

    if (debouncedSearch)         newParams.set('search', debouncedSearch);
    else newParams.delete('search');

    if (workMode !== 'All')      newParams.set('workMode', workMode);
    else newParams.delete('workMode');

    // Clean up old legacy params if they exist
    newParams.delete('govtFilter');
    newParams.delete('company');
    newParams.delete('q');
    newParams.delete('category');
    
    setSearchParams(newParams, { replace: true });
  }, [activeSection, debouncedSearch, workMode, setSearchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle immediate search trigger on form submission (Enter or Search Button click)
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setDebouncedSearch(search);
  };

  const handleManualRefresh = useCallback(() => {
    isManualRef.current = true;
    setIsManualRefreshing(true);
    setStatusMessage('Refreshing job listings.');
    setPage(1);
    setRefreshCounter(c => c + 1);
  }, []);

  // Reset list when filters change (but NOT on refreshCounter)
  useEffect(() => {
    setPage(1);
    setLocalJobs([]);
    setHasMore(true);
    setJobsUpdateAvailable(false);
  }, [activeSection, debouncedSearch]);

  // Server fetch effect
  useEffect(() => {
    const currentSequence = ++requestSequenceRef.current;
    const abortController = new AbortController();

    const fetchJobs = async () => {
      if (!hasMore && page > 1) return;
      if (page === 1 && localJobs.length === 0) {
        setLoading(true);
      }
      setFailed(false);
      try {
        const routeMap = {
          'all':        '/api/jobs',
          'it':         '/api/jobs/it',
          'nonit':      '/api/jobs/non-it',
          'gig':        '/api/jobs/gig',
          'freshers':   '/api/jobs/freshers',
          'today':      '/api/jobs/today',
          'featured':   '/api/jobs/featured',
        };
        const endpoint = routeMap[activeSection] || '/api/jobs';
        let queryParams = `?page=${page}&limit=20`;

        if (debouncedSearch) {
          queryParams += `&search=${encodeURIComponent(debouncedSearch)}`;
        }

        const res = await axios.get(`${endpoint}${queryParams}`, {
          signal: abortController.signal
        });

        if (!abortController.signal.aborted && requestSequenceRef.current === currentSequence) {
          const newJobs = Array.isArray(res.data) ? res.data : [];
          if (page === 1) {
            setHasMore(newJobs.length >= 20);
          } else {
            if (newJobs.length < 20) setHasMore(false);
          }

          setLocalJobs(prev => {
            if (page === 1) return newJobs;
            // Prevent duplicates when appending
            const existingIds = new Set(prev.map(j => j.id));
            const uniqueNew = newJobs.filter(j => !existingIds.has(j.id));
            return [...prev, ...uniqueNew];
          });
          setJobsUpdateAvailable(false);

          if (isManualRef.current) {
            isManualRef.current = false;
            setIsManualRefreshing(false);
            setStatusMessage(`Job listings refreshed. Showing ${newJobs.length} results.`);
            setManualRefreshSuccessToken(t => t + 1);
          }
        }
      } catch (err) {
        if (!axios.isCancel(err) && !abortController.signal.aborted && requestSequenceRef.current === currentSequence) {
          setFailed(true);
          if (isManualRef.current) {
            isManualRef.current = false;
            setIsManualRefreshing(false);
            setStatusMessage('Job listings could not be refreshed. Previously loaded results are still shown.');
          }
        }
      } finally {
        if (requestSequenceRef.current === currentSequence) {
          setLoading(false);
        }
      }
    };
    fetchJobs();
    return () => {
      if (requestSequenceRef.current === currentSequence) {
        requestSequenceRef.current++;
      }
      abortController.abort();
    };
  }, [activeSection, debouncedSearch, page, refreshCounter]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    return localJobs.filter(job => {
      const modeMatch = workMode === 'All' || (job.workMode || job.mode) === workMode;
      return modeMatch;
    });
  }, [localJobs, workMode]);

  const activeConfig = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];
  const colors       = colorMap[activeConfig.color];
  const IconComp     = activeConfig.icon;

  const handleClearFilters = () => {
    setSearch('');
    setActiveSection('all');
    setWorkMode('All');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f14] font-sans text-slate-900 dark:text-white transition-colors duration-300">

      {/* ── HERO SEARCH ────────────────────────────────────────── */}
      <div className="bg-slate-950 pt-20 sm:pt-28 pb-10 sm:pb-16 px-4 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-slate-950 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight mb-2 sm:mb-4 text-white">
            Discover Your Next <span className="text-brand-hover">Opportunity</span>
          </h1>
          <p className="text-slate-400 mb-6 sm:mb-8 text-xs sm:text-base md:text-lg font-medium">Browse verified openings across India</p>

          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex bg-white/10 border border-white/20 p-1 sm:p-1.5 rounded-2xl sm:rounded-[2rem] backdrop-blur-xl focus-within:ring-2 focus-within:ring-brand/50 transition-all shadow-2xl">
            <div className="flex-1 flex items-center pl-3 sm:pl-5 min-w-0">
              <Search size={18} className="text-brand-hover shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search job title, company..."
                autoComplete="off"
                spellCheck="false"
                className="w-full bg-transparent px-2.5 sm:px-4 py-2.5 sm:py-3.5 text-white placeholder-slate-400 outline-none font-medium text-xs sm:text-base min-w-0"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="p-1.5 mr-1 text-slate-400 hover:text-white transition-colors" aria-label="Clear search">
                  <X size={16} />
                </button>
              )}
            </div>
            <button type="submit" className="bg-brand hover:bg-brand-hover active:scale-95 text-on-brand px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-xl sm:rounded-[1.5rem] font-bold transition-all shadow-sm text-xs sm:text-sm shrink-0 min-h-[40px]">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* ── SECTION TABS ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-14 md:top-16 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
            {SECTIONS.map(sec => {
              const Ic = sec.icon;
              const secColors = colorMap[sec.color];
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => { setActiveSection(sec.id); }}
                  className={`shrink-0 flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition-all duration-150 min-h-[40px] active:scale-95 ${
                    isActive
                      ? `${secColors.pill} shadow-md border-transparent`
                      : `bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600`
                  }`}
                >
                  <Ic size={14} />
                  {sec.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">

        {/* ── MODE FILTER ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-1">
          <div>
            <h2
              ref={resultsHeadingRef}
              tabIndex={-1}
              className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 sm:gap-3 outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
            >
              <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center ${colors.iconBg}`}>
                <IconComp size={15} />
              </span>
              {activeConfig.label}
              <span className={`text-xs sm:text-sm font-black px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full ${colors.idle} border`}>
                {localJobs.length}{hasMore ? '+' : ''} Results
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 pl-9 sm:pl-11 font-medium">{activeConfig.desc}</p>
          </div>

          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            {['All', 'On-site', 'Remote', 'Hybrid'].map(m => (
              <button
                key={m}
                onClick={() => setWorkMode(m)}
                className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap min-h-[38px] active:scale-95 ${
                  workMode === m
                    ? 'bg-brand text-on-brand border-transparent shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* ── FAILSAFE ALERT ────────────────────────────────────────── */}
        {failed && localJobs.length === 0 && (
          <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-800 text-sm font-medium text-center">
            Live data temporarily unavailable. Please try again later.
          </div>
        )}

        {/* ── NON-BLOCKING ERROR (WITH EXISTING JOBS) ────────────────── */}
        {failed && localJobs.length > 0 && (
          <div role="alert" className="mb-8 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800/40 flex flex-col sm:flex-row justify-between items-center shadow-sm gap-4">
            <span className="text-sm font-medium">We couldn’t refresh job listings. Previously loaded results are still shown.</span>
            <button
              onClick={handleManualRefresh}
              disabled={isManualRefreshing}
              className="px-4 py-2 min-h-[44px] bg-rose-100 hover:bg-rose-200 dark:bg-rose-800 dark:hover:bg-rose-700 text-rose-800 dark:text-rose-100 text-sm font-bold rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50"
            >
              {isManualRefreshing ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        )}

        {/* ── UPDATE AVAILABLE ALERT ────────────────────────────────── */}
        {jobsUpdateAvailable && (
          <div
            className="mb-8 p-4 bg-brand-soft text-brand dark:text-brand-hover rounded-xl border border-brand/20 flex justify-between items-center shadow-sm"
          >
            <span className="text-sm font-bold">Listings have changed</span>
            <button
              onClick={() => {
                handleManualRefresh();
              }}
              disabled={isManualRefreshing}
              className="px-4 py-2 min-h-[44px] bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50"
              aria-label="Refresh job results"
            >
              {isManualRefreshing ? 'Refreshing...' : 'Refresh results'}
            </button>
          </div>
        )}

        {/* ── ARIA LIVE STATUS ── */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {statusMessage}
        </div>

        {/* ── RESULTS ─────────────────────────────────────────────── */}
        {loading && localJobs.length === 0 ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="w-20 h-20 bg-slate-50 dark:bg-[#0b0f14] rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-slate-800">
              <Search size={30} className="text-slate-300 dark:text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No jobs match your criteria</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
              {search ? `No results for "${search}" in ${activeConfig.label}` : `No ${activeConfig.label} available right now`}
            </p>
            <button
              onClick={handleClearFilters}
              className="bg-brand hover:bg-brand-hover text-on-brand font-bold px-8 py-3.5 rounded-full shadow-lg transition-all"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map(job => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <JobCard job={job} onViewDetails={() => setSelectedJob(job)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── LOAD MORE ───────────────────────────────────────────── */}
        {hasMore && localJobs.length > 0 && !loading && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setPage(p => p + 1)}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-8 py-3 rounded-full font-bold shadow-sm border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 min-h-[44px]"
            >
              Load More
            </button>
          </div>
        )}
        {loading && localJobs.length > 0 && (
          <div className="mt-12 flex justify-center py-4">
            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* ── DETAILS PANEL ───────────────────────────────────────── */}
      <AnimatePresence>
        {selectedJob && (
          <JobDetailsPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobsPage;
