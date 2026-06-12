import React from 'react';
import { GraduationCap, Building2, CalendarCheck, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const CollegeCollabBanner = () => {
  return (
    <section className="relative py-24 section-light overflow-hidden border-b border-slate-200/50 dark:border-slate-900 transition-colors duration-500">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-400/8 dark:bg-emerald-600/15 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest mb-6">
              <GraduationCap size={16} /> Campus to Corporate
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.05]">
              Empowering <span className="text-gradient-emerald">Institutions</span> Nationwide
            </h2>

            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed mb-10">
              Startaply partners with Degree & Engineering Colleges across India. We bring verified corporate recruitment drives and freshers job melas directly to campus networks - giving students early access before public listing.
            </p>

            {/* Real stats badges */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3 premium-surface rounded-full px-5 py-3.5 transition-colors">
                <Building2 size={20} className="text-emerald-500 shrink-0" />
                <span className="text-slate-900 dark:text-white font-bold text-sm">500+ Partner Colleges</span>
              </div>
              <div className="flex items-center gap-3 premium-surface rounded-full px-5 py-3.5 transition-colors">
                <CalendarCheck size={20} className="text-emerald-500 shrink-0" />
                <span className="text-slate-900 dark:text-white font-bold text-sm">Exclusive Campus Drives</span>
              </div>
            </div>
          </motion.div>

          {/* Right Visual Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative h-[460px] rounded-[2.5rem] overflow-hidden group"
          >
            {/* Background image */}
            <div className="absolute inset-0">
              <img
                src="/workspace-editorial.png"
                alt="Campus Recruitment"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              {/* Fallback gradient */}
              <div className="hidden absolute inset-0 bg-gradient-to-br from-emerald-100 via-slate-200 to-indigo-100 dark:from-slate-800 dark:via-slate-900 dark:to-indigo-900/50" />
              {/* Overlay */}
              <div className="absolute inset-0 bg-slate-900/15 dark:bg-slate-900/50 mix-blend-multiply" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default CollegeCollabBanner;
