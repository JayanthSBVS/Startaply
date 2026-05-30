import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API = '/api';

// 6 precise orbit coordinates that absolutely avoid the center max-w-2xl area
const ORBIT_POSITIONS = [
  "md:absolute md:top-[5%] md:left-[2%] lg:left-[5%] md:w-[320px]",   // Top Left
  "md:absolute md:bottom-[10%] md:right-[2%] lg:right-[5%] md:w-[340px]", // Bottom Right
  "md:absolute md:bottom-[5%] md:left-[5%] lg:left-[8%] md:w-[300px]",  // Bottom Left
  "md:absolute md:top-[8%] md:right-[5%] lg:right-[8%] md:w-[320px]",   // Top Right
  "md:absolute md:top-[45%] md:left-[2%] lg:left-[3%] md:w-[280px]",    // Middle Left (pushed to edge)
  "md:absolute md:top-[40%] md:right-[2%] lg:right-[3%] md:w-[300px]",   // Middle Right (pushed to edge)
];

const FALLBACK_TESTIMONIALS = [
  { id: 'f1', name: 'Priya Sharma', tagline: 'Software Engineer', company: 'Google', description: 'Startaply completely transformed my job search. Within weeks, I landed interviews at top tech companies!', photo: '' },
  { id: 'f2', name: 'Rahul Desai', tagline: 'Product Manager', company: 'Microsoft', description: 'The preparation materials and exclusive Job Melas were the missing puzzle pieces in my career journey.', photo: '' },
  { id: 'f3', name: 'Ananya Gupta', tagline: 'Data Analyst', company: 'Amazon', description: 'I switched from a non-tech background to a high-paying data role thanks to the direct connections here.', photo: '' },
  { id: 'f4', name: 'Vikas Kumar', tagline: 'Frontend Developer', company: 'Meta', description: 'A premium experience that actually delivers. The insights are pure gold.', photo: '' },
  { id: 'f5', name: 'Sneha Patel', tagline: 'UX Designer', company: 'Adobe', description: 'I never realized how much my portfolio was lacking until I attended the prep sessions. Highly recommended!', photo: '' }
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
      className={`group relative p-6 md:p-7 lg:p-8 rounded-[2.5rem] bg-white dark:bg-slate-800/95 backdrop-blur-xl shadow-[0_10px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_10px_40px_rgb(0,0,0,0.4)] border border-slate-100 dark:border-slate-700/60 hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgb(0,0,0,0.6)] flex flex-col hover:z-30 w-full ${className}`}
    >
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
        <p className="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed text-[14px] lg:text-[15px]">
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
        let data = Array.isArray(res.data) ? res.data : [];
        // Ensure at least 5 testimonials using fallbacks
        if (data.length < 5) {
          const needed = 5 - data.length;
          data = [...data, ...FALLBACK_TESTIMONIALS.slice(0, needed)];
        }
        setTestimonials(data);
      })
      .catch(() => setTestimonials(FALLBACK_TESTIMONIALS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 md:py-32 bg-slate-50 dark:bg-[#0b0f14] relative overflow-hidden transition-colors duration-500 border-y border-slate-200/50 dark:border-slate-800/50">
      
      {/* Outer Section Header */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-12 relative z-20">
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

      {/* Inner Canvas (Absolute positioning wrapper for Desktop) */}
      <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 min-h-[500px] md:min-h-[850px] flex flex-col justify-center items-center">
        
        {/* Central Headline Anchor (Centered securely, no overlap) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 pointer-events-none mb-16 md:mb-0 max-w-xl lg:max-w-2xl bg-slate-50/80 dark:bg-[#0b0f14]/80 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-[0_0_100px_rgba(255,255,255,0.8)] dark:shadow-[0_0_100px_rgba(11,15,20,0.8)]"
        >
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl lg:text-[4.5rem] font-black text-slate-900 dark:text-white tracking-tighter leading-[1.05] mb-6">
              Real opportunities.<br />
              Real careers.<br />
              <span className="text-emerald-600 dark:text-emerald-400">Real results.</span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-slate-500 dark:text-slate-400 font-medium">
              Built by thousands who switched and never looked back.
            </p>
          </div>
        </motion.div>

        {/* Floating Bubble Constellation (Desktop Absolute Positioning) */}
        {!loading && testimonials.length > 0 && (
          <div className="hidden md:block absolute inset-0 z-20 pointer-events-none">
            <div className="relative w-full h-full pointer-events-auto">
              {testimonials.map((t, i) => {
                // If more than ORBIT_POSITIONS, flow them below (not orbiting)
                const isOrbit = i < ORBIT_POSITIONS.length;
                const posClass = isOrbit 
                  ? ORBIT_POSITIONS[i] 
                  : "md:relative md:w-[320px] md:mx-auto mt-12"; 

                return <Bubble key={t.id || i} t={t} index={i} className={posClass} />;
              })}
            </div>
          </div>
        )}

        {/* Staggered Flow (Mobile) */}
        {!loading && testimonials.length > 0 && (
          <div className="md:hidden flex flex-col gap-14 relative z-20 pt-8 pb-12 w-full">
            {testimonials.map((t, i) => (
              <div key={t.id || i} className={`${i % 2 === 0 ? 'mr-6 ml-2' : 'ml-6 mr-2'}`}>
                <Bubble t={t} index={i} className="w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="hidden md:block absolute inset-0 z-20">
            <SkeletonBubble className={ORBIT_POSITIONS[0]} />
            <SkeletonBubble className={ORBIT_POSITIONS[1]} />
            <SkeletonBubble className={ORBIT_POSITIONS[2]} />
          </div>
        )}

      </div>
    </section>
  );
};

export default Testimonials;
