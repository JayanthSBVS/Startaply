import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const DUMMY_TESTIMONIALS = [
  { id: 1, name: "Rahul K.", tagline: "Warehouse Manager", description: "Got placed in an Amazon warehouse within 2 days of applying. The 'Gig & Services' category made finding blue-collar work super easy!", photo: "" },
  { id: 2, name: "Priya S.", tagline: "Frontend Developer", description: "As a fresher, finding the first job is hard. Strataply made it seamless. Got multiple offers without paying a single rupee to consultancies.", photo: "" },
  { id: 3, name: "Amit V.", tagline: "Delivery Partner", description: "Found a great gig with Zepto through this platform. Weekly payouts, flexible timings, and the application took 1 minute.", photo: "" },
  { id: 4, name: "Sneha M.", tagline: "Govt Job Aspirant", description: "The updates on govt job melas are incredibly fast and accurate. I secured my position in the state board thanks to their alerts.", photo: "" },
  { id: 5, name: "Ravi T.", tagline: "Professional Plumber", description: "Partnered with Urban Company through the Gig Works section. My earnings have doubled since I started getting direct leads.", photo: "" },
  { id: 6, name: "Anita D.", tagline: "HR Executive", description: "Found my dream corporate role without creating a 10-page profile. This platform respects your time. Highly recommended.", photo: "" }
];

const CACHE_KEY   = 'strataply_testimonials';
const CACHE_TTL   = 5 * 60 * 1000; // 5 minutes

function readTestimonialsCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null; // stale
    return Array.isArray(data) && data.length >= 4 ? data : null;
  } catch { return null; }
}

function writeTestimonialsCache(data) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch { /* quota exceeded */ }
}

// ── Skeleton placeholder ──────────────────────────────────────────────────
const TestimonialSkeleton = () => (
  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-700 animate-pulse">
    <div className="flex gap-1 mb-6">
      {[1,2,3,4,5].map(i => <div key={i} className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700" />)}
    </div>
    <div className="space-y-2 mb-8">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6" />
    </div>
    <div className="flex items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-700/50">
      <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16" />
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState(() => readTestimonialsCache() || []);
  const [fetching, setFetching]         = useState(testimonials.length === 0);

  useEffect(() => {
    // If we already have fresh cached data, skip the fetch
    const cached = readTestimonialsCache();
    if (cached) {
      setTestimonials(cached);
      setFetching(false);
      return;
    }

    axios.get('/api/testimonials')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length >= 4) {
          setTestimonials(res.data);
          writeTestimonialsCache(res.data);
        } else {
          setTestimonials(DUMMY_TESTIMONIALS);
        }
      })
      .catch(() => setTestimonials(DUMMY_TESTIMONIALS))
      .finally(() => setFetching(false));
  }, []); // fetch once per mount — sessionStorage cache prevents refetch on navigation

  // Safely enforce array structure before mapping
  const safeTestimonials = Array.isArray(testimonials) && testimonials.length > 0
    ? testimonials
    : DUMMY_TESTIMONIALS;

  return (
    <section className="py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden relative transition-colors duration-300">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">Success <span className="text-emerald-600 dark:text-emerald-400">Stories</span></h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">Hear from professionals and gig workers who found their dream roles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {fetching
            ? [1,2,3,4].map(i => <TestimonialSkeleton key={i} />)
            : safeTestimonials.slice(0, 8).map((t, idx) => (
              <motion.div
                key={t.id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, ease: "easeOut", duration: 0.4 }}
                className="bg-slate-50 dark:bg-slate-800/50 backdrop-blur-md p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-200 relative group cursor-pointer"
              >
                <Quote size={40} className="absolute top-6 right-8 text-slate-300 dark:text-slate-700 opacity-30 group-hover:text-emerald-500/20 group-hover:scale-110 transition-all duration-200" />
                <div className="flex gap-1 mb-6 text-amber-400">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} fill="currentColor" />)}
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-8 italic relative z-10 text-lg">"{t.description}"</p>

                <div className="flex items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-700/50">
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-700 border-2 border-emerald-500/30 overflow-hidden shadow-lg shrink-0">
                    {t.photo
                      ? <img src={t.photo} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
                      : <div className="w-full h-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xl">{t.name ? t.name[0] : 'U'}</div>
                    }
                  </div>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-extrabold text-lg">{t.name}</h4>
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold uppercase tracking-wider">{t.tagline}</p>
                  </div>
                </div>
              </motion.div>
            ))
          }
        </div>
      </div>
    </section>
  );
};

export default Testimonials;