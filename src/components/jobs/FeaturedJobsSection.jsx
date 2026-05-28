import React, { useState, memo } from 'react';
import { useJobs } from '../../context/JobsContext';
import JobCard from './JobCard';
import SkeletonCard from '../common/SkeletonCard';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Flame, Building2, GraduationCap } from 'lucide-react';

const TABS = [
  { key: 'All',             label: 'All Featured',   icon: Star,       color: 'from-emerald-500 to-teal-400' },
  { key: 'IT & Non-IT Jobs',label: 'IT & Tech',      icon: Building2,  color: 'from-blue-500 to-cyan-400' },
  { key: 'Government Jobs', label: 'Government',     icon: GraduationCap, color: 'from-amber-500 to-orange-400' },
];

const FeaturedJobsSection = memo(({ onViewDetails }) => {
  const { jobs, loading } = useJobs();
  const [activeTab, setActiveTab] = useState('All');

  const safeJobs     = Array.isArray(jobs) ? jobs : [];
  const featuredJobs = safeJobs.filter(j => j.isFeatured);
  const filtered     = activeTab === 'All'
    ? featuredJobs
    : featuredJobs.filter(j => (j.jobCategory || j.category) === activeTab);

  const safeFiltered = Array.isArray(filtered) ? filtered : [];
  const categoryQuery = activeTab === 'All' ? 'All Categories' : encodeURIComponent(activeTab);
  const activeTabData = TABS.find(t => t.key === activeTab) || TABS[0];

  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-[#020617] overflow-hidden relative border-b border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 top-0 w-[600px] h-[600px] opacity-20 dark:opacity-30"
          style={{ background: 'radial-gradient(circle at top right, rgba(16,185,129,0.1) 0%, transparent 65%)', filter: 'blur(40px)' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* ── Section Header ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${activeTabData.color} flex items-center justify-center`}>
                <Star size={12} className="text-white fill-white" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                Featured Opportunities
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Hand-Picked <span className="text-gradient-emerald">Roles</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
              Premium positions from verified employers, curated for you.
            </p>
          </div>
          <Link
            to={`/jobs?category=${categoryQuery}&featured=true`}
            className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/30 px-5 py-2.5 rounded-full transition-all duration-200 self-start md:self-auto whitespace-nowrap"
          >
            View All {activeTab !== 'All' && activeTab} <ArrowRight size={15} />
          </Link>
        </div>

        {/* ── Filter Tabs ─────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar mb-8">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                whileTap={{ scale: 0.96 }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-[0_4px_16px_rgba(16,185,129,0.25)]`
                    : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* ── Job Cards Grid ──────────────────────────────────────────── */}
        {loading && safeFiltered.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : safeFiltered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Star size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              No featured jobs in this category yet.
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {safeFiltered.slice(0, 6).map((job, i) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <JobCard job={job} onViewDetails={onViewDetails} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
});

FeaturedJobsSection.displayName = 'FeaturedJobsSection';
export default FeaturedJobsSection;