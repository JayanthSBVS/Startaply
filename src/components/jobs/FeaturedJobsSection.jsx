import React, { useState } from 'react';
import { useJobs } from '../../context/JobsContext';
import JobCard from './JobCard';
import JobDetailsPanel from './JobDetailsPanel';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ["All", "IT & Non-IT Jobs", "Government Jobs"];

const FeaturedJobsSection = () => {
  const { jobs } = useJobs();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);

  const featuredJobs = jobs.filter(j => j.isFeatured);
  const filtered = activeTab === "All"
    ? featuredJobs
    : featuredJobs.filter(j => (j.jobCategory || j.category) === activeTab);

  // Exact URI Mapping for JobsPage filters
  const categoryQuery = activeTab === "All" ? "All Categories" : encodeURIComponent(activeTab);

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between md:items-end items-start gap-4 md:gap-6 mb-8 md:mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured <span className="text-emerald-600">Opportunities</span>
            </h2>
            <p className="text-slate-500 mt-1 md:mt-2 font-medium text-sm md:text-base">Hand-picked premium roles from top employers.</p>
          </div>
          <Link
            to={`/jobs?category=${categoryQuery}&featured=true`}
            className="text-emerald-600 font-bold hover:bg-emerald-100 flex items-center gap-1 bg-emerald-50 px-5 py-2.5 rounded-full transition-colors duration-200"
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
                : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700'
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
      </div>
      <JobDetailsPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
    </section>
  );
};

export default FeaturedJobsSection;