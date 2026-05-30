import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API = '/api';

const GRID_POSITIONS = [
  "col-span-4 col-start-1 row-start-1 justify-self-start mt-8", // 0: Top Left
  "col-span-3 col-start-10 row-start-2 justify-self-end mt-12", // 1: Middle Right
  "col-span-4 col-start-2 row-start-3 justify-self-start mt-8", // 2: Bottom Left
  "col-span-4 col-start-9 row-start-1 justify-self-end -mt-4", // 3: Top Right
  "col-span-3 col-start-1 row-start-2 justify-self-start -mt-8",// 4: Middle Left
  "col-span-4 col-start-9 row-start-3 justify-self-end mt-4", // 5: Bottom Right
  "col-span-4 col-start-5 row-start-1 justify-self-center -mt-16",// 6: Top Center
  "col-span-4 col-start-5 row-start-3 justify-self-center mt-16", // 7: Bottom Center
];

const SkeletonBubble = ({ className }) => (
  <div className={`relative p-6 md:p-8 rounded-[2.5rem] bg-white/60 dark:bg-slate-800/60 backdrop-blur-md shadow-sm border border-slate-100 dark:border-slate-700/50 animate-pulse ${className}`}>
    <div className="absolute -top-5 -left-5 w-14 h-14 rounded-full border-4 border-slate-50 dark:border-[#0b0f14] bg-slate-200 dark:bg-slate-700" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mt-4 mb-2" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 mb-6" />
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
  </div>
);

const Bubble = ({ t, className, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, delay: Math.min(index * 0.1, 0.5), ease: [0.16, 1, 0.3, 1] }}
      className={`group relative p-6 md:p-8 rounded-[2.5rem] bg-white dark:bg-slate-800/95 backdrop-blur-xl shadow-[0_10px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_10px_40px_rgb(0,0,0,0.4)] border border-slate-100 dark:border-slate-700/60 hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgb(0,0,0,0.6)] flex flex-col hover:z-30 w-full ${className}`}
    >
      {/* Floating Avatar */}
      <div className="absolute -top-6 -left-4 md:-left-6 w-14 h-14 md:w-16 md:h-16 rounded-full border-[4px] md:border-[5px] border-slate-50 dark:border-[#0b0f14] shadow-md overflow-hidden bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 origin-bottom-right">
        {t.photo ? (
          <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-black text-xl text-emerald-600 dark:text-emerald-400">
            {t.name?.charAt(0) || '?'}
          </span>
        )}
      </div>

      <div className="mt-4 md:mt-2">
        <p className="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed text-[15px] md:text-base">
          "{t.description}"
        </p>
        
        <div className="mt-6 flex flex-col border-t border-slate-100 dark:border-slate-700/50 pt-4">
          <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{t.name}</span>
          {t.tagline && (
            <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{t.tagline}</span>
          )}
          {t.company && (
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1">{t.company}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/testimonials`)
      .then(res => {
        setTestimonials(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 md:py-32 bg-slate-50 dark:bg-[#0b0f14] relative overflow-hidden transition-colors duration-500 border-y border-slate-200/50 dark:border-slate-800/50">
      
      {/* Outer Section Header */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-16 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-emerald-100/60 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]"
        >
          Success Stories
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base uppercase tracking-widest"
        >
          Hear from people who found their path
        </motion.p>
      </div>

      {/* Inner Canvas */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 min-h-[500px] md:min-h-[800px] flex flex-col justify-center">
        
        {/* Central Headline Anchor */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative md:absolute md:inset-0 flex flex-col items-center justify-center text-center z-10 pointer-events-none mb-16 md:mb-0"
        >
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-5xl md:text-6xl lg:text-[5rem] font-black text-slate-900 dark:text-white tracking-tighter leading-[1.05] mb-6">
              Real opportunities.<br />
              Real careers.<br />
              <span className="text-emerald-600 dark:text-emerald-400">Real results.</span>
            </h2>
            <p className="text-lg md:text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
              Built by thousands who switched and never looked back.
            </p>
          </div>
        </motion.div>

        {/* Floating Bubble Constellation (Desktop) */}
        {!loading && testimonials.length > 0 && (
          <div className="hidden md:grid grid-cols-12 gap-x-6 lg:gap-x-12 gap-y-16 lg:gap-y-24 items-center relative z-20 py-12">
            {testimonials.map((t, i) => {
              const gridPos = i < GRID_POSITIONS.length ? GRID_POSITIONS[i] : "col-span-4 mt-12";
              return <Bubble key={t.id} t={t} index={i} className={gridPos} />;
            })}
          </div>
        )}

        {/* Staggered Flow (Mobile) */}
        {!loading && testimonials.length > 0 && (
          <div className="md:hidden flex flex-col gap-14 relative z-20 pt-8 pb-12">
            {testimonials.map((t, i) => (
              <div key={t.id} className={`${i % 2 === 0 ? 'mr-6 ml-2' : 'ml-6 mr-2'}`}>
                <Bubble t={t} index={i} className="w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="hidden md:grid grid-cols-12 gap-x-8 gap-y-16 items-center relative z-20">
            <SkeletonBubble className="col-span-4 col-start-1 row-start-1" />
            <SkeletonBubble className="col-span-3 col-start-10 row-start-2" />
            <SkeletonBubble className="col-span-4 col-start-2 row-start-3" />
          </div>
        )}

        {/* Empty State */}
        {!loading && testimonials.length === 0 && (
          <div className="relative z-20 text-center py-20 bg-white/40 dark:bg-slate-800/30 rounded-3xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 max-w-xl mx-auto mt-12 md:mt-0">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Stories are currently being curated.</p>
          </div>
        )}

      </div>
    </section>
  );
};

export default Testimonials;
