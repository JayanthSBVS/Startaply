import React from 'react';
import { CheckCircle2, Zap, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Zap,
    title: 'Free to Use',
    desc: 'No hidden fees, no premium gates. Complete access to every listing at zero cost — forever.',
    accent: 'from-emerald-400 to-teal-400',
    glow: 'rgba(16,185,129,0.12)',
  },
  {
    icon: Shield,
    title: 'Verified Listings',
    desc: 'Every company and job is manually reviewed. Zero spam, zero fraud — just real opportunities.',
    accent: 'from-blue-400 to-cyan-400',
    glow: 'rgba(6,182,212,0.12)',
  },
  {
    icon: Clock,
    title: 'One-Click Apply',
    desc: 'Apply to multiple relevant jobs instantly. No lengthy forms, no login required.',
    accent: 'from-amber-400 to-orange-400',
    glow: 'rgba(245,158,11,0.12)',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const WhySection = () => {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-[#040b18] border-b border-slate-200 dark:border-slate-800/50 overflow-hidden relative transition-colors duration-300">
      {/* Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
        className="relative z-10 max-w-7xl mx-auto px-4"
      >
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div variants={cardVariants} className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-500">Why Startaply</span>
          </motion.div>
          <motion.h2 variants={cardVariants} className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Built for <span className="text-gradient-emerald">Speed</span> &{' '}
            <span className="text-gradient-emerald-cyan">Simplicity</span>
          </motion.h2>
          <motion.p variants={cardVariants} className="text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto text-base">
            Everything is designed around getting you to your next opportunity as fast as possible.
          </motion.p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -6 }}
                key={f.title}
                className="group relative bg-slate-50 dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/50 hover:border-emerald-400/40 dark:hover:border-emerald-700/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-300 overflow-hidden cursor-default"
                style={{ '--card-glow': f.glow }}
              >
                {/* Top border accent on hover */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Background hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
                  style={{ background: `radial-gradient(ellipse at top left, ${f.glow} 0%, transparent 60%)` }}
                />

                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.accent} flex items-center justify-center mb-6 shadow-[0_4px_16px_rgba(0,0,0,0.12)] group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} className="text-white" />
                </div>

                <h3 className="text-xl font-black mb-3 text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors relative z-10">
                  {f.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-sm relative z-10">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};

export default WhySection;