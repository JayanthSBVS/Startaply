import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

const stats = [
  {
    target: 10000,
    suffix: '+',
    label: 'Verified Jobs',
    sublabel: 'Active & reviewed opportunities',
    start: 9000,
    accent: 'text-[#001F8E] dark:text-[#1A62FE]',
    glow: 'rgba(26,98,254,0.15)',
    bar: 'from-[#001F8E] to-[#1A62FE]'
  },
  {
    target: 500,
    suffix: '+',
    label: 'Partner Companies',
    sublabel: 'Direct hiring network partners',
    start: 450,
    accent: 'text-[#1A62FE] dark:text-[#4D84FF]',
    glow: 'rgba(77,132,255,0.15)',
    bar: 'from-[#1A62FE] to-[#4D84FF]'
  },
  {
    target: 100,
    suffix: '%',
    label: 'Free Platform',
    sublabel: 'Zero candidate charges & fees',
    start: 100,
    accent: 'text-indigo-600 dark:text-indigo-400',
    glow: 'rgba(99,102,241,0.15)',
    bar: 'from-indigo-600 to-[#1A62FE]'
  },
  {
    target: 20,
    suffix: '+',
    label: 'Categories',
    sublabel: 'Specialized hiring tracks',
    start: 5,
    accent: 'text-slate-800 dark:text-slate-100',
    glow: 'rgba(15,23,42,0.1)',
    bar: 'from-slate-700 to-slate-400'
  }
];

const StatPanel = ({ target, suffix, label, sublabel, start, accent, glow, bar, started, index }) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!started) return;
    const controls = animate(start, target, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (v) => setCount(Math.floor(v)),
    });
    return () => controls.stop();
  }, [started, start, target]);

  const display = count >= 1000
    ? `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}K`
    : count;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={started ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex-1 min-w-[180px] max-w-sm mx-auto w-full"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-5 md:p-7 flex flex-col gap-3 h-full shadow-sm hover:border-[#1A62FE]/40 transition-colors cursor-default">
        {/* Animated rise bar */}
        {started && (
          <div className="absolute left-0 bottom-0 w-1 rounded-full bg-gradient-to-t opacity-80" style={{ backgroundImage: `linear-gradient(to top, #1A62FE, transparent)` }}>
            <div className={`w-full bg-gradient-to-t ${bar} stat-rise`} />
          </div>
        )}

        {/* Micro-label */}
        <div className="flex items-center gap-2 relative z-10">
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${bar} shadow-sm`} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </span>
        </div>

        <div className="flex items-end gap-1 relative z-10 mt-1 mb-0.5">
          <span className={`text-4xl md:text-6xl font-black tracking-tight leading-none ${accent}`}>
            {display}
          </span>
          <span className={`text-xl md:text-3xl font-black mb-0.5 ${accent}`}>
            {suffix}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed relative z-10 mt-auto">
          {sublabel}
        </p>
      </div>
    </motion.div>
  );
};

const StatsStrip = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-12 md:py-20 bg-slate-50 dark:bg-[#0b0f14] border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300 overflow-hidden">
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-3.5 px-3.5 py-1.5 rounded-full bg-[#EFF3FF] dark:bg-[#1A62FE]/10 border border-[#1A62FE]/20 text-[#001F8E] dark:text-[#1A62FE] text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            <BarChart3 size={14} /> Platform Metrics
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3"
          >
            Scale & Impact at <span className="text-[#001F8E] dark:text-[#1A62FE]">Startaply</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 font-normal text-xs sm:text-sm md:text-base max-w-md mx-auto"
          >
            Transparent numbers powered by active employers and genuine hires.
          </motion.p>
        </div>

        {/* Floating Stat Panels */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-6 justify-center items-stretch">
          {stats.map((s, i) => (
            <StatPanel key={s.label} {...s} index={i} started={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsStrip;
