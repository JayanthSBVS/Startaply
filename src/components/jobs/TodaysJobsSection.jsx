import React, { useState } from 'react';
import { useJobs } from '../../context/JobsContext';
import JobCard from './JobCard';
import JobDetailsPanel from './JobDetailsPanel';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ["All", "IT & Non-IT Jobs", "Government Jobs"];

const TodaysJobsSection = () => {
  const { jobs } = useJobs();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);

  // Defensive programming: ensure arrays are used
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const freshJobs = safeJobs.filter(j => j.isToday || j.isFresh); // Fallback to isFresh for safety
  const filtered = activeTab === "All"
    ? freshJobs
    : freshJobs.filter(j => (j.jobCategory || j.category) === activeTab);

  const safeFiltered = Array.isArray(filtered) ? filtered : [];

  // Exact URI Mapping for JobsPage filters
  const categoryQuery = activeTab === "All" ? "All Categories" : encodeURIComponent(activeTab);

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between md:items-end items-start gap-4 md:gap-6 mb-8 md:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-black uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" /> Updated Today
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Today's New Listings</h2>
            <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">Fresh opportunities posted in the last 24 hours.</p>
          </div>
          <Link
            to={`/jobs?category=${categoryQuery}&fresh=true`}
            className="text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-100 text-sm md:text-base bg-blue-50 px-5 py-2.5 rounded-full transition-colors duration-200"
          >
            View All New Jobs &rarr;
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-6 custom-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${activeTab === cat
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {safeFiltered.slice(0, 6).map(job => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <JobCard job={job} onViewDetails={setSelectedJob} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
      <JobDetailsPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
    </section>
  );
};

export default TodaysJobsSection;