import React from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../context/JobsContext';
import { motion } from 'framer-motion';

const TrendingCompanies = () => {
  const { companies } = useJobs();

  if (!companies || companies.length === 0) return null;

  // Duplicate items many times to ensure seamless endless scroll even with few companies
  const marqueeItems = Array(10).fill(companies).flat();

  return (
    <section className="py-16 bg-white dark:bg-slate-900 text-center border-b border-slate-200 dark:border-slate-800 overflow-hidden relative transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 mb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
            Trusted by Top Companies
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
            Leading organizations actively hiring through our platform.
          </p>
        </motion.div>
      </div>

      <div className="relative w-full max-w-7xl mx-auto">
        <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden flex">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 30, repeat: Infinity }}
            className="flex gap-6 px-3 py-4"
          >
            {marqueeItems.map((c, i) => (
              <Link
                key={`${c.name}-${i}`}
                to={`/jobs?company=${encodeURIComponent(c.name)}`}
                className="w-48 shrink-0 group flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 hover:-translate-y-2"
              >
                {c.logo ? (
                  <img src={c.logo} alt={c.name} className="w-14 h-14 object-contain grayscale opacity-60 dark:opacity-40 group-hover:grayscale-0 group-hover:opacity-100 dark:group-hover:opacity-100 transition-all duration-300 mb-4" />
                ) : (
                  <div className="w-14 h-14 rounded-[1.25rem] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-black mb-4 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                    {c.name.charAt(0)}
                  </div>
                )}
                <p className="text-sm font-bold text-slate-700 dark:text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
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