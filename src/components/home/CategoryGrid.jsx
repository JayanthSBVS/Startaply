import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Briefcase, Zap, GraduationCap, ArrowRight, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
import { useJobs } from '../../context/JobsContext';

// Map each card to a category filter + how to count from real jobs array
const CATEGORY_DEFS = [
  {
    name: 'IT & Tech',
    desc: 'Software, Design, Cloud & Data',
    icon: Monitor,
    navPath: '/jobs?section=it',
    accent: 'blue',
    gradient: 'from-blue-500 to-cyan-400',
    filter: j => {
      const cat = (j.category || j.jobCategory || '').toLowerCase();
      const type = (j.jobCategoryType || '').toLowerCase();
      return cat.includes('it') || cat.includes('software') || cat.includes('tech') || type.includes('it');
    },
  },
  {
    name: 'Freshers',
    desc: '0-1 yr experience welcome',
    icon: GraduationCap,
    navPath: '/jobs?section=freshers',
    accent: 'brand',
    gradient: 'from-blue-600 to-indigo-400',
    filter: j => j.isFresh || (j.experience || '').toLowerCase().includes('fresher') || (j.experience || '').includes('0'),
  },
  {
    name: 'Private Jobs',
    desc: 'Corporate and enterprise roles',
    icon: Briefcase,
    navPath: '/jobs?section=nonit',
    accent: 'indigo',
    gradient: 'from-indigo-500 to-violet-400',
    filter: j => {
      const cat = (j.category || j.jobCategory || '').toLowerCase();
      return cat.includes('private') || cat.includes('corporate') || (!cat.includes('govt') && !cat.includes('mela'));
    },
  },
  {
    name: 'Gig Works',
    desc: 'Flexible and on-demand roles',
    icon: Zap,
    navPath: '/jobs?section=gig',
    accent: 'rose',
    gradient: 'from-rose-500 to-pink-400',
    filter: j => {
      const cat = (j.category || j.jobCategory || '').toLowerCase();
      return cat.includes('gig') || cat.includes('service') || cat.includes('freelance');
    },
  },
];

const ACCENT_COLORS = {
  blue:  { icon: 'text-blue-500 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-500/10',   border: 'border-blue-100 dark:border-transparent',   hover: 'group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-blue-500/30' },
  brand: { icon: 'text-brand dark:text-brand-hover', bg: 'bg-brand-soft dark:bg-brand-soft',  border: 'border-brand/10 dark:border-transparent',       hover: 'group-hover:bg-brand group-hover:text-on-brand group-hover:shadow-brand/30' },
  indigo:{ icon: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10',border: 'border-indigo-100 dark:border-transparent',hover: 'group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-indigo-500/30' },
  rose:  { icon: 'text-rose-500 dark:text-rose-400',   bg: 'bg-rose-50 dark:bg-rose-500/10',   border: 'border-rose-100 dark:border-transparent',   hover: 'group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-rose-500/30' },
};

const CategoryGrid = () => {
  const navigate = useNavigate();
  const { jobs } = useJobs();

  // Compute real counts from live job data
  const counts = useMemo(() => {
    const safeJobs = Array.isArray(jobs) ? jobs : [];
    return CATEGORY_DEFS.map(def => safeJobs.filter(def.filter).length);
  }, [jobs]);

  return (
    <section className="py-10 md:py-16 section-light border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-500">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
        className="max-w-[90rem] mx-auto px-4 md:px-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 md:gap-6 mb-6 md:mb-12">
          <div>
            <motion.h2
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className="text-xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight"
            >
              Explore by <span className="text-brand dark:text-brand-hover">Path</span>
            </motion.h2>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              className="text-slate-500 dark:text-slate-400 font-medium text-base"
            >
              Find the right opportunities based on your career trajectory.
            </motion.p>
          </div>
          <motion.button
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-brand dark:hover:text-brand-hover transition-colors group whitespace-nowrap"
          >
            View All <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Cards: 2-column grid on mobile, 4-column on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {CATEGORY_DEFS.map((cat, i) => {
            const ac = ACCENT_COLORS[cat.accent];
            const count = counts[i];
            const Icon = cat.icon;

            return (
              <motion.div
                key={cat.name}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90 } } }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(cat.navPath)}
                className="group relative cursor-pointer premium-surface p-3.5 sm:p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between h-full active:scale-95"
              >
                {/* Subtle hover glow */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br ${cat.gradient} group-hover:opacity-[0.05]`} />

                <div>
                  {/* Icon + Count */}
                  <div className="flex justify-between items-start mb-3 sm:mb-5 relative z-10">
                    <div className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-xs
                      ${ac.bg} ${ac.border} ${ac.icon}
                      ${ac.hover} group-hover:scale-105
                    `}>
                      <Icon size={20} />
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className={`text-base sm:text-xl font-black tabular-nums transition-colors ${count > 0 ? ac.icon : 'text-slate-400 dark:text-slate-500'}`}>
                        {count}
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        {count === 1 ? 'Job' : 'Jobs'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-1 group-hover:text-brand dark:group-hover:text-brand-hover transition-colors relative z-10">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] sm:text-[12px] font-medium text-slate-500 dark:text-slate-400 relative z-10 leading-snug line-clamp-2">
                    {cat.desc}
                  </p>
                </div>

                {/* Arrow CTA */}
                <div className="mt-3 pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand relative z-10">
                  <span>Explore</span> <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};

export default CategoryGrid;
