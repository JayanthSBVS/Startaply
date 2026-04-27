import React, { useState, memo } from 'react';
import { useJobs } from '../../context/JobsContext';
import JobCard from './JobCard';
import JobDetailsPanel from './JobDetailsPanel';
import SkeletonCard from '../common/SkeletonCard';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ["All", "IT & Non-IT Jobs", "Government Jobs"];

const FeaturedJobsSection = memo(() => {
  const { jobs, loading } = useJobs();
  const [activeTab, setActiveTab]   = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);

  // Defensive programming: ensure arrays are used
  const safeJobs    = Array.isArray(jobs) ? jobs : [];
  const featuredJobs = safeJobs.filter(j => j.isFeatured);
  const filtered     = activeTab === "All"
    ? featuredJobs
    : featuredJobs.filter(j => (j.jobCategory || j.category) === activeTab);

  const safeFiltered = Array.isArray(filtered) ? filtered : [];

  // Exact URI Mapping for JobsPage filters
  const categoryQuery = activeTab === "All" ? "All Categories" : encodeURIComponent(activeTab);

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between md:items-end items-start gap-4 md:gap-6 mb-8 md:mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Featured <span className="text-emerald-600">Opportunities</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 md:mt-2 font-medium text-sm md:text-base">Hand-picked premium roles from top employers.</p>
          </div>
          <Link
            to={`/jobs?category=${categoryQuery}&featured=true`}
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/10 px-5 py-2.5 rounded-full transition-colors duration-200"
          >
            View All {activeTab !== "All" && activeTab} Jobs &rarr;
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-6 custom-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${activeTab === cat
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skeleton while loading */}
        {loading && safeFiltered.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {safeFiltered.slice(0, 6).map(job => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <JobCard job={job} onViewDetails={setSelectedJob} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      <JobDetailsPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
    </section>
  );
});

FeaturedJobsSection.displayName = 'FeaturedJobsSection';
export default FeaturedJobsSection;