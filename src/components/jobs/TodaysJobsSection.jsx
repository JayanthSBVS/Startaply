import React, { useState, memo, useEffect, useMemo } from 'react';
import { useJobs } from '../../context/JobsContext';
import { useAuth } from '../../context/AuthContext';
import { getCandidateProfile } from '../../utils/candidatePersonalization';
import JobCard from './JobCard';
import SkeletonCard from '../common/SkeletonCard';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Flame, Building2, GraduationCap } from 'lucide-react';

const TABS = [
  { key: 'All',              label: 'All Fresh',    icon: Flame,         color: 'from-blue-500 to-cyan-400' },
  { key: 'IT & Tech',        label: 'IT & Tech',   icon: Building2,     color: 'from-violet-500 to-purple-400' },
  { key: 'Private Jobs',     label: 'Private Jobs', icon: GraduationCap, color: 'from-blue-600 to-indigo-400' },
];

const TodaysJobsSection = memo(({ onViewDetails }) => {
  const { jobs, loading } = useJobs();
  const { user } = useAuth();
  const candidateProfile = useMemo(() => getCandidateProfile(user), [user]);
  const isCandidate = candidateProfile.isCandidate;

  const [activeTab, setActiveTab] = useState('All');

  const safeJobs  = Array.isArray(jobs) ? jobs : [];
  const freshList = safeJobs.filter(j => j.isToday || j.isFresh);
  const freshJobs = freshList.length > 0 ? freshList : safeJobs;

  const filtered  = (isCandidate || activeTab === 'All')
    ? freshJobs
    : freshJobs.filter(j => {
        const cat = (j.jobCategory || j.category || '').toLowerCase();
        const type = (j.jobCategoryType || '').toLowerCase();
        if (activeTab === 'IT & Tech' || activeTab === 'IT & Non-IT Jobs') {
          return cat.includes('it') || cat.includes('software') || cat.includes('tech') || type.includes('it');
        }
        if (activeTab === 'Private Jobs') {
          return cat.includes('private') || cat.includes('corporate') || (!cat.includes('govt') && !cat.includes('mela'));
        }
        return cat === activeTab.toLowerCase();
      });

  const safeFiltered = Array.isArray(filtered) ? filtered : [];
  const activeTabData = TABS.find(t => t.key === activeTab) || TABS[0];

  // Personalized copy & link
  let headerTitle = "New Listings";
  let headerDesc = "Fresh opportunities posted in the last 24 hours.";
  let viewAllPath = "/jobs?section=today";
  let viewAllLabel = "View All Today's";

  if (candidateProfile.isItFresher) {
    headerTitle = "IT Fresher Openings";
    headerDesc = "Fresh entry-level software & tech roles posted in the last 24 hours.";
    viewAllPath = "/jobs?section=it-freshers";
    viewAllLabel = "View All IT Freshers";
  } else if (candidateProfile.isItExperienced) {
    headerTitle = "Tech Openings";
    headerDesc = "Fresh software, cloud & engineering roles posted in the last 24 hours.";
    viewAllPath = "/jobs?section=it";
    viewAllLabel = "View All Tech Jobs";
  } else if (candidateProfile.isNonItFresher) {
    headerTitle = "Non-IT Graduate Roles";
    headerDesc = "Fresh entry-level operational, sales & HR roles posted in the last 24 hours.";
    viewAllPath = "/jobs?section=freshers";
    viewAllLabel = "View All Graduate Roles";
  } else if (candidateProfile.isNonItExperienced) {
    headerTitle = "Operations & Corporate Roles";
    headerDesc = "Fresh enterprise, BPO & corporate roles posted in the last 24 hours.";
    viewAllPath = "/jobs?section=nonit";
    viewAllLabel = "View All Corporate Roles";
  } else if (candidateProfile.isGig) {
    headerTitle = "Gig & Freelance Projects";
    headerDesc = "Fresh contract, remote & flexible projects posted in the last 24 hours.";
    viewAllPath = "/jobs?section=gig";
    viewAllLabel = "View All Gigs";
  }

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-black border-b border-slate-200 dark:border-neutral-850 overflow-hidden relative transition-colors duration-300">
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 w-[500px] h-[400px] opacity-20 dark:opacity-30"
          style={{ background: 'radial-gradient(circle at top left, rgba(6,182,212,0.1) 0%, transparent 65%)', filter: 'blur(60px)' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* ── Section Header ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1.5">
              Today's <span className="text-brand dark:text-brand-hover">{headerTitle}</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm md:text-base">
              {headerDesc}
            </p>
          </div>
          <Link
            to={viewAllPath}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/30 px-4 sm:px-5 py-2.5 rounded-full transition-all duration-200 self-start md:self-auto whitespace-nowrap min-h-[44px]"
          >
            {viewAllLabel} <ArrowRight size={14} />
          </Link>
        </div>

        {/* ── Filter Tabs ─────────────────────────────────────────────── */}
        {!isCandidate && (
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6 sm:mb-8">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                whileTap={{ scale: 0.96 }}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 min-h-[44px] ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-[0_4px_16px_rgba(6,182,212,0.25)]`
                    : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>
        )}

        {/* ── Job Cards Grid ──────────────────────────────────────────── */}
        {loading && safeFiltered.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : safeFiltered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Flame size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No fresh jobs today. Check back soon!</p>
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

TodaysJobsSection.displayName = 'TodaysJobsSection';
export default TodaysJobsSection;
