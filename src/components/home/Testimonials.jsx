import React, { useState, useEffect } from 'react';
import { Quote, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API = '/api';

const BUBBLE_VARIANTS = [
  "md:w-[420px] md:-translate-y-12 z-10",
  "md:w-[340px] md:translate-y-20 md:-ml-8 lg:-ml-12 z-0",
  "md:w-[460px] md:-translate-y-8 md:ml-8 lg:ml-12 z-20",
  "md:w-[360px] md:translate-y-16 md:-mr-6 lg:-mr-10 z-0",
  "md:w-[400px] md:translate-y-4 md:ml-6 lg:ml-10 z-10",
  "md:w-[320px] md:translate-y-24 z-0"
];

const SkeletonBubble = ({ className }) => (
  <div className={`animate-pulse bg-white/50 dark:bg-slate-900/40 border border-white/40 dark:border-white/5 rounded-[2.5rem] p-8 md:p-10 ${className}`}>
    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full mb-6" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-3 w-full" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-3 w-5/6" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-8 w-4/6" />
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
      <div>
        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
        <div className="h-2.5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  </div>
);

const Bubble = ({ t, className, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.4), ease: "easeOut" }}
      className={`group relative bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_40px_rgb(0,0,0,0.3)] rounded-[2.5rem] p-8 md:p-10 transition-all duration-500 hover:-translate-y-1 hover:z-30 flex flex-col ${className}`}
    >
      {/* Subtle interior gradient for glass depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent rounded-[2.5rem] pointer-events-none" />
      
      {/* Watermark Quote */}
      <Quote size={48} className="text-emerald-500/10 dark:text-emerald-400/10 absolute top-6 right-8 rotate-180 pointer-events-none transition-colors group-hover:text-emerald-500/20 dark:group-hover:text-emerald-400/20" />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Story */}
        <p className="text-slate-700 dark:text-slate-300 text-lg md:text-[1.05rem] lg:text-[1.1rem] font-medium leading-relaxed mb-10 flex-1">
          "{t.description}"
        </p>

        {/* Profile */}
        <div className="flex items-center gap-4 mt-auto">
          {t.photo ? (
            <img
              src={t.photo}
              alt={t.name}
              className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-slate-800"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg ring-2 ring-white dark:ring-slate-800">
              {t.name?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{t.name}</h4>
            {t.tagline && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{t.tagline}</p>
            )}
            {t.company && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{t.company}</p>
            )}
          </div>
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
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle at 15% 30%, rgba(16,185,129,0.12) 0%, transparent 40%), radial-gradient(circle at 85% 70%, rgba(16,185,129,0.08) 0%, transparent 40%)' }}
      />

      <div className="max-w-[1400px] mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-16 md:mb-28 px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-emerald-100/50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-sm"
          >
            <Star size={12} />
            Success Stories
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6"
          >
            Real Career <span className="text-emerald-600 dark:text-emerald-400">Outcomes</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Discover how professionals transformed their careers and landed top roles through Startaply.
          </motion.p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="hidden md:flex flex-wrap justify-center items-center gap-8 px-8">
            <SkeletonBubble className="w-[400px] z-10" />
            <SkeletonBubble className="w-[340px] mt-24 -ml-8 z-0" />
            <SkeletonBubble className="w-[420px] -mt-12 ml-8 z-20" />
          </div>
        )}

        {/* Empty state */}
        {!loading && testimonials.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Quote size={28} className="text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Success stories coming soon.</p>
          </motion.div>
        )}

        {/* Testimonials Container */}
        {!loading && testimonials.length > 0 && (
          <>
            {/* Desktop Asymmetrical Layout */}
            <div className="hidden md:flex flex-wrap justify-center items-center gap-x-6 lg:gap-x-10 gap-y-12 lg:gap-y-16 px-8 py-8">
              {testimonials.map((t, i) => {
                const variant = BUBBLE_VARIANTS[i % BUBBLE_VARIANTS.length];
                return <Bubble key={t.id} t={t} className={variant} index={i} />;
              })}
            </div>

            {/* Mobile Horizontal Carousel */}
            <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-5 px-6 pb-16 pt-4 no-scrollbar">
              {testimonials.map((t, i) => (
                <div key={t.id} className="snap-center shrink-0 w-[85vw] max-w-[340px]">
                  <Bubble t={t} className="w-full h-full" index={i} />
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </section>
  );
};

export default Testimonials;
