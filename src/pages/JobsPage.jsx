import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Search, Briefcase, Building2, Monitor, GraduationCap,
  Star, Zap, Filter, X, ChevronDown
} from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import JobCard from '../components/jobs/JobCard';
import JobDetailsPanel from '../components/jobs/JobDetailsPanel';
import axios from 'axios';

// ─── Section definitions ───────────────────────────────────────────────────
const SECTIONS = [
  { id: 'all',        label: 'All Jobs',        icon: Briefcase,     color: 'emerald',  desc: 'Every live opening' },
  { id: 'government', label: 'Government Jobs',  icon: Building2,     color: 'amber',    desc: 'Central & State Govt' },
  { id: 'it',         label: 'IT Jobs',          icon: Monitor,       color: 'blue',     desc: 'Developers, QA, Data' },
  { id: 'nonit',      label: 'Non-IT Jobs',      icon: Briefcase,     color: 'purple',   desc: 'BPO, Sales, HR, Ops' },
  { id: 'freshers',   label: 'Freshers',         icon: GraduationCap, color: 'teal',     desc: '0-1 years experience' },
  { id: 'featured',   label: 'Featured',         icon: Star,          color: 'rose',     desc: 'Hand-picked top roles' },
  { id: 'today',      label: "Today's Jobs",     icon: Zap,           color: 'orange',   desc: 'Posted within 24h' },
];

const colorMap = {
  emerald: { pill: 'bg-emerald-600 text-white shadow-emerald-600/20',  idle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  amber:   { pill: 'bg-amber-600 text-white shadow-amber-600/20',      idle: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',         dot: 'bg-amber-500',   iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  blue:    { pill: 'bg-blue-600 text-white shadow-blue-600/20',        idle: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',             dot: 'bg-blue-500',    iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  purple:  { pill: 'bg-purple-600 text-white shadow-purple-600/20',    idle: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',     dot: 'bg-purple-500',  iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  teal:    { pill: 'bg-teal-600 text-white shadow-teal-600/20',        idle: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',             dot: 'bg-teal-500',    iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
  rose:    { pill: 'bg-rose-600 text-white shadow-rose-600/20',        idle: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',             dot: 'bg-rose-500',    iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  orange:  { pill: 'bg-orange-600 text-white shadow-orange-600/20',    idle: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',     dot: 'bg-orange-500',  iconBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
};

// ─── Derive initial section from URL params ────────────────────────────────
function getInitialSection(searchParams) {
  if (searchParams.get('fresh') === 'true') return 'freshers';
  if (searchParams.get('featured') === 'true') return 'featured';
  if (searchParams.get('section')) return searchParams.get('section');
  const cat = searchParams.get('category') || '';
  if (cat === 'Government Jobs') return 'government';
  if (cat === 'IT & Non-IT Jobs') return 'it';
  return 'all';
}

// ─── Debounce hook ─────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const JobsPage = () => {
  const [searchParams] = useSearchParams();

  const [search, setSearch]             = useState(searchParams.get('company') || '');
  const [activeSection, setActiveSection] = useState(() => getInitialSection(searchParams));
  const [govtFilter, setGovtFilter]     = useState('All');
  const [workMode, setWorkMode]         = useState('All');
  const [selectedJob, setSelectedJob]   = useState(null);

  // Server-fetch state
  const [localJobs, setLocalJobs] = useState([]);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [hasMore, setHasMore]     = useState(true);
  const [failed, setFailed]       = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  // Sync when URL params change (section only — not search, which is client-side)
  useEffect(() => {
    setActiveSection(getInitialSection(searchParams));
    setSearch(searchParams.get('company') || '');
  }, [searchParams]);

  // ─── CRITICAL FIX: Reset the job list on server-side filter change ─────────
  useEffect(() => {
    setPage(1);
    setLocalJobs([]);
    setHasMore(true);
  }, [activeSection, govtFilter, debouncedSearch]);

  // ─── Server fetch effect ───────────────────────────────────────────────
  useEffect(() => {
    let isCancelled = false;
    const fetchJobs = async () => {
      if (!hasMore) return;
      setLoading(true);
      setFailed(false);
      try {
        const routeMap = {
          'all':        '/api/jobs',
          'government': '/api/jobs/government',
          'it':         '/api/jobs/it',
          'nonit':      '/api/jobs/non-it',
          'freshers':   '/api/jobs/freshers',
          'today':      '/api/jobs/today',
          'featured':   '/api/jobs/featured',
        };
        const endpoint = routeMap[activeSection] || '/api/jobs';

        let queryParams = `?page=${page}&limit=20`;
        if (activeSection === 'government' && govtFilter !== 'All') {
          queryParams += `&govtFilter=${govtFilter}`;
        }
        if (debouncedSearch) {
          queryParams += `&search=${encodeURIComponent(debouncedSearch)}`;
        }

        const res = await axios.get(`${endpoint}${queryParams}`);
        if (!isCancelled) {
          const newJobs = res.data || [];
          if (newJobs.length < 20) setHasMore(false);
          setLocalJobs(prev => page === 1 ? newJobs : [...prev, ...newJobs]);
        }
      } catch (err) {
        if (!isCancelled) setFailed(true);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    fetchJobs();
    return () => { isCancelled = true; };
  }, [activeSection, govtFilter, debouncedSearch, page]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Client-side filter (workMode) ────────────────────────────
  const filtered = useMemo(() => {
    return localJobs.filter(job => {
      const modeMatch = workMode === 'All' || (job.workMode || job.mode) === workMode;
      return modeMatch;
    });
  }, [localJobs, workMode]);

  const activeConfig = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];
  const colors       = colorMap[activeConfig.color];
  const IconComp     = activeConfig.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />

      {/* ── HERO SEARCH ────────────────────────────────────────── */}
      <div className="bg-slate-950 pt-28 pb-16 px-4 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-slate-950 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">
            Discover Your Next <span className="text-emerald-400">Opportunity</span>
          </h1>
          <p className="text-slate-400 mb-8 text-lg font-medium">Browse verified openings across India</p>

          <div className="max-w-2xl mx-auto flex bg-white/10 border border-white/20 p-1.5 rounded-[2rem] backdrop-blur-xl focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all shadow-2xl">
            <div className="flex-1 flex items-center pl-5">
              <Search size={20} className="text-emerald-400 shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search job title, company or keyword..."
                autoComplete="off"
                spellCheck="false"
                className="w-full bg-transparent px-4 py-3.5 text-white placeholder-slate-400 outline-none font-medium text-base"
              />
              {search && (
                <button onClick={() => setSearch('')} className="p-1.5 mr-2 text-slate-400 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-3.5 rounded-[1.5rem] font-bold transition-colors shadow-sm text-sm">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION TABS ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[65px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1.5 overflow-x-auto py-3.5 no-scrollbar">
            {SECTIONS.map(sec => {
              const Ic = sec.icon;
              const secColors = colorMap[sec.color];
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => { setActiveSection(sec.id); setGovtFilter('All'); }}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 ${
                    isActive
                      ? `${secColors.pill} shadow-md border-transparent`
                      : `bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600`
                  }`}
                >
                  <Ic size={15} />
                  {sec.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* ── GOVT SUB-FILTER ─────────────────────────────────────── */}
        <AnimatePresence>
          {activeSection === 'government' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 flex flex-wrap items-center gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mr-2">Filter:</span>
                {['All', 'Central', 'State'].map(f => (
                  <button
                    key={f}
                    onClick={() => setGovtFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-black border transition-all ${
                      govtFilter === f
                        ? 'bg-amber-600 text-white border-transparent shadow-md'
                        : 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                    }`}
                  >
                    {f === 'All' ? 'All Govt Jobs' : `${f} Government`}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MODE FILTER ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 px-1">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${colors.iconBg}`}>
                <IconComp size={16} />
              </span>
              {activeConfig.label}
              <span className={`text-sm font-black px-3 py-1 rounded-full ${colors.idle} border`}>
                {localJobs.length}{hasMore ? '+' : ''} Results
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 pl-11 font-medium">{activeConfig.desc}</p>
          </div>

          <div className="flex gap-2 shrink-0">
            {['All', 'On-site', 'Remote', 'Hybrid'].map(m => (
              <button
                key={m}
                onClick={() => setWorkMode(m)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all ${
                  workMode === m
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent'
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

        {/* ── RESULTS ─────────────────────────────────────────────── */}
        {loading && localJobs.length === 0 ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-slate-800">
              <Search size={30} className="text-slate-300 dark:text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No jobs match your criteria</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
              {search ? `No results for "${search}" in ${activeConfig.label}` : `No ${activeConfig.label} available right now`}
            </p>
            <button
              onClick={() => { setSearch(''); setActiveSection('all'); setGovtFilter('All'); setWorkMode('All'); }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3.5 rounded-full shadow-lg transition-all"
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <JobCard job={job} onViewDetails={setSelectedJob} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── PAGINATION ─────────────────────────────────────────────── */}
        {hasMore && !loading && localJobs.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setPage(p => p + 1)}
              className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold py-3 px-8 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
            >
              Load More {activeConfig.label}
            </button>
          </div>
        )}
        {loading && localJobs.length > 0 && (
          <div className="mt-8 text-center text-emerald-500 font-bold flex justify-center uppercase tracking-widest text-sm items-center gap-2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            Loading...
          </div>
        )}
      </div>

      <Footer />
      <JobDetailsPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
};

export default JobsPage;