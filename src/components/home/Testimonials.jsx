import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, Sparkles, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API = '/api';

// 6 precise orbit coordinates for Desktop
const ORBIT_POSITIONS = [
  "md:absolute md:top-[3%] md:left-[10%] lg:left-[15%] md:w-[320px]",
  "md:absolute md:top-[42%] md:left-[0%] lg:left-[3%] md:w-[300px]",
  "md:absolute md:bottom-[3%] md:left-[10%] lg:left-[15%] md:w-[320px]",
  "md:absolute md:top-[3%] md:right-[10%] lg:right-[15%] md:w-[320px]",
  "md:absolute md:top-[42%] md:right-[0%] lg:right-[3%] md:w-[300px]",
  "md:absolute md:bottom-[3%] md:right-[10%] lg:right-[15%] md:w-[320px]",
];

const FALLBACK_TESTIMONIALS = [
  { id: 'f1', name: 'Priya Sharma', tagline: 'Software Engineer', company: 'Google', description: 'Startaply completely transformed my job search. Within weeks, I landed interviews at top tech companies!', photo: '' },
  { id: 'f2', name: 'Rahul Desai', tagline: 'Product Manager', company: 'Microsoft', description: 'The preparation materials and exclusive Job Melas were the missing puzzle pieces in my career journey.', photo: '' },
  { id: 'f3', name: 'Ananya Gupta', tagline: 'Data Analyst', company: 'Amazon', description: 'I switched from a non-tech background to a high-paying data role thanks to the direct connections here.', photo: '' },
  { id: 'f4', name: 'Vikas Kumar', tagline: 'Frontend Developer', company: 'Meta', description: 'A premium experience that actually delivers. The verified listings and interview insights are pure gold.', photo: '' },
  { id: 'f5', name: 'Sneha Patel', tagline: 'UX Designer', company: 'Adobe', description: 'I never realized how much my portfolio was lacking until I attended the prep sessions. Highly recommended!', photo: '' },
  { id: 'f6', name: 'Rohan Mehta', tagline: 'Cloud Architect', company: 'AWS', description: 'The fastest way to accelerate your career. The curated opportunities are unmatched.', photo: '' }
];

// Desktop floating bubble
const DesktopBubble = ({ t, className, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        opacity: { duration: 0.7, delay: Math.min(index * 0.1, 0.4), ease: [0.16, 1, 0.3, 1] },
        scale: { duration: 0.7, delay: Math.min(index * 0.1, 0.4), ease: [0.16, 1, 0.3, 1] },
        y: { duration: 0.7, delay: Math.min(index * 0.1, 0.4), ease: [0.16, 1, 0.3, 1] }
      }}
      className={`group relative p-6 md:p-7 rounded-2xl bg-white dark:bg-slate-800/95 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-[#1A62FE]/40 dark:hover:border-[#1A62FE]/40 hover:shadow-xl transition-all flex flex-col hover:z-30 w-full ${className}`}
    >
      <div className="absolute -top-5 -left-4 w-12 h-12 rounded-2xl border-2 border-white dark:border-slate-800 shadow-md overflow-hidden bg-[#EFF3FF] dark:bg-[#1A62FE]/15 flex items-center justify-center group-hover:scale-105 transition-transform origin-bottom-right">
        {t.photo ? (
          <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-base text-[#001F8E] dark:text-[#1A62FE]">{t.name?.charAt(0) || '?'}</span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-slate-700 dark:text-slate-200 font-normal leading-relaxed text-xs lg:text-sm">
          "{t.description}"
        </p>
        <div className="mt-4 flex flex-col border-t border-slate-100 dark:border-slate-700/50 pt-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 dark:text-white text-xs tracking-tight">{t.name}</span>
            <CheckCircle2 size={12} className="text-[#1A62FE]" />
          </div>
          {t.tagline && <span className="text-[11px] font-medium text-[#001F8E] dark:text-[#1A62FE] mt-0.5">{t.tagline}</span>}
          {t.company && <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">{t.company}</span>}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Mobile: bubble composition ───────────────────────────────────────────
const MobileBubbleComposition = ({ testimonials }) => {
  const [activeFeatured, setActiveFeatured] = useState(0);

  const featured = testimonials[activeFeatured] || testimonials[0];
  const secondaries = testimonials.filter((_, i) => i !== activeFeatured).slice(0, 4);

  return (
    <div className="md:hidden px-4 pb-8 pt-2 space-y-4 relative z-20">
      {/* Featured Card */}
      <motion.div
        key={activeFeatured}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white dark:bg-slate-800/95 rounded-2xl p-6 shadow-md border border-slate-200/80 dark:border-slate-700/60"
      >
        <div className="absolute -top-4 -left-2 w-12 h-12 rounded-xl border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden bg-[#EFF3FF] dark:bg-[#1A62FE]/15 flex items-center justify-center">
          {featured.photo ? (
            <img src={featured.photo} alt={featured.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-base text-[#001F8E] dark:text-[#1A62FE]">{featured.name?.charAt(0)}</span>
          )}
        </div>

        <div className="mt-4">
          <p className="text-slate-700 dark:text-slate-200 font-normal leading-relaxed text-xs sm:text-sm">
            "{featured.description}"
          </p>
          <div className="mt-4 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700/50 pt-3">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">{featured.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {featured.tagline && <span className="text-[11px] font-medium text-[#001F8E] dark:text-[#1A62FE]">{featured.tagline}</span>}
                {featured.tagline && featured.company && <span className="text-slate-300 dark:text-slate-600">·</span>}
                {featured.company && <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{featured.company}</span>}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2×2 Mini Bubble Grid */}
      <div className="grid grid-cols-2 gap-3">
        {secondaries.map((t, i) => {
          const realIndex = testimonials.indexOf(t);
          return (
            <motion.button
              key={t.id || i}
              onClick={() => setActiveFeatured(realIndex)}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="relative text-left bg-white dark:bg-slate-800/80 rounded-xl p-3.5 shadow-sm border border-slate-200/80 dark:border-slate-700/50 active:scale-95 transition-transform"
              style={{ minHeight: '44px' }}
              aria-label={`View testimonial by ${t.name}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#EFF3FF] dark:bg-[#1A62FE]/15 flex items-center justify-center text-[#001F8E] dark:text-[#1A62FE] font-bold text-xs shrink-0 overflow-hidden">
                  {t.photo ? <img src={t.photo} alt={t.name} className="w-full h-full object-cover" /> : t.name?.charAt(0)}
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-[11px] truncate">{t.name}</p>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[10px] font-normal leading-relaxed line-clamp-2">
                "{t.description}"
              </p>
            </motion.button>
          );
        })}
      </div>

      <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">
        Tap a candidate card to view full story
      </p>
    </div>
  );
};

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/testimonials`)
      .then(res => {
        let data = Array.isArray(res.data) ? res.data : [];
        if (data.length < 6) {
          const needed = 6 - data.length;
          data = [...data, ...FALLBACK_TESTIMONIALS.slice(0, needed)];
        }
        setTestimonials(data.slice(0, 6));
      })
      .catch(() => setTestimonials(FALLBACK_TESTIMONIALS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-[#0b0f14] relative overflow-hidden transition-colors duration-300 border-b border-slate-200/80 dark:border-slate-800/80">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-10 md:mb-14 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 mb-3 px-3.5 py-1.5 rounded-full bg-[#EFF3FF] dark:bg-[#1A62FE]/10 border border-[#1A62FE]/20 text-[#001F8E] dark:text-[#1A62FE] text-xs font-bold uppercase tracking-wider"
        >
          <Sparkles size={13} /> Verified Success Stories
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm uppercase tracking-wider"
        >
          Real candidates who found their dream careers on Startaply
        </motion.p>
      </div>

      {/* MOBILE Layout */}
      {!loading && testimonials.length > 0 && (
        <MobileBubbleComposition testimonials={testimonials} />
      )}

      {/* DESKTOP Constellation */}
      <div className="hidden md:block relative max-w-[1400px] mx-auto px-4 md:px-8 min-h-[780px]">
        {/* Central Anchor */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        >
          <div className="max-w-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-slate-200/80 dark:border-slate-800 shadow-xl text-center">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
              Real candidates. <br />
              Verified hires. <br />
              <span className="text-[#001F8E] dark:text-[#1A62FE]">Measurable results.</span>
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-normal">
              Trusted by 50,000+ candidates who secured corporate opportunities through our platform.
            </p>
          </div>
        </motion.div>

        {/* Floating cards */}
        {!loading && testimonials.length > 0 && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div className="relative w-full h-full pointer-events-auto">
              {testimonials.map((t, index) => (
                <DesktopBubble
                  key={t.id || index}
                  t={t}
                  index={index}
                  className={ORBIT_POSITIONS[index] || ""}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
