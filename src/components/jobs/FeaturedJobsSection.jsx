import React, { useState } from 'react';
import { useJobs } from '../../context/JobsContext';
import JobCard from './JobCard';
import JobDetailsPanel from './JobDetailsPanel';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ["All", "IT & Software Jobs", "Non-IT Jobs", "Government Jobs"];

const FeaturedJobsSection = () => {
  const { jobs } = useJobs();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);

  const featuredJobs = jobs.filter(j => j.isFeatured);
  const filtered = activeTab === "All"
    ? featuredJobs
    : featuredJobs.filter(j => j.jobCategory === activeTab);

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between md:items-end items-start gap-4 md:gap-6 mb-8 md:mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured <span className="text-emerald-600">Opportunities</span>
            </h2>
            <p className="text-slate-500 mt-1 md:mt-2 font-medium text-sm md:text-base">Hand-picked premium roles from top employers.</p>
          </div>
          <Link
            to={`/jobs?category=${activeTab === "All" ? "" : activeTab}&featured=true`}
            className="text-emerald-600 font-bold hover:underline flex items-center gap-1"
          >
            View All {activeTab !== "All" && activeTab} Jobs &rarr;
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === cat
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
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

export default FeaturedJobsSection;