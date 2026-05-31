import React, { useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import axios from 'axios';

const API = '/api';

// 6 precise orbit coordinates for Desktop
const ORBIT_POSITIONS = [
  "md:absolute md:top-[2%] md:left-[12%] lg:left-[18%] md:w-[320px]",
  "md:absolute md:top-[42%] md:left-[0%] lg:left-[2%] md:w-[300px]",
  "md:absolute md:bottom-[2%] md:left-[12%] lg:left-[18%] md:w-[320px]",
  "md:absolute md:top-[2%] md:right-[12%] lg:right-[18%] md:w-[320px]",
  "md:absolute md:top-[42%] md:right-[0%] lg:right-[2%] md:w-[300px]",
  "md:absolute md:bottom-[2%] md:right-[12%] lg:right-[18%] md:w-[320px]",
];

const FALLBACK_TESTIMONIALS = [
  { id: 'f1', name: 'Priya Sharma', tagline: 'Software Engineer', company: 'Google', description: 'Startaply completely transformed my job search. Within weeks, I landed interviews at top tech companies!', photo: '' },
  { id: 'f2', name: 'Rahul Desai', tagline: 'Product Manager', company: 'Microsoft', description: 'The preparation materials and exclusive Job Melas were the missing puzzle pieces in my career journey.', photo: '' },
  { id: 'f3', name: 'Ananya Gupta', tagline: 'Data Analyst', company: 'Amazon', description: 'I switched from a non-tech background to a high-paying data role thanks to the direct connections here.', photo: '' },
  { id: 'f4', name: 'Vikas Kumar', tagline: 'Frontend Developer', company: 'Meta', description: 'A premium experience that actually delivers. The insights are pure gold.', photo: '' },
  { id: 'f5', name: 'Sneha Patel', tagline: 'UX Designer', company: 'Adobe', description: 'I never realized how much my portfolio was lacking until I attended the prep sessions. Highly recommended!', photo: '' },
  { id: 'f6', name: 'Rohan Mehta', tagline: 'Cloud Architect', company: 'AWS', description: 'The fastest way to accelerate your career. The curated opportunities are unmatched.', photo: '' }
];

const Avatar = ({ t, size = 'md' }) => {
  const cls = size === 'lg'
    ? 'w-16 h-16 border-[4px]'
    : 'w-12 h-12 md:w-14 md:h-14 border-[3px] md:border-[4px]';
  return (
    <div className={`${cls} rounded-full border-slate-50 dark:border-[#0b0f14] shadow-md overflow-hidden bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0`}>
      {t.photo ? (
        <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
      ) : (
        <span className={`font-black ${size === 'lg' ? 'text-2xl' : 'text-lg'} text-emerald-600 dark:text-emerald-400`}>
          {t.name?.charAt(0) || '?'}
        </span>
      )}
    </div>
  );
};

// Desktop floating bubble — unchanged from original
const DesktopBubble = ({ t, className, index }) => {
  const shouldReduceMotion = useReducedMotion();
  const floatY = index % 2 === 0 ? [-8, 8, -8] : [8, -8, 8];
  const floatX = index % 3 === 0 ? [-4, 4, -4] : [4, -4, 4];
  const duration = 5 + (index % 3) * 1.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      animate={shouldReduceMotion ? {} : {
        y: floatY,
        x: floatX,
        rotateZ: index % 2 === 0 ? [-1, 1, -1] : [1, -1, 1]
      }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        opacity: { duration: 0.8, delay: Math.min(index * 0.1, 0.5), ease: [0.16, 1, 0.3, 1] },
        scale: { duration: 0.8, delay: Math.min(index * 0.1, 0.5), ease: [0.16, 1, 0.3, 1] },
        y: { duration, repeat: Infinity, ease: "easeInOut" },
        x: { duration: duration + 1, repeat: Infinity, ease: "easeInOut" },
        rotateZ: { duration: duration + 2, repeat: Infinity, ease: "easeInOut" }
      }}
      className={`group relative p-6 md:p-7 lg:p-8 rounded-[2.5rem] bg-white dark:bg-slate-800/95 shadow-[0_10px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_10px_40px_rgb(0,0,0,0.4)] border border-slate-100 dark:border-slate-700/60 hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgb(0,0,0,0.6)] flex flex-col hover:z-30 w-full ${className}`}
    >
      <div className="absolute -top-6 -left-4 md:-left-6 w-14 h-14 md:w-16 md:h-16 rounded-full border-[4px] md:border-[5px] border-slate-50 dark:border-[#0b0f14] shadow-md overflow-hidden bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 origin-bottom-right">
        {t.photo ? (
          <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-black text-xl text-emerald-600 dark:text-emerald-400">{t.name?.charAt(0) || '?'}</span>
        )}
      </div>
      <div className="mt-4 md:mt-2">
        <p className="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed text-[14px] lg:text-[15px]">
          "{t.description}"
        </p>
        <div className="mt-6 flex flex-col border-t border-slate-100 dark:border-slate-700/50 pt-4">
          <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{t.name}</span>
          {t.tagline && <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{t.tagline}</span>}
          {t.company && <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1">{t.company}</span>}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Mobile: bubble composition (NOT a carousel) ───────────────────────────
// Layout: Featured bubble (full-width, prominent) + 2×2 mini bubbles below
// Preserves the "floating social proof" identity in a mobile-native composition
const MobileBubbleComposition = ({ testimonials }) => {
  const [activeFeatured, setActiveFeatured] = useState(0);

  const featured = testimonials[activeFeatured];
  const secondaries = testimonials.filter((_, i) => i !== activeFeatured).slice(0, 4);

  return (
    <div className="md:hidden px-4 pb-8 pt-4 space-y-4 relative z-20">
      {/* ── Featured Bubble ── */}
      <motion.div
        key={activeFeatured}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white dark:bg-slate-800/95 rounded-[2rem] p-6 shadow-[0_10px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgb(0,0,0,0.4)] border border-slate-100 dark:border-slate-700/60"
      >
        {/* Avatar — offset top-left like desktop bubbles */}
        <div className="absolute -top-5 -left-2 w-14 h-14 rounded-full border-[3px] border-slate-50 dark:border-[#0b0f14] shadow-md overflow-hidden bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          {featured.photo ? (
            <img src={featured.photo} alt={featured.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-black text-xl text-emerald-600 dark:text-emerald-400">{featured.name?.charAt(0)}</span>
          )}
        </div>

        <div className="mt-5">
          <p className="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed text-[14px]">
            "{featured.description}"
          </p>
          <div className="mt-5 flex items-center gap-3 border-t border-slate-100 dark:border-slate-700/50 pt-4">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{featured.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {featured.tagline && <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">{featured.tagline}</span>}
                {featured.tagline && featured.company && <span className="text-slate-300 dark:text-slate-600">·</span>}
                {featured.company && <span className="text-[11px] font-black uppercase tracking-wide text-slate-400">{featured.company}</span>}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 2×2 Mini Bubble Grid ── */}
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
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="relative text-left bg-white dark:bg-slate-800/80 rounded-[1.5rem] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.3)] border border-slate-100 dark:border-slate-700/50 active:scale-95 transition-transform"
              style={{ minHeight: '44px' }}
            >
              {/* Small avatar */}
              <div className="absolute -top-3 -left-1.5 w-9 h-9 rounded-full border-2 border-slate-50 dark:border-[#0b0f14] shadow-sm overflow-hidden bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                {t.photo ? (
                  <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">{t.name?.charAt(0)}</span>
                )}
              </div>
              <div className="mt-3">
                <p className="text-slate-700 dark:text-slate-300 text-[11px] font-medium leading-relaxed line-clamp-3">
                  "{t.description}"
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                  <p className="font-bold text-slate-900 dark:text-white text-[11px]">{t.name}</p>
                  {t.tagline && <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{t.tagline}</p>}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ── Tap-to-feature hint ── */}
      <p className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pt-1">
        Tap a card to read more
      </p>
    </div>
  );
};

const SkeletonBubble = ({ className }) => (
  <div className={`relative p-6 md:p-8 rounded-[2.5rem] bg-white/60 dark:bg-slate-800/60 backdrop-blur-md shadow-sm border border-slate-100 dark:border-slate-700/50 animate-pulse ${className}`}>
    <div className="absolute -top-5 -left-5 w-14 h-14 rounded-full border-4 border-slate-50 dark:border-[#0b0f14] bg-slate-200 dark:bg-slate-700" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mt-4 mb-2" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 mb-6" />
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
  </div>
);

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
    <section className="py-12 md:py-24 bg-slate-50 dark:bg-[#0b0f14] relative overflow-hidden transition-colors duration-500 border-y border-slate-200/50 dark:border-slate-800/50">
      {/* Outer Section Header */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-8 md:mb-12 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 mb-3 md:mb-4 px-3 py-1 rounded-full bg-emerald-100/60 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]"
        >
          Success Stories
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-base uppercase tracking-widest"
        >
          Hear from people who found their path
        </motion.p>
      </div>

      {/* ── MOBILE: Bubble Composition ──────────────────────────────────── */}
      {!loading && testimonials.length > 0 && (
        <MobileBubbleComposition testimonials={testimonials} />
      )}

      {/* ── DESKTOP: Original orbit layout ──────────────────────────────── */}
      <div className="hidden md:block relative max-w-[1400px] mx-auto px-4 md:px-8 min-h-[900px]">
        {/* Central Headline Anchor */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        >
          <div className="max-w-xl lg:max-w-2xl bg-slate-50/80 dark:bg-[#0b0f14]/80 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-[0_0_100px_rgba(255,255,255,0.8)] dark:shadow-[0_0_100px_rgba(11,15,20,0.8)]">
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
          </div>
        </motion.div>

        {/* Floating Bubble Constellation */}
        {!loading && testimonials.length > 0 && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div className="relative w-full h-full pointer-events-auto">
              {testimonials.map((t, i) => {
                const isOrbit = i < ORBIT_POSITIONS.length;
                const posClass = isOrbit
                  ? ORBIT_POSITIONS[i]
                  : "md:relative md:w-[320px] md:mx-auto mt-12";
                return <DesktopBubble key={t.id || i} t={t} index={i} className={posClass} />;
              })}
            </div>
          </div>
        )}

        {/* Loading State — desktop only */}
        {loading && (
          <div className="absolute inset-0 z-20">
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
