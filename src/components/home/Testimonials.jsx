import React, { useState, useEffect } from 'react';
import { Quote, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API = '/api';

const SkeletonCard = ({ wide }) => (
  <div className={`animate-pulse premium-surface rounded-[2rem] p-8 ${wide ? 'md:col-span-2' : ''}`}>
    <div className="w-16 h-3 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-3 w-full" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-3 w-5/6" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-8 w-4/6" />
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
      <div>
        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-1.5" />
        <div className="h-2.5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  </div>
);

// Accent colours cycle
const ACCENTS = ['emerald', 'indigo', 'amber'];

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
    <section className="py-24 section-surface border-y border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden transition-colors duration-500">
      {/* Subtle background mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(16,185,129,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(99,102,241,0.06) 0%, transparent 60%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <Star size={12} />
            Real Stories
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4"
          >
            Career <span className="text-gradient-emerald">Transformations</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-xl mx-auto"
          >
            Real stories from professionals who found their next opportunity through Startaply.
          </motion.p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard wide />
            <SkeletonCard />
          </div>
        )}

        {/* Empty state */}
        {!loading && testimonials.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Quote size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Success stories coming soon.</p>
          </motion.div>
        )}

        {/* Testimonial cards */}
        {!loading && testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => {
              const accent = ACCENTS[i % ACCENTS.length];
              const isWide = i === 0;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`premium-surface p-8 rounded-[2rem] flex flex-col relative group hover:-translate-y-1 transition-all duration-300 ${isWide ? 'md:col-span-2' : 'col-span-1'}`}
                >
                  {/* Giant watermark quote */}
                  <div className="absolute top-6 right-8 text-slate-100 dark:text-slate-800/60 group-hover:text-emerald-50 dark:group-hover:text-emerald-900/20 transition-colors pointer-events-none">
                    <Quote size={72} className="rotate-180" />
                  </div>

                  <div className="relative z-10">
                    {/* Accent tag from tagline */}
                    {t.tagline && (
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider mb-6 bg-${accent}-50 dark:bg-${accent}-500/10 text-${accent}-600 dark:text-${accent}-400 border border-${accent}-100 dark:border-${accent}-500/20`}>
                        <Star size={10} />
                        {t.tagline}
                      </div>
                    )}

                    {/* Quote */}
                    <p className={`text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-8 ${isWide ? 'text-lg md:text-xl' : 'text-base'}`}>
                      "{t.description}"
                    </p>
                  </div>

                  {/* Author */}
                  <div className="mt-auto flex items-center gap-4 relative z-10">
                    {t.photo ? (
                      <img
                        src={t.photo}
                        alt={t.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20 dark:ring-emerald-500/30 shadow-sm"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full bg-${accent}-100 dark:bg-${accent}-500/10 flex items-center justify-center text-${accent}-600 dark:text-${accent}-400 font-black text-lg`}>
                        {t.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-sm">{t.name}</h4>
                      {t.tagline && (
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{t.tagline}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default Testimonials;
