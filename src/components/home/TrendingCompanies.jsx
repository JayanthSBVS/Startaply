import React from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../context/JobsContext';
import { motion } from 'framer-motion';
import { Building2, BadgeCheck, ArrowRight } from 'lucide-react';

const CompanyCard = ({ company, className = '' }) => (
  <Link
    to={`/jobs?company=${encodeURIComponent(company.name)}`}
    className={`group flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/50 backdrop-blur-sm rounded-2xl hover:border-emerald-400/50 dark:hover:border-emerald-500/30 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:shadow-[0_8px_30px_rgba(16,185,129,0.08)] transition-all duration-200 shrink-0 min-w-[200px] ${className}`}
  >
    {/* Logo */}
    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/40 overflow-hidden shrink-0 flex items-center justify-center group-hover:border-emerald-200 dark:group-hover:border-emerald-700/40 transition-colors">
      {company.logo ? (
        <img src={company.logo} alt={company.name} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-emerald-400/80 to-teal-500/80 flex items-center justify-center text-white font-black text-sm">
          {company.name?.charAt(0) || <Building2 size={16} />}
        </div>
      )}
    </div>

    {/* Name + badge */}
    <div className="min-w-0">
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate max-w-[120px]">
          {company.name}
        </span>
        <BadgeCheck size={13} className="text-emerald-500 shrink-0" />
      </div>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">Hiring Now</p>
    </div>
  </Link>
);

const TrendingCompanies = () => {
  const { companies } = useJobs();

  if (!companies || companies.length === 0) return null;

  // Two separate tracks for dual-stream effect
  const trackA = [...companies, ...companies, ...companies];
  const trackB = [...companies.slice().reverse(), ...companies.slice().reverse(), ...companies.slice().reverse()];

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-[#040b18] overflow-hidden relative border-b border-slate-200 dark:border-slate-800/50 transition-colors duration-500">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] opacity-40"
          style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(6,182,212,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ── Section Header ──────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Partner Ecosystem
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
              Trusted by <span className="text-gradient-emerald-cyan">Industry</span>
              <br />
              <span className="text-gradient-emerald-cyan">Leaders</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base font-medium max-w-md leading-relaxed">
              Direct access to 500+ verified companies — from global brands to high-growth startups.
            </p>
          </div>

          <Link
            to="/companies"
            className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-slate-200 dark:border-slate-700/50 hover:border-emerald-300 dark:hover:border-emerald-700/40 px-5 py-2.5 rounded-full transition-all duration-200 self-start md:self-auto whitespace-nowrap"
          >
            View All Companies <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>

      {/* ── Dual Marquee Streams ─────────────────────────────────────────── */}
      <div className="relative z-10">
        {/* Edge fades */}
        <div className="absolute inset-y-0 left-0 w-20 md:w-40 bg-gradient-to-r from-white dark:from-[#040b18] to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 md:w-40 bg-gradient-to-l from-white dark:from-[#040b18] to-transparent z-20 pointer-events-none" />

        {/* Track A — left to right */}
        <div className="flex overflow-hidden py-2 mb-4">
          <div className="companies-track gap-3 px-2">
            {trackA.map((c, i) => (
              <CompanyCard key={`a-${c.id || c.name}-${i}`} company={c} />
            ))}
          </div>
        </div>

        {/* Track B — right to left */}
        <div className="flex overflow-hidden py-2">
          <div className="companies-track-reverse gap-3 px-2">
            {trackB.map((c, i) => (
              <CompanyCard key={`b-${c.id || c.name}-${i}`} company={c} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingCompanies;