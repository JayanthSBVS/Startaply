import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';

const stats = [
  { target: 10000, suffix: '+', label: 'Verified Jobs', start: 9000 },
  { target: 500, suffix: '+', label: 'Top Companies', start: 450 },
  { target: 100, suffix: '%', label: 'Free Platform', start: 100 },
];

const StatItem = ({ target, suffix, label, start, started }) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (started) {
      const controls = animate(start, target, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate: (value) => setCount(Math.floor(value)),
      });
      return () => controls.stop();
    }
  }, [started, start, target]);

  const display = count >= 1000 ? `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}K` : count;

  return (
    <div className="relative text-center px-4 md:px-8 py-4 md:py-6 w-full md:w-auto flex-1 group">
      <div className="absolute inset-0 bg-emerald-400/0 group-hover:bg-emerald-400/10 rounded-[2rem] transition-colors duration-500" />
      <p className="text-3xl md:text-5xl font-black text-white mb-1 md:mb-2 tracking-tighter drop-shadow-md">
        {display}<span className="text-emerald-400">{suffix}</span>
      </p>
      <p className="text-[10px] md:text-sm font-bold text-emerald-100/80 uppercase tracking-widest whitespace-nowrap">
        {label}
      </p>
    </div>
  );
};

const StatsStrip = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div className="relative bg-emerald-950 dark:bg-slate-900 py-12 border-b border-emerald-900 dark:border-slate-800 transition-colors duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-5xl mx-auto grid grid-cols-2 md:flex md:flex-row justify-between items-center divide-y md:divide-y-0 md:divide-x divide-emerald-800/80 dark:divide-slate-800 bg-emerald-900/40 dark:bg-slate-900/60 backdrop-blur-md rounded-[2rem] border border-emerald-800/50 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        {stats.map((s, idx) => (
          <div key={s.label} className={`${idx === stats.length - 1 && stats.length % 2 !== 0 ? 'col-span-2' : 'col-span-1'} flex justify-center`}>
            <StatItem {...s} started={isInView} />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default StatsStrip;