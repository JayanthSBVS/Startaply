import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Building2, Briefcase, Zap, GraduationCap, ArrowRight, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
import { useJobs } from '../../context/JobsContext';

// Map each card to a category filter + how to count from real jobs array
const CATEGORY_DEFS = [
  {
    name: 'IT & Tech',
    desc: 'Software, Design, Cloud & Data',
    icon: Monitor,
    navPath: '/category/IT %26 Non-IT Jobs',
    accent: 'blue',
    gradient: 'from-blue-500 to-cyan-400',
    filter: j => ['IT & Non-IT Jobs', 'IT & Software Jobs'].includes(j.category),
  },
  {
    name: 'Government',
    desc: 'Central & State govt opportunities',
    icon: Building2,
    navPath: '/category/Government Jobs',
    accent: 'amber',
    gradient: 'from-amber-500 to-orange-400',
    filter: j => j.category === 'Government Jobs',
  },
  {
    name: 'Freshers',
    desc: '0–1 yr experience welcome',
    icon: GraduationCap,
    navPath: '/jobs?section=freshers',
    accent: 'emerald',
    gradient: 'from-emerald-500 to-teal-400',
    filter: j => j.isFresh || (j.experience || '').toLowerCase().includes('fresher') || (j.experience || '').includes('0'),
  },
  {
    name: 'Private Jobs',
    desc: 'Corporate and enterprise roles',
    icon: Briefcase,
    navPath: '/category/Private Jobs',
    accent: 'indigo',
    gradient: 'from-indigo-500 to-violet-400',
    filter: j => j.category === 'Private Jobs',
  },
  {
    name: 'Gig Works',
    desc: 'Flexible and on-demand roles',
    icon: Zap,
    navPath: '/category/Gig %26 Services',
    accent: 'rose',
    gradient: 'from-rose-500 to-pink-400',
    filter: j => ['Gig & Services', 'Gig Works'].includes(j.category || j.jobCategory || ''),
  },
];

const ACCENT_COLORS = {
  blue:    { icon: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-500/10',   border: 'border-blue-100 dark:border-blue-500/15',   hover: 'group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-blue-500/30' },
  amber:   { icon: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-500/10',  border: 'border-amber-100 dark:border-amber-500/15',  hover: 'group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-amber-500/30' },
  emerald: { icon: 'text-emerald-500',bg: 'bg-emerald-50 dark:bg-emerald-500/10',border:'border-emerald-100 dark:border-emerald-500/15',hover:'group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-emerald-500/30' },
  indigo:  { icon: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-500/15', hover: 'group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-indigo-500/30' },
  rose:    { icon: 'text-rose-500',   bg: 'bg-rose-50 dark:bg-rose-500/10',   border: 'border-rose-100 dark:border-rose-500/15',   hover: 'group-hover:bg-rose-500 group-hover:text-white group-hover:shadow-rose-500/30' },
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
              Explore by <span className="text-gradient-emerald">Path</span>
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
            className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group whitespace-nowrap"
          >
            View All <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* Cards */}
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-5 gap-4 md:gap-5 no-scrollbar snap-x snap-mandatory">
          {CATEGORY_DEFS.map((cat, i) => {
            const ac = ACCENT_COLORS[cat.accent];
            const count = counts[i];
            const Icon = cat.icon;

            return (
              <motion.div
                key={cat.name}
                variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90 } } }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(cat.navPath)}
                className="group relative cursor-pointer premium-surface p-4 md:p-5 rounded-xl md:rounded-2xl transition-all duration-300 min-w-[172px] md:min-w-0 flex flex-col snap-start active:scale-95"
              >
                {/* Subtle hover glow */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-[0.04]`} />

                {/* Icon + Count */}
                <div className="flex justify-between items-start mb-5 relative z-10">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-sm
                    ${ac.bg} ${ac.border} ${ac.icon}
                    ${ac.hover} group-hover:shadow-lg group-hover:scale-110
                  `}>
                    <Icon size={22} />
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className={`text-xl font-black tabular-nums transition-colors ${count > 0 ? ac.icon : 'text-slate-400 dark:text-slate-500'}`}>
                      {count}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {count === 1 ? 'Job' : 'Jobs'}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors relative z-10">
                  {cat.name}
                </h3>
                <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 relative z-10 leading-snug">
                  {cat.desc}
                </p>

                {/* Arrow CTA — hidden on mobile (hover-only, no hover on touch) */}
                <div className="hidden md:flex mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-500 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 relative z-10">
                  Explore <ArrowRight size={11} />
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
