import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Monitor, Building2, Briefcase, Zap, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
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

// Government department keyword matcher (frontend-only, no DB change needed)
const GOVT_DEPARTMENTS = [
  { label: 'All', keywords: [] },
  { label: 'Teaching', keywords: ['teacher', 'professor', 'lecturer', 'faculty', 'education', 'school'] },
  { label: 'Police', keywords: ['police', 'constable', 'si', 'inspector', 'security'] },
  { label: 'Military', keywords: ['army', 'navy', 'airforce', 'defence', 'military', 'armed'] },
  { label: 'Railway', keywords: ['railway', 'rrb', 'rrc', 'rail'] },
  { label: 'Banking', keywords: ['bank', 'sbi', 'rbi', 'ibps', 'lic', 'finance'] },
  { label: 'Healthcare', keywords: ['medical', 'nurse', 'doctor', 'health', 'hospital', 'pharma'] },
  { label: 'Judiciary', keywords: ['court', 'judge', 'law', 'legal', 'judicial'] },
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

const CategoryJobsPage = () => {
  const { categoryName } = useParams();
  const { jobs } = useJobs();
  const decoded = decodeURIComponent(categoryName);
  const [selectedJob, setSelectedJob] = useState(null);

  // Government filters
  const [govtType, setGovtType] = useState('All');
  const [activeState, setActiveState] = useState('');
  const [activeDept, setActiveDept] = useState('All');

  // IT / Non-IT filter
  const [itType, setItType] = useState('All');  // All | IT Job | Non-IT Job

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
      // Department keyword filter (frontend-only)
      if (activeDept !== 'All') {
        const dept = GOVT_DEPARTMENTS.find(d => d.label === activeDept);
        if (dept?.keywords?.length) {
          base = base.filter(j => {
            const text = `${j.title} ${j.description} ${j.fullDescription}`.toLowerCase();
            return dept.keywords.some(kw => text.includes(kw));
          });
        }
      }
    } else if (decoded === 'IT & Non-IT Jobs') {
      if (itType !== 'All') base = base.filter(j => j.jobCategoryType === itType);
    }

    return base;
  }, [jobs, decoded, govtType, activeState, activeDept, itType]);

  // For IT & Non-IT — counts for each sub-type
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <Navbar />

      {/* HERO */}
      <div className="relative bg-slate-950 text-white pt-32 pb-20 text-center border-b border-slate-900 px-4 overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-20 pointer-events-none ${theme.glow}`} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto relative z-10">
          <div className={`w-20 h-20 mx-auto rounded-[1.5rem] flex items-center justify-center mb-6 border ${theme.border} ${theme.bg}`}>
            <IconComp size={36} className={theme.color} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3">{decoded}</h1>
          <p className="text-lg text-slate-400 font-medium">{theme.desc}</p>

          {/* Quick stat pills */}
          {decoded === 'IT & Non-IT Jobs' && (
            <div className="flex justify-center gap-3 mt-6 flex-wrap">
              <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-bold">{itCount} IT Jobs</span>
              <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-bold">{nonItCount} Non-IT Jobs</span>
            </div>
          )}
          {decoded === 'Government Jobs' && (
            <div className="flex justify-center gap-3 mt-6 flex-wrap">
              <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-bold">{govtCentralCount} Central Govt</span>
              <span className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-bold">{govtStateCount} State Govt</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-12 -mt-6 relative z-20">

        {/* CONTROL BAR */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 px-5 py-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <Link to="/" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>

          {/* Government Filters */}
          {decoded === 'Government Jobs' && (
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center">
              {/* Central / State toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700">
                {['All', 'Central', 'State'].map(t => (
                  <button key={t} onClick={() => { setGovtType(t); setActiveState(''); setActiveDept('All'); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${govtType === t ? 'bg-amber-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}>
                    {t === 'All' ? 'All Govt' : `${t} Govt`}
                  </button>
                ))}
              </div>

              {/* State selector */}
              {govtType === 'State' && (
                <select value={activeState} onChange={e => setActiveState(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-amber-500/20">
                  <option value="">All States</option>
                  {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}

              {/* Department filter */}
              <div className="flex flex-wrap gap-1.5">
                {GOVT_DEPARTMENTS.map(d => (
                  <button key={d.label} onClick={() => setActiveDept(d.label)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                      activeDept === d.label
                        ? 'bg-amber-600 text-white border-transparent'
                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                    }`}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* IT / Non-IT Tabs */}
          {decoded === 'IT & Non-IT Jobs' && (
            <div className="flex gap-2">
              {[
                { val: 'All',       label: 'All',      count: itCount + nonItCount },
                { val: 'IT Job',    label: 'IT Jobs',  count: itCount },
                { val: 'Non-IT Job', label: 'Non-IT',  count: nonItCount },
              ].map(opt => (
                <button key={opt.val} onClick={() => setItType(opt.val)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${
                    itType === opt.val
                      ? 'bg-blue-600 text-white border-transparent shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}>
                  {opt.label}
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${itType === opt.val ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}`}>{opt.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Live count */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme.glow}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${theme.glow}`} />
            </span>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              {filtered.length} Live Openings
            </p>
          </div>
        </div>

        {/* IT & Non-IT — Two Column Split when "All" selected */}
        {decoded === 'IT & Non-IT Jobs' && itType === 'All' && filtered.length > 0 ? (
          <div className="space-y-10">
            {/* IT Jobs section */}
            {filtered.filter(j => j.jobCategoryType === 'IT Job').length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                    <Monitor size={16} className="text-blue-400" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">IT Jobs</h2>
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-black">{itCount}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.filter(j => j.jobCategoryType === 'IT Job').map(job => (
                    <JobCard key={job.id} job={job} onViewDetails={setSelectedJob} />
                  ))}
                </div>
              </div>
            )}

            {/* Non-IT Jobs section */}
            {filtered.filter(j => j.jobCategoryType === 'Non-IT Job').length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                    <Briefcase size={16} className="text-purple-400" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Non-IT Jobs</h2>
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-black">{nonItCount}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.filter(j => j.jobCategoryType === 'Non-IT Job').map(job => (
                    <JobCard key={job.id} job={job} onViewDetails={setSelectedJob} />
                  ))}
                </div>
              </div>
            )}

            {/* Unclassified IT & Non-IT */}
            {filtered.filter(j => !j.jobCategoryType).length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Other Openings</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <Footer />
      <JobDetailsPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
};

export default CategoryJobsPage;