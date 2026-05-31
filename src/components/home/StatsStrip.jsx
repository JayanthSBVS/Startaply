import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';

const stats = [
  {
    target: 10000,
    suffix: '+',
    label: 'Verified Jobs',
    sublabel: 'Manually reviewed opportunities',
    start: 9000,
    accent: 'text-gradient-emerald',
    glow: 'rgba(16,185,129,0.15)',
    bar: 'from-emerald-500 to-emerald-300'
  },
  {
    target: 500,
    suffix: '+',
    label: 'Partner Companies',
    sublabel: 'Trusted industry employers',
    start: 450,
    accent: 'text-gradient-emerald-cyan',
    glow: 'rgba(6,182,212,0.15)',
    bar: 'from-cyan-500 to-blue-400'
  },
  {
    target: 100,
    suffix: '%',
    label: 'Free Platform',
    sublabel: 'Zero fees, zero paywalls',
    start: 100,
    accent: 'text-gradient-indigo-emerald',
    glow: 'rgba(99,102,241,0.15)',
    bar: 'from-indigo-500 to-emerald-400'
  },
  {
    target: 15,
    suffix: '+',
    label: 'Categories',
    sublabel: 'Roles for every career path',
    start: 5,
    accent: 'text-gradient-premium',
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
      initial={{ opacity: 0, y: 40 }}
      animate={started ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex-1 min-w-[220px] max-w-sm mx-auto w-full"
    >
      {/* ── Premium Surface Card ── */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl premium-surface p-5 md:p-8 flex flex-col gap-3 md:gap-4 h-full cursor-default">
        
        {/* Animated rise line */}
        {started && (
          <div className="absolute left-0 bottom-0 w-1 rounded-full bg-gradient-to-t opacity-80" style={{ backgroundImage: `linear-gradient(to top, var(--emerald), transparent)` }}>
            <div className={`w-full bg-gradient-to-t ${bar} stat-rise`} />
          </div>
        )}

        {/* Ambient glow behind card content */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-multiply dark:mix-blend-screen"
          style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }}
        />

        {/* Micro-label */}
        <div className="flex items-center gap-2 relative z-10">
          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${bar} shadow-sm`} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {label}
          </span>
        </div>

        <div className="flex items-end gap-1 relative z-10 mt-1 mb-0.5 md:mt-2 md:mb-1">
          <span className={`text-4xl md:text-7xl font-black tracking-tighter leading-[0.85] ${accent}`}>
            {display}
          </span>
          <span className={`text-xl md:text-4xl font-black mb-1 ${accent}`}>
            {suffix}
          </span>
        </div>

        <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed relative z-10 mt-auto">
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
    <section className="relative py-10 md:py-20 section-surface border-b border-slate-200/60 dark:border-slate-800/50 transition-colors duration-500 overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] rounded-full opacity-30 dark:opacity-20 mix-blend-multiply dark:mix-blend-screen"
          style={{ backgroundImage: 'var(--orb-emerald)', filter: 'blur(80px)' }}
        />
      </div>

      <div ref={ref} className="relative z-10 max-w-[90rem] mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">Platform Scale</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3 md:mb-4"
          >
            Numbers That <span className="text-gradient-emerald">Matter</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-lg max-w-lg mx-auto"
          >
            Real data. Real opportunities. Real growth.
          </motion.p>
        </div>

        {/* Floating Stat Panels */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 justify-center items-stretch">
          {stats.map((s, i) => (
            <StatPanel key={s.label} {...s} index={i} started={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsStrip;
