import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../context/JobsContext';
import { motion } from 'framer-motion';
import { Building2, ArrowUpRight, Zap, BadgeCheck } from 'lucide-react';

const TrendingCompanies = () => {
  const { companies, jobs } = useJobs();

  // Calculate job counts per company for the badges
  const companyStats = useMemo(() => {
    const stats = {};
    (jobs || []).forEach(job => {
      if (job.companyId || job.companyid) {
        const id = job.companyId || job.companyid;
        stats[id] = (stats[id] || 0) + 1;
      } else if (job.company) {
        stats[job.company] = (stats[job.company] || 0) + 1;
      }
    });
    return stats;
  }, [jobs]);

  if (!companies || companies.length === 0) return null;

  // Duplicate items for infinite scroll effect
  const marqueeItems = [...companies, ...companies, ...companies];

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50 overflow-hidden relative transition-colors duration-500">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20">
                Partner Network
              </span>
              <div className="h-px w-12 bg-emerald-500/30" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-[1.1]">
              Hiring <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Ecosystem</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-bold leading-relaxed">
              Directly partnered with global industry leaders and fast-growing startups to bring you exclusive opportunities.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:block"
          >
            <Link to="/companies" className="group flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-sm text-slate-900 dark:text-white hover:border-emerald-500 transition-all shadow-sm">
              Explore All Partners
              <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-emerald-500" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Interactive Marquee */}
      <div className="relative w-full">
        {/* Gradient Fades */}
        <div className="absolute top-0 left-0 w-32 md:w-64 h-full bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 md:w-64 h-full bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent z-20 pointer-events-none" />

        <div className="flex py-10">
          <motion.div
            animate={{ x: ["0%", "-33.33%"] }}
            transition={{ ease: "linear", duration: 40, repeat: Infinity }}
            className="flex gap-8 px-4"
            whileHover={{ transition: { duration: 80 } }} // Slow down on hover
          >
            {marqueeItems.map((c, i) => {
              const jobCount = companyStats[c.id] || companyStats[c.name] || 0;
              return (
                <Link
                  key={`${c.id || c.name}-${i}`}
                  to={`/jobs?company=${encodeURIComponent(c.name)}`}
                  className="w-72 md:w-80 shrink-0 group relative"
                >
                  <div className="bg-white dark:bg-slate-950/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-[2.5rem] p-8 h-full flex flex-col items-center text-center transition-all duration-500 group-hover:border-emerald-500/50 group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] dark:group-hover:shadow-[0_0_50px_rgba(16,185,129,0.15)] group-hover:-translate-y-3">
                    
                    {/* Hiring Badge */}
                    <div className="absolute top-6 right-6">
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Hiring
                      </span>
                    </div>

                    {/* Logo Section */}
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center p-5 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                      {c.logo ? (
                        <img src={c.logo} alt={c.name} className="w-full h-full object-contain filter drop-shadow-sm" />
                      ) : (
                        <Building2 size={40} className="text-slate-300 dark:text-slate-700" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex items-center gap-1.5 mb-1 justify-center">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                        {c.name}
                      </h3>
                      <BadgeCheck size={16} className="text-blue-500 fill-blue-500/10" />
                    </div>
                    
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-6">
                      {c.industry || 'Global Partner'}
                    </p>

                    {/* Footer Stats */}
                    <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/60 w-full flex items-center justify-between">
                      <div className="flex flex-col items-start">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Open Roles</span>
                        <span className="text-sm font-black text-slate-800 dark:text-white">{jobCount} Listings</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <Zap size={18} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrendingCompanies;