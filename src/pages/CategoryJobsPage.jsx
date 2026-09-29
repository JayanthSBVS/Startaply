import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Monitor, Briefcase, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JobCard from '../components/jobs/JobCard';
import JobDetailsPanel from '../components/jobs/JobDetailsPanel';
import { useJobs } from '../context/JobsContext';
import EmptyState from '../components/common/EmptyState';

// Category visual config
const categoryConfig = {
  'IT & Non-IT Jobs': {
    icon: Monitor, color: 'text-brand-hover', border: 'border-brand/20',
    bg: 'bg-brand-soft', glow: 'bg-brand',
    desc: 'Premium Software, Cloud, Engineering, and Tech roles.'
  },
  'Private Jobs': {
    icon: Briefcase, color: 'text-blue-500', border: 'border-blue-500/20',
    bg: 'bg-blue-500/10', glow: 'bg-blue-500',
    desc: 'Top tier corporate, banking, and enterprise private sector jobs.'
  },
  'Fresher Jobs': {
    icon: Monitor, color: 'text-indigo-500', border: 'border-indigo-500/20',
    bg: 'bg-indigo-500/10', glow: 'bg-indigo-500',
    desc: 'Early-career graduate roles, traineeships, and campus drives.'
  },
  'Gig & Services': {
    icon: Zap, color: 'text-sky-500', border: 'border-sky-500/20',
    bg: 'bg-sky-500/10', glow: 'bg-sky-500',
    desc: 'Flexible, high-impact contract roles and specialized service gigs.'
  }
};

const defaultTheme = {
  icon: Briefcase, color: 'text-brand', border: 'border-brand/20',
  bg: 'bg-brand-soft', glow: 'bg-brand',
  desc: 'Explore the latest verified opportunities in this category.'
};

// ── Horizontal scroll chip row (no wrapping on mobile) ────────────────────
const ChipRow = ({ children }) => (
  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar snap-x">
    {children}
  </div>
);

const Chip = ({ active, onClick, color = 'brand', children, count }) => {
  const activeColors = {
    brand: 'bg-brand text-on-brand border-transparent shadow-md shadow-brand/25',
    blue: 'bg-blue-600 text-white border-transparent shadow-md',
    indigo: 'bg-indigo-600 text-white border-transparent shadow-md',
  };
  const inactiveColors = 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand/40 dark:hover:border-brand/40';
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap snap-start shrink-0 active:scale-95 ${active ? (activeColors[color] || activeColors.brand) : inactiveColors}`}
      style={{ minHeight: '38px' }}
    >
      {children}
      {count !== undefined && (
        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
          {count}
        </span>
      )}
    </button>
  );
};

const isItJob = (j) => {
  const type = (j.jobCategoryType || '').toLowerCase();
  const cat = (j.category || j.jobCategory || '').toLowerCase();
  return (type === 'it' || type === 'it job' || cat.includes('it') || cat.includes('software') || cat.includes('tech')) && !type.includes('non') && !cat.includes('non-it');
};

const isNonItJob = (j) => {
  const type = (j.jobCategoryType || '').toLowerCase();
  const cat = (j.category || j.jobCategory || '').toLowerCase();
  return type.includes('non') || cat.includes('non-it') || cat.includes('ops') || cat.includes('bpo');
};

const CategoryJobsPage = () => {
  useEffect(() => {
    document.title = "Job Categories | Startaply";
  }, []);
  const { categoryName } = useParams();
  const { jobs } = useJobs();
  const decoded = decodeURIComponent(categoryName || '');
  const [selectedJob, setSelectedJob] = useState(null);

  // IT / Non-IT filter
  const [itType, setItType] = useState('All');

  const theme = categoryConfig[decoded] || defaultTheme;
  const IconComp = theme.icon;

  const isItNonItCategory = useMemo(() => {
    const dec = decoded.toLowerCase();
    return dec.includes('it') || dec.includes('tech') || dec.includes('software');
  }, [decoded]);

  const filtered = useMemo(() => {
    const dec = decoded.toLowerCase();
    return (jobs || []).filter(j => {
      const cat = (j.jobCategory || j.category || '').toLowerCase();
      const type = (j.jobCategoryType || '').toLowerCase();
      if (dec.includes('it') || dec.includes('tech')) {
        return cat.includes('it') || cat.includes('software') || cat.includes('tech') || type.includes('it') || type.includes('non');
      }
      if (dec.includes('private')) {
        return cat.includes('private') || cat.includes('corporate') || (!cat.includes('govt') && !cat.includes('mela') && !cat.includes('gig'));
      }
      if (dec.includes('gig')) {
        return cat.includes('gig') || cat.includes('service') || type.includes('gig');
      }
      if (dec.includes('fresher')) {
        return j.isFresh || (j.experience || '').toLowerCase().includes('fresher') || (j.experience || '').includes('0');
      }
      return cat === dec;
    });
  }, [jobs, decoded]);

  const itJobs = useMemo(() => filtered.filter(isItJob), [filtered]);
  const nonItJobs = useMemo(() => filtered.filter(isNonItJob), [filtered]);
  const otherJobs = useMemo(() => filtered.filter(j => !isItJob(j) && !isNonItJob(j)), [filtered]);

  const displayedJobs = useMemo(() => {
    if (!isItNonItCategory || itType === 'All') return filtered;
    if (itType === 'IT') return itJobs;
    if (itType === 'Non-IT') return nonItJobs;
    return filtered;
  }, [isItNonItCategory, itType, filtered, itJobs, nonItJobs]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans transition-colors duration-300">

      {/* HERO */}
      <div className="relative bg-black text-white pt-24 md:pt-32 pb-12 md:pb-20 text-center border-b border-neutral-850 px-4 overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-20 pointer-events-none ${theme.glow}`} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto relative z-10">
          <div className={`w-14 h-14 md:w-20 md:h-20 mx-auto rounded-[1.25rem] md:rounded-[1.5rem] flex items-center justify-center mb-4 md:mb-6 border ${theme.border} ${theme.bg}`}>
            <IconComp size={28} className={`md:hidden ${theme.color}`} />
            <IconComp size={36} className={`hidden md:block ${theme.color}`} />
          </div>
          <h1 className="text-2xl md:text-6xl font-black tracking-tight mb-2 md:mb-3">{decoded}</h1>
          <p className="text-sm md:text-lg text-slate-400 font-medium">{theme.desc}</p>

          {/* Quick stat pills - compact on mobile */}
          {isItNonItCategory && (
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold">{itJobs.length} IT Jobs</span>
              <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-bold">{nonItJobs.length} Non-IT Jobs</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-12 -mt-4 md:-mt-6 relative z-20">

        {/* CONTROL BAR */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 px-4 py-3 md:px-5 md:py-4 mb-6 md:mb-8 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 md:gap-5 min-w-0 overflow-hidden">
          
          {/* Back + Live count row */}
          <div className="flex items-center justify-between xl:contents shrink-0">
            <Link to="/" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors shrink-0" style={{ minHeight: '36px' }}>
              <ArrowLeft size={15} /> Back
            </Link>
            {/* Live count - visible on mobile too */}
            <div className="flex items-center gap-2 xl:order-last shrink-0">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme.glow}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${theme.glow}`} />
              </span>
              <p className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                {displayedJobs.length} Live
              </p>
            </div>
          </div>

          {/* IT / Non-IT Tabs - horizontal scroll on mobile */}
          {isItNonItCategory && (
            <ChipRow>
              {[
                { val: 'All', label: 'All', count: filtered.length },
                { val: 'IT', label: 'IT Jobs', count: itJobs.length },
                { val: 'Non-IT', label: 'Non-IT', count: nonItJobs.length },
              ].map(opt => (
                <Chip
                  key={opt.val}
                  active={itType === opt.val}
                  color="blue"
                  count={opt.count}
                  onClick={() => setItType(opt.val)}
                >
                  {opt.label}
                </Chip>
              ))}
            </ChipRow>
          )}
        </div>

        {/* JOB LISTINGS */}
        {filtered.length === 0 ? (
          <EmptyState
            title="No roles open currently"
            message="Check back soon! We are constantly partnering with companies to bring you the best opportunities."
            onReset={() => { setItType('All'); }}
            resetLabel="Clear Filters"
          />
        ) : isItNonItCategory && itType === 'All' ? (
          <div className="space-y-8 md:space-y-10">
            {itJobs.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4 md:mb-5">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                    <Monitor size={16} className="text-blue-400" />
                  </div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">IT & Tech Jobs</h2>
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-xs font-black">{itJobs.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {itJobs.map(job => (
                    <JobCard key={job.id} job={job} onViewDetails={setSelectedJob} />
                  ))}
                </div>
              </div>
            )}

            {nonItJobs.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4 md:mb-5">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                    <Briefcase size={16} className="text-purple-400" />
                  </div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">Non-IT Jobs</h2>
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full text-xs font-black">{nonItJobs.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {nonItJobs.map(job => (
                    <JobCard key={job.id} job={job} onViewDetails={setSelectedJob} />
                  ))}
                </div>
              </div>
            )}

            {otherJobs.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4 md:mb-5">
                  <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">Other Openings</h2>
                  <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2.5 py-0.5 rounded-full text-xs font-black">{otherJobs.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {otherJobs.map(job => (
                    <JobCard key={job.id} job={job} onViewDetails={setSelectedJob} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {displayedJobs.map(job => (
                <motion.div key={job.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <JobCard job={job} onViewDetails={setSelectedJob} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <JobDetailsPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
};

export default CategoryJobsPage;
