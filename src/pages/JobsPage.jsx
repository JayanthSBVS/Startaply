import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import JobCard from '../components/jobs/JobCard';
import JobDetailsPanel from '../components/jobs/JobDetailsPanel';
import { useJobs } from '../context/JobsContext';
import { motion } from 'framer-motion';

const JOB_CATEGORIES = ['All Categories', 'IT & Non-IT Jobs', 'Government Jobs', 'Private Jobs', 'Gig & Services'];
const JOB_MODES = ['All Modes', 'Hybrid', 'On-site', 'Remote'];

const JobsPage = () => {
  const { jobs } = useJobs();
  const [searchParams] = useSearchParams();

  // Read URL Params
  const incomingSearch = searchParams.get('company') || '';
  const incomingCategory = searchParams.get('category') || 'All Categories';
  const incomingFresh = searchParams.get('fresh') === 'true';
  const incomingFeatured = searchParams.get('featured') === 'true';

  const [search, setSearch] = useState(incomingSearch);
  const [category, setCategory] = useState(incomingCategory);
  const [mode, setMode] = useState('All Modes');
  const [isFreshFilter, setIsFreshFilter] = useState(incomingFresh);
  const [isFeaturedFilter, setIsFeaturedFilter] = useState(incomingFeatured);

  const [selectedJob, setSelectedJob] = useState(null);

  // Sync state if URL changes
  useEffect(() => {
    setCategory(searchParams.get('category') || 'All Categories');
    setIsFreshFilter(searchParams.get('fresh') === 'true');
    setIsFeaturedFilter(searchParams.get('featured') === 'true');
  }, [searchParams]);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const q = search.toLowerCase();
      const catMatch = category === 'All Categories' || job.jobCategory === category;
      const modeMatch = mode === 'All Modes' || job.mode === mode;

      const freshMatch = !isFreshFilter || (job.isToday || job.isFresh);
      const featuredMatch = !isFeaturedFilter || job.isFeatured;

      return (!q || job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q))
        && catMatch
        && modeMatch
        && freshMatch
        && featuredMatch;
    });
  }, [jobs, search, category, mode, isFreshFilter, isFeaturedFilter]);

  const clearFilters = () => {
    setSearch('');
    setCategory('All Categories');
    setMode('All Modes');
    setIsFreshFilter(false);
    setIsFeaturedFilter(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <div className="bg-white dark:bg-slate-900 pt-28 pb-20 px-4 text-center border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-slate-900 dark:text-white">
            Discover Your Next <span className="text-emerald-600 dark:text-emerald-400">Opportunity</span>
          </h1>

          <div className="max-w-2xl mx-auto flex bg-white/10 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-700 p-1.5 rounded-[2rem] backdrop-blur-xl focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all shadow-2xl">
            <div className="flex-1 flex items-center pl-5">
              <Search size={22} className="text-emerald-600 dark:text-emerald-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job title, keyword, or company..."
                className="w-full bg-transparent px-4 py-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none font-bold text-lg"
              />
            </div>
            <button className="bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-[1.5rem] font-black transition-colors shadow-sm text-lg">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-20">

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 mb-10 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/40 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center transition-colors">

          <div className="flex items-center gap-3 px-4 shrink-0 text-slate-400 dark:text-slate-500 border-r border-slate-100 dark:border-slate-800 hidden md:flex">
            <Filter size={20} /> <span className="font-bold text-sm uppercase tracking-widest">Filters</span>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar w-full custom-scrollbar pb-2 md:pb-0">
            {JOB_CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${category === c ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-500/50'}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto md:border-l border-slate-100 dark:border-slate-800 md:pl-4 pb-2 md:pb-0 shrink-0">
            {JOB_MODES.map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${mode === m ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {m}
              </button>
            ))}
          </div>

        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 px-2 gap-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Showing <span className="text-emerald-600 dark:text-emerald-400">{filtered.length}</span> Results
          </h2>

          {/* Active Filter Tags */}
          <div className="flex gap-2">
            {isFreshFilter && <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-900/50">Today's Jobs</span>}
            {isFeaturedFilter && <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold border border-amber-100 dark:border-amber-900/50">Featured Roles</span>}
            {(isFreshFilter || isFeaturedFilter) && (
              <button onClick={clearFilters} className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline">Clear</button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-slate-800 shadow-inner">
              <Search size={32} className="text-slate-300 dark:text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No jobs match your criteria</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Try adjusting your filters or search terms.</p>
            <button
              onClick={clearFilters}
              className="mt-8 text-white font-bold transition-all duration-200 bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:-translate-y-1 px-8 py-3.5 rounded-full shadow-lg shadow-slate-900/20 dark:shadow-emerald-950/40"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(job => (
              <JobCard key={job.id} job={job} onViewDetails={setSelectedJob} />
            ))}
          </div>
        )}
      </div>

      <Footer />
      <JobDetailsPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
};

export default JobsPage;