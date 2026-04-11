import React from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../context/JobsContext';
import { motion } from 'framer-motion';

const TrendingCompanies = () => {
  const { companies } = useJobs();

  if (!companies || companies.length === 0) return null;

  // Duplicate companies to ensure a seamless infinite scroll loop
  const marqueeItems = [...companies.slice(0, 10), ...companies.slice(0, 10)];

  return (
    <section className="py-16 bg-white text-center border-b border-slate-200 overflow-hidden relative">
      <div className="max-w-5xl mx-auto px-4 mb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Trusted by Top Companies
          </h2>
          <p className="text-slate-500 text-lg font-medium">
            Leading organizations actively hiring through our platform.
          </p>
        </motion.div>
      </div>

      {/* Marquee Wrapper with fading edges */}
      <div className="relative w-full max-w-7xl mx-auto">
        <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden flex">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 30, repeat: Infinity }}
            className="flex gap-6 px-3"
          >
            {marqueeItems.map((c, i) => (
              <Link
                key={`${c.name}-${i}`}
                to={`/jobs?company=${encodeURIComponent(c.name)}`}
                className="w-48 shrink-0 group flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-emerald-300 hover:bg-white transition-all duration-300"
              >
                {c.logo ? (
                  <img src={c.logo} alt={c.name} className="w-12 h-12 object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 mb-3" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-black mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                    {c.name.charAt(0)}
                  </div>
                )}
                <p className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {c.name}
                </p>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrendingCompanies;