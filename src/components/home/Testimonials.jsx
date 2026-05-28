import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion, useInView } from 'framer-motion';
import { Star, Quote, ArrowUpRight } from 'lucide-react';

const DUMMY_TESTIMONIALS = [
  { id: 1, name: 'Rahul K.', tagline: 'Warehouse Manager', company: 'Amazon', description: 'Got placed in an Amazon warehouse within 2 days of applying. The Gig & Services category made finding blue-collar work super easy!', photo: '' },
  { id: 2, name: 'Priya S.', tagline: 'Frontend Developer', company: 'Infosys', description: 'As a fresher, finding the first job is hard. Startaply made it seamless. Got multiple offers without paying a single rupee to consultancies.', photo: '' },
  { id: 3, name: 'Amit V.', tagline: 'Delivery Partner', company: 'Zepto', description: 'Found a great gig with Zepto through this platform. Weekly payouts, flexible timings, and the application took 1 minute.', photo: '' },
  { id: 4, name: 'Sneha M.', tagline: 'Govt Job Aspirant', company: 'State Board', description: 'The updates on govt job melas are incredibly fast and accurate. I secured my position in the state board thanks to their alerts.', photo: '' },
  { id: 5, name: 'Ravi T.', tagline: 'Professional Plumber', company: 'Urban Company', description: 'Partnered with Urban Company through the Gig Works section. My earnings have doubled since I started getting direct leads.', photo: '' },
  { id: 6, name: 'Anita D.', tagline: 'HR Executive', company: 'TCS', description: 'Found my dream corporate role without creating a 10-page profile. This platform respects your time. Highly recommended.', photo: '' },
];

const CACHE_KEY = 'startaply_testimonials';
const CACHE_TTL = 5 * 60 * 1000;

function readTestimonialsCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return Array.isArray(data) && data.length >= 4 ? data : null;
  } catch { return null; }
}

function writeTestimonialsCache(data) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch { /* quota */ }
}

const AVATAR_GRADIENTS = [
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-cyan-500',
  'from-violet-400 to-purple-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-emerald-500 to-cyan-400',
];

const TestimonialCard = ({ t, idx, large = false }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const grad = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/60 backdrop-blur-md rounded-3xl overflow-hidden hover:border-emerald-300/40 dark:hover:border-emerald-700/30 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300 cursor-default ${large ? 'p-8 md:p-10' : 'p-7'}`}
    >
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/40 via-teal-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Big quote glyph — background decoration */}
      <div className="absolute top-4 right-6 text-[80px] font-black text-slate-100 dark:text-slate-800/80 leading-none pointer-events-none select-none group-hover:text-emerald-100/50 dark:group-hover:text-emerald-900/30 transition-colors duration-300 font-serif">
        "
      </div>

      {/* Stars */}
      <div className="flex gap-1 mb-5">
        {[1, 2, 3, 4, 5].map(s => (
          <Star key={s} size={14} className="text-amber-400 fill-amber-400" />
        ))}
      </div>

      {/* Quote text */}
      <p className={`relative z-10 text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-6 ${large ? 'text-lg md:text-xl line-clamp-4' : 'text-sm md:text-base line-clamp-3'}`}>
        "{t.description}"
      </p>

      {/* Divider */}
      <div className="border-t border-slate-100 dark:border-slate-800/60 pt-5">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className={`shrink-0 ${large ? 'w-14 h-14' : 'w-11 h-11'} rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-black shadow-[0_4px_16px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] border-2 border-white dark:border-slate-800 overflow-hidden`}>
            {t.photo ? (
              <img src={t.photo} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <span className={large ? 'text-2xl' : 'text-lg'}>{t.name?.charAt(0) || 'U'}</span>
            )}
          </div>

          <div className="min-w-0">
            <h4 className="font-black text-slate-900 dark:text-white text-sm md:text-base">{t.name}</h4>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{t.tagline}</span>
              {t.company && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">{t.company}</span>
                </>
              )}
            </div>
          </div>

          <div className="ml-auto shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-500 transition-all duration-200">
            <ArrowUpRight size={14} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TestimonialSkeleton = () => (
  <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-7 border border-slate-200 dark:border-slate-800 animate-pulse">
    <div className="flex gap-1 mb-5">
      {[1,2,3,4,5].map(i => <div key={i} className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700" />)}
    </div>
    <div className="space-y-2 mb-6">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6" />
    </div>
    <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex items-center gap-3">
      <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16" />
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState(() => readTestimonialsCache() || []);
  const [fetching, setFetching] = useState(testimonials.length === 0);

  useEffect(() => {
    const cached = readTestimonialsCache();
    if (cached) { setTestimonials(cached); setFetching(false); return; }
    axios.get('/api/testimonials')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length >= 4) {
          setTestimonials(res.data);
          writeTestimonialsCache(res.data);
        } else { setTestimonials(DUMMY_TESTIMONIALS); }
      })
      .catch(() => setTestimonials(DUMMY_TESTIMONIALS))
      .finally(() => setFetching(false));
  }, []);

  const safeTestimonials = Array.isArray(testimonials) && testimonials.length > 0
    ? testimonials
    : DUMMY_TESTIMONIALS;

  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-[#020617] overflow-hidden relative border-b border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[500px] opacity-30"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(16,185,129,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* ── Section Header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Star size={12} className="text-emerald-500 fill-emerald-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-500">Success Stories</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Career <span className="text-gradient-emerald">Transformations</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto text-base">
            Real people. Real placements. Zero paywalls.
          </p>
        </motion.div>

        {/* ── Testimonial Grid (asymmetric) ──────────────────────────── */}
        {fetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1,2,3,4].map(i => <TestimonialSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* First card gets large treatment */}
            {safeTestimonials.slice(0, 1).map((t, i) => (
              <div key={t.id || i} className="md:row-span-1">
                <TestimonialCard t={t} idx={i} large={true} />
              </div>
            ))}
            {/* Rest are normal */}
            {safeTestimonials.slice(1, 6).map((t, i) => (
              <TestimonialCard key={t.id || i + 1} t={t} idx={i + 1} large={false} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;