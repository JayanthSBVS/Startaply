import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Monitor, Building2, Briefcase, Zap, ChevronDown, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JobCard from '../components/jobs/JobCard';
import JobDetailsPanel from '../components/jobs/JobDetailsPanel';
import { useJobs } from '../context/JobsContext';
import EmptyState from '../components/common/EmptyState';

// Category visual config
const categoryConfig = {
  'IT & Non-IT Jobs': {
    icon: Monitor, color: 'text-blue-400', border: 'border-blue-500/20',
    bg: 'bg-blue-500/10', glow: 'bg-blue-500',
    desc: 'Premium Software, Design, BPO, and Corporate roles.'
  },
  'Government Jobs': {
    icon: Building2, color: 'text-amber-400', border: 'border-amber-500/20',
    bg: 'bg-amber-500/10', glow: 'bg-amber-500',
    desc: 'Secure Central and State Government opportunities.'
  },
  'Private Jobs': {
    icon: Briefcase, color: 'text-purple-400', border: 'border-purple-500/20',
    bg: 'bg-purple-500/10', glow: 'bg-purple-500',
    desc: 'Top tier private sector and enterprise jobs.'
  },
  'Gig & Services': {
    icon: Zap, color: 'text-emerald-400', border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/10', glow: 'bg-emerald-500',
    desc: 'Flexible, on-demand roles and high-paying service gigs.'
  }
};

const defaultTheme = {
  icon: Briefcase, color: 'text-emerald-400', border: 'border-emerald-500/20',
  bg: 'bg-emerald-500/10', glow: 'bg-emerald-500',
  desc: 'Explore the latest verified opportunities in this category.'
};

const GOVT_DEPARTMENTS = [
  { label: 'All', keywords: [] },
  { label: 'Teaching', keywords: ['teacher', 'professor', 'lecturer', 'faculty', 'education', 'school'] },
  { label: 'Police', keywords: ['police', 'constable', 'si', 'inspector', 'security'] },
  { label: 'Military', keywords: ['army', 'navy', 'airforce', 'defence', 'military', 'armed'] },
  { label: 'Railway', keywords: ['railway', 'rrb', 'rrc', 'rail'] },
  { label: 'Banking', keywords: ['bank', 'sbi', 'rbi', 'ibps', 'lic', 'finance'] },
  { label: 'Healthcare', keywords: ['medical', 'nurse', 'doctor', 'health', 'hospital', 'pharma'] },
  { label: 'Judiciary', keywords: ['court', 'judge', 'law', 'legal', 'judicial'] },
  { label: 'UPSC / PSC', keywords: ['upsc', 'psc', 'commission', 'civil service'] },
  { label: 'Others', keywords: [] },
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

// ── Horizontal scroll chip row (no wrapping on mobile) ────────────────────
const ChipRow = ({ children }) => (
  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar snap-x">
    {children}
  </div>
);

const Chip = ({ active, onClick, color = 'amber', children, count }) => {
  const activeColors = {
    amber: 'bg-amber-600 text-white border-transparent shadow-md',
    blue: 'bg-blue-600 text-white border-transparent shadow-md',
    emerald: 'bg-emerald-600 text-white border-transparent shadow-md',
  };
  const inactiveColors = 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500';
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap snap-start shrink-0 active:scale-95 ${active ? activeColors[color] : inactiveColors}`}
      style={{ minHeight: '36px' }}
    >
      {children}
      {count !== undefined && (
        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
          {count}
        </span>
      )}
    </button>
  );
};

const CategoryJobsPage = () => {
  const { categoryName } = useParams();
  const { jobs } = useJobs();
  const decoded = decodeURIComponent(categoryName);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showStateSelect, setShowStateSelect] = useState(false);

  // Government filters
  const [govtType, setGovtType] = useState('All');
  const [activeState, setActiveState] = useState('');
  const [activeDept, setActiveDept] = useState('All');

  // IT / Non-IT filter
  const [itType, setItType] = useState('All');

  const theme = categoryConfig[decoded] || defaultTheme;
  const IconComp = theme.icon;

  const filtered = useMemo(() => {
    let base = jobs.filter(j => (j.jobCategory || j.category || '') === decoded);

    if (decoded === 'Government Jobs') {
      if (govtType === 'Central') base = base.filter(j => j.govtJobType === 'Central');
      if (govtType === 'State') {
        base = base.filter(j => j.govtJobType === 'State');
        if (activeState) base = base.filter(j => j.stateName === activeState);
      }
      if (activeDept !== 'All') {
        const dept = GOVT_DEPARTMENTS.find(d => d.label === activeDept);
        base = base.filter(j => {
          if (j.govtDept === activeDept) return true;
          if (activeDept === 'Others') {
            const matchesAnother = GOVT_DEPARTMENTS.some(d => {
              if (d.label === 'All' || d.label === 'Others') return false;
              const text = `${j.title} ${j.description} ${j.fullDescription}`.toLowerCase();
              return d.keywords.some(kw => text.includes(kw));
            });
            return !matchesAnother;
          }
          if (dept?.keywords?.length) {
            const text = `${j.title} ${j.description} ${j.fullDescription}`.toLowerCase();
            return dept.keywords.some(kw => text.includes(kw));
          }
          return false;
        });
      }
    } else if (decoded === 'IT & Non-IT Jobs') {
      if (itType !== 'All') base = base.filter(j => j.jobCategoryType === itType);
    }

    return base;
  }, [jobs, decoded, govtType, activeState, activeDept, itType]);

  const itCount = useMemo(() =>
    jobs.filter(j => (j.jobCategory || j.category || '') === 'IT & Non-IT Jobs' && j.jobCategoryType === 'IT Job').length,
    [jobs]);
  const nonItCount = useMemo(() =>
    jobs.filter(j => (j.jobCategory || j.category || '') === 'IT & Non-IT Jobs' && j.jobCategoryType === 'Non-IT Job').length,
    [jobs]);
  const govtCentralCount = useMemo(() =>
    jobs.filter(j => (j.jobCategory || j.category || '') === 'Government Jobs' && j.govtJobType === 'Central').length,
    [jobs]);
  const govtStateCount = useMemo(() =>
    jobs.filter(j => (j.jobCategory || j.category || '') === 'Government Jobs' && j.govtJobType === 'State').length,
    [jobs]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f14] font-sans transition-colors duration-300">

      {/* HERO */}
      <div className="relative bg-slate-950 text-white pt-24 md:pt-32 pb-12 md:pb-20 text-center border-b border-slate-900 px-4 overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-20 pointer-events-none ${theme.glow}`} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto relative z-10">
          <div className={`w-14 h-14 md:w-20 md:h-20 mx-auto rounded-[1.25rem] md:rounded-[1.5rem] flex items-center justify-center mb-4 md:mb-6 border ${theme.border} ${theme.bg}`}>
            <IconComp size={28} className={`md:hidden ${theme.color}`} />
            <IconComp size={36} className={`hidden md:block ${theme.color}`} />
          </div>
          <h1 className="text-2xl md:text-6xl font-black tracking-tight mb-2 md:mb-3">{decoded}</h1>
          <p className="text-sm md:text-lg text-slate-400 font-medium">{theme.desc}</p>

          {/* Quick stat pills — compact on mobile */}
          {decoded === 'IT & Non-IT Jobs' && (
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold">{itCount} IT Jobs</span>
              <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-bold">{nonItCount} Non-IT Jobs</span>
            </div>
          )}
          {decoded === 'Government Jobs' && (
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-bold">{govtCentralCount} Central Govt</span>
              <span className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs font-bold">{govtStateCount} State Govt</span>
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
            {/* Live count — visible on mobile too */}
            <div className="flex items-center gap-2 xl:order-last shrink-0">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme.glow}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${theme.glow}`} />
              </span>
              <p className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                {filtered.length} Live
              </p>
            </div>
          </div>

          {/* Government Filters — horizontal scrollable chips on mobile */}
          {decoded === 'Government Jobs' && (
            <div className="space-y-2 md:flex md:flex-row md:flex-wrap md:gap-3 md:items-center md:space-y-0">
              {/* Central / State / All — always shown as a chip row */}
              <ChipRow>
                {['All', 'Central', 'State'].map(t => (
                  <Chip
                    key={t}
                    active={govtType === t}
                    color="amber"
                    onClick={() => { setGovtType(t); setActiveState(''); setActiveDept('All'); setShowStateSelect(false); }}
                  >
                    {t === 'All' ? 'All Govt' : `${t} Govt`}
                  </Chip>
                ))}
              </ChipRow>

              {/* State selector — appears as a chip with dropdown toggle on mobile */}
              {govtType === 'State' && (
                <div className="relative">
                  {/* Mobile: tap-to-toggle native select */}
                  <div className="md:hidden">
                    <button
                      onClick={() => setShowStateSelect(s => !s)}
                      className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95"
                      style={{ minHeight: '36px' }}
                    >
                      <Filter size={12} />
                      {activeState || 'All States'}
                      <ChevronDown size={12} className={`transition-transform ${showStateSelect ? 'rotate-180' : ''}`} />
                    </button>
                    {showStateSelect && (
                      <div className="absolute left-0 top-10 z-30 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-y-auto" style={{ maxHeight: '200px', width: '200px' }}>
                        <button
                          onClick={() => { setActiveState(''); setShowStateSelect(false); }}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          All States
                        </button>
                        {indianStates.map(s => (
                          <button
                            key={s}
                            onClick={() => { setActiveState(s); setShowStateSelect(false); }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${activeState === s ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Desktop: native select */}
                  <select
                    value={activeState}
                    onChange={e => setActiveState(e.target.value)}
                    className="hidden md:block bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="">All States</option>
                    {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              {/* Department chips — horizontal scroll on mobile */}
              <ChipRow>
                {GOVT_DEPARTMENTS.map(d => (
                  <Chip
                    key={d.label}
                    active={activeDept === d.label}
                    color="amber"
                    onClick={() => setActiveDept(d.label)}
                  >
                    {d.label}
                  </Chip>
                ))}
              </ChipRow>
            </div>
          )}

          {/* IT / Non-IT Tabs — horizontal scroll on mobile */}
          {decoded === 'IT & Non-IT Jobs' && (
            <ChipRow>
              {[
                { val: 'All', label: 'All', count: itCount + nonItCount },
                { val: 'IT Job', label: 'IT Jobs', count: itCount },
                { val: 'Non-IT Job', label: 'Non-IT', count: nonItCount },
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
        {decoded === 'IT & Non-IT Jobs' && itType === 'All' && filtered.length > 0 ? (
          <div className="space-y-8 md:space-y-10">
            {filtered.filter(j => j.jobCategoryType === 'IT Job').length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4 md:mb-5">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                    <Monitor size={16} className="text-blue-400" />
                  </div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">IT Jobs</h2>
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-xs font-black">{itCount}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filtered.filter(j => j.jobCategoryType === 'IT Job').map(job => (
                    <JobCard key={job.id} job={job} onViewDetails={setSelectedJob} />
                  ))}
                </div>
              </div>
            )}

            {filtered.filter(j => j.jobCategoryType === 'Non-IT Job').length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4 md:mb-5">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                    <Briefcase size={16} className="text-purple-400" />
                  </div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">Non-IT Jobs</h2>
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full text-xs font-black">{nonItCount}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filtered.filter(j => j.jobCategoryType === 'Non-IT Job').map(job => (
                    <JobCard key={job.id} job={job} onViewDetails={setSelectedJob} />
                  ))}
                </div>
              </div>
            )}

            {filtered.filter(j => !j.jobCategoryType).length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4 md:mb-5">
                  <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">Other Openings</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filtered.filter(j => !j.jobCategoryType).map(job => (
                    <JobCard key={job.id} job={job} onViewDetails={setSelectedJob} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No roles open currently"
            message="Check back soon! We are constantly partnering with companies to bring you the best opportunities."
            onReset={() => { setGovtType('All'); setActiveState(''); setItType('All'); setActiveDept('All'); }}
            resetLabel="Clear Filters"
          />
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map(job => (
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
