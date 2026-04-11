import React, { useState } from 'react';
import { useJobs } from '../../context/JobsContext';
import JobCard from './JobCard';
import JobDetailsPanel from './JobDetailsPanel';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ["All", "IT & Software Jobs", "Non-IT Jobs", "Government Jobs"];

const TodaysJobsSection = () => {
  const { jobs } = useJobs();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);

  const freshJobs = jobs.filter(j => j.isFresh);
  const filtered = activeTab === "All"
    ? freshJobs
    : freshJobs.filter(j => j.jobCategory === activeTab);

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between md:items-end items-start gap-4 md:gap-6 mb-8 md:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-black uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" /> Updated Today
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Today's New Listings</h2>
            <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">Fresh opportunities posted in the last 24 hours.</p>
          </div>
          <Link
            to={`/jobs?category=${activeTab === "All" ? "" : activeTab}&fresh=true`}
            className="text-emerald-600 font-bold hover:underline text-sm md:text-base"
          >
            View All New Jobs &rarr;
          </Link>
        </div>

        <div className="-mx-4 px-4 flex gap-2 overflow-x-auto pb-6 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === cat
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.slice(0, 6).map(job => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
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