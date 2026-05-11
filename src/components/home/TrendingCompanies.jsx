import React from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../context/JobsContext';
import { motion } from 'framer-motion';
import { Building2, BadgeCheck } from 'lucide-react';

const TrendingCompanies = () => {
  const { companies } = useJobs();

  if (!companies || companies.length === 0) return null;

  // Duplicate items for infinite scroll effect
  const marqueeItems = [...companies, ...companies, ...companies];

  return (
    <section className="py-24 bg-white dark:bg-[#0b0f1a] overflow-hidden relative transition-colors duration-500">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-[30rem] h-[30rem] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-20 relative z-10 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Partner Ecosystem
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
              Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Industry Leaders</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-bold leading-relaxed max-w-xl mx-auto md:mx-0">
              Premium placement and direct access to global brands and high-growth startups.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Interactive Marquee */}
      <div className="relative w-full">
        {/* Professional Edge Fades */}
        <div className="absolute top-0 left-0 w-32 md:w-80 h-full bg-gradient-to-r from-white dark:from-[#0b0f1a] to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 md:w-80 h-full bg-gradient-to-l from-white dark:from-[#0b0f1a] to-transparent z-20 pointer-events-none" />

        <div className="flex py-6">
          <motion.div
            animate={{ x: ["0%", "-33.33%"] }}
            transition={{ ease: "linear", duration: 50, repeat: Infinity }}
            className="flex gap-10 px-5"
            whileHover={{ transition: { duration: 100 } }} // Slow down significantly on hover for focus
          >
            {marqueeItems.map((c, i) => (
              <Link
                key={`${c.id || c.name}-${i}`}
                to={`/jobs?company=${encodeURIComponent(c.name)}`}
                className="w-64 md:w-72 shrink-0 group perspective-1000"
              >
                <div className="relative h-64 md:h-72 bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200 dark:border-slate-800/80 rounded-[3rem] overflow-hidden transition-all duration-500 group-hover:border-emerald-500/40 group-hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] dark:group-hover:shadow-[0_0_60px_rgba(16,185,129,0.1)] group-hover:-translate-y-4 flex flex-col shadow-sm">
                  
                  {/* Premium Logo Showcase Area */}
                  <div className="flex-1 relative flex items-center justify-center p-12 overflow-hidden bg-slate-50/50 dark:bg-slate-900/20">
                    {/* Subtle Radial Glow */}
                    <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                      {c.logo ? (
                        <img 
                          src={c.logo} 
                          alt={c.name} 
                          className="max-w-full max-h-full object-contain filter drop-shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <Building2 size={40} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Minimal Branding Footer */}
                  <div className="p-6 md:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight group-hover:text-emerald-500 transition-colors">
                        {c.name}
                      </h3>
                      <BadgeCheck size={18} className="text-emerald-500 fill-emerald-500/10 shrink-0" />
                    </div>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[100%] transition-all duration-500 group-hover:bg-emerald-500/10" />
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrendingCompanies;