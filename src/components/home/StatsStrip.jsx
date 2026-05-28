import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';

const stats = [
  {
    target: 10000,
    suffix: '+',
    label: 'Verified Jobs',
    sublabel: 'Manually reviewed listings',
    start: 9000,
    accent: 'from-emerald-500 to-teal-400',
    glow: 'rgba(16,185,129,0.2)',
  },
  {
    target: 500,
    suffix: '+',
    label: 'Partner Companies',
    sublabel: 'Trusted industry employers',
    start: 450,
    accent: 'from-blue-500 to-cyan-400',
    glow: 'rgba(6,182,212,0.2)',
  },
  {
    target: 100,
    suffix: '%',
    label: 'Free Platform',
    sublabel: 'Zero fees, zero paywalls',
    start: 100,
    accent: 'from-emerald-400 to-teal-300',
    glow: 'rgba(16,185,129,0.15)',
  },
];

const StatPanel = ({ target, suffix, label, sublabel, start, accent, glow, started, index }) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!started) return;
    const controls = animate(start, target, {
      duration: 1.8,
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
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="stat-panel group relative flex-1 min-w-[240px] max-w-sm mx-auto"
    >
      {/* Card */}
      <div
        className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 backdrop-blur-md p-8 md:p-10 flex flex-col gap-4 cursor-default"
        style={{ boxShadow: `0 0 40px ${glow}, 0 8px 32px rgba(0,0,0,0.08)` }}
      >
        {/* Top gradient accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent} opacity-80`} />

        {/* Background glow */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }}
        />

        {/* Micro-label */}
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${accent}`} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500">
            {label}
          </span>
        </div>

        {/* Big number */}
        <div className="flex items-end gap-0.5">
          <span className={`text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-gradient-to-br ${accent} bg-clip-text leading-none`}>
            {display}
          </span>
          <span className={`text-3xl md:text-4xl font-black text-transparent bg-gradient-to-br ${accent} bg-clip-text mb-1`}>
            {suffix}
          </span>
        </div>

        {/* Sublabel */}
        <p className="text-sm text-slate-500 dark:text-slate-500 font-medium">{sublabel}</p>
      </div>
    </motion.div>
  );
};

const StatsStrip = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="relative py-16 md:py-24 bg-slate-50 dark:bg-[#020617] overflow-hidden border-b border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
      </div>

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-500">Platform Impact</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Numbers That <span className="text-gradient-emerald">Matter</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
            Real data. Real opportunities. Real growth.
          </p>
        </div>

        {/* Stat panels */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
          {stats.map((s, i) => (
            <StatPanel key={s.label} {...s} index={i} started={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsStrip;