import React from 'react';
import { useJobs } from '../../context/JobsContext';
import JobCard from './JobCard';
import { Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FeaturedJobsSection = ({ onJobClick }) => {
  const { jobs, loading } = useJobs();

  // ── ONLY admin-marked isFeatured jobs sorted so isHeroFeatured is first — strictly capped at 5 ──
  const featuredJobs = React.useMemo(() => {
    if (!jobs) return [];
    const featured = jobs.filter(job => job.isFeatured === true);
    const sorted = [...featured].sort((a, b) => {
      const aHero = a.isHeroFeatured || false;
      const bHero = b.isHeroFeatured || false;
      if (aHero && !bHero) return -1;
      if (!aHero && bHero) return 1;
      return b.createdAt - a.createdAt; // secondary sort by newest
    });
    return sorted.slice(0, 5);
  }, [jobs]);

  if (loading) {
    return (
      <section className="py-20 section-light border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-[90rem] mx-auto px-4 md:px-8">
          <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg w-48 mb-4 animate-pulse" />
          <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-72 mb-10 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[22rem] bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Don't render at all if admin hasn't featured any jobs
  if (featuredJobs.length === 0) return null;

  return (
    <section className="py-16 md:py-24 section-light border-y border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden transition-colors duration-500">
      {/* Subtle bg atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 60%)' }}
      />

      <div className="max-w-[90rem] mx-auto px-4 md:px-8 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Star size={13} className="fill-current" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Top Opportunities</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Featured <span className="text-gradient-emerald">Jobs</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-base mt-2 max-w-lg">
              Hand-picked career openings from top employers, selected specifically to launch your career forward.
            </p>
          </div>
          <Link
            to="/jobs"
            className="flex items-center gap-2 font-bold text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group whitespace-nowrap shrink-0"
          >
            View all {jobs?.length || 0} jobs
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredJobs.map((job, index) => {
            const isHero = index === 0;
            return (
              <motion.div
                key={job.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className={isHero ? 'md:col-span-2' : 'col-span-1'}
              >
                <JobCard job={job} onViewDetails={onJobClick} layout={isHero ? 'hero' : 'standard'} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobsSection;
