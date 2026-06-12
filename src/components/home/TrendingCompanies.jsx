import React from 'react';
import { useJobs } from '../../context/JobsContext';
import { Users, Building2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const TrendingCompanies = () => {
  const { companies } = useJobs();

  if (!companies || companies.length === 0) return null;

  const repeatToCount = (arr, count) => {
    if (!arr || arr.length === 0) return [];
    let res = [];
    while (res.length < count) res = res.concat(arr);
    return res.slice(0, count);
  };

  const stream1 = repeatToCount(companies, 20);
  const stream2 = repeatToCount(companies, 20).reverse();

  // Mobile: show unique companies, max 12
  const mobileCompanies = companies.slice(0, 12);

  const DesktopCompanyCard = ({ company }) => (
    <div className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 px-6 py-4 rounded-[1.5rem] backdrop-blur-md mx-3 transition-colors cursor-pointer group w-72">
      <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-white/20 p-1">
        {company.logo ? (
          <img
            src={company.logo.startsWith('http') || company.logo.startsWith('//') ? company.logo : `https://${company.logo}`}
            alt={company.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=10b981&color=fff&bold=true`;
            }}
          />
        ) : (
          <Building2 className="text-slate-400" size={24} />
        )}
      </div>
      <div className="min-w-0">
        <h4 className="text-white font-bold text-sm truncate group-hover:text-emerald-400 transition-colors">{company.name}</h4>
        <p className="text-slate-400 text-xs font-semibold mt-0.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Actively Hiring
        </p>
      </div>
    </div>
  );

  // Mobile company pill - compact, touch-friendly
  const MobileCompanyPill = ({ company }) => (
    <Link
      to={`/companies`}
      className="flex-shrink-0 flex items-center gap-3 bg-white/[0.08] border border-white/[0.12] active:bg-white/[0.15] px-4 py-3 rounded-2xl transition-colors w-52 mr-3"
      style={{ minHeight: '64px' }}
    >
      <div className="w-10 h-10 bg-white rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-white/20 p-1">
        {company.logo ? (
          <img
            src={company.logo.startsWith('http') || company.logo.startsWith('//') ? company.logo : `https://${company.logo}`}
            alt={company.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=10b981&color=fff&bold=true`;
            }}
          />
        ) : (
          <Building2 className="text-slate-400" size={20} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-white font-bold text-sm truncate">{company.name}</h4>
        <p className="text-emerald-400 text-[10px] font-bold mt-0.5 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Hiring
        </p>
      </div>
    </Link>
  );

  return (
    <section className="py-12 md:py-24 relative overflow-hidden section-dark transition-colors duration-500">
      {/* Network background effect - hidden on mobile */}
      <svg className="hidden md:block absolute inset-0 w-full h-full opacity-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <pattern id="network" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="50" cy="50" r="1" fill="#fff" />
          <path d="M0 0 L100 100 M100 0 L0 100" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.5" fill="none" />
        </pattern>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#network)" />
      </svg>

      {/* Glow - reduced on mobile */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[400px] rounded-full opacity-20 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: 'var(--orb-indigo)', filter: 'blur(80px)' }}
      />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 relative z-10 mb-8 md:mb-16 text-center">
        <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 shadow-sm">
          <Users size={13} className="text-emerald-400" />
          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">The Startaply Network</span>
        </div>
        <h2 className="text-2xl md:text-6xl font-black text-white tracking-tighter mb-3 md:mb-4">
          Hiring <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Ecosystem</span>
        </h2>
        <p className="text-slate-400 font-medium text-sm md:text-lg max-w-sm md:max-w-xl mx-auto mb-6 md:mb-8">
          Join the exclusive network of top enterprises and startups recruiting directly through our platform.
        </p>
        <Link
          to="/companies"
          className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-3.5 bg-white text-slate-900 rounded-full font-bold text-sm hover:bg-emerald-400 hover:text-slate-900 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
          style={{ minHeight: '44px' }}
        >
          Explore Directory <ExternalLink size={15} />
        </Link>
      </div>

      {/* ── MOBILE: Auto-scrolling row ─────────────────────────────── */}
      <div className="md:hidden relative z-10 overflow-hidden pb-4">
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#020617] to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#020617] to-transparent pointer-events-none z-10" />
        <div className="companies-track" style={{ animationDuration: '25s' }}>
          {stream1.slice(0, 15).map((company, i) => (
            <MobileCompanyPill key={`${company.id}-m-${i}`} company={company} />
          ))}
        </div>
      </div>

      {/* ── DESKTOP: Marquee tracks (unchanged) ──────────────────────────── */}
      <div className="hidden md:flex relative z-10 flex-col gap-5 pb-10">
        {/* Left and Right Fade Overlays */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#020617] to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#020617] to-transparent z-20 pointer-events-none" />
        {/* Track 1 - LTR */}
        <div className="overflow-hidden">
          <div className="companies-track">
            {stream1.map((company, i) => <DesktopCompanyCard key={`${company.id}-1-${i}`} company={company} />)}
          </div>
        </div>
        {/* Track 2 - RTL */}
        <div className="overflow-hidden">
          <div className="companies-track-reverse" style={{ transform: 'translateX(-50%)' }}>
            {stream2.map((company, i) => <DesktopCompanyCard key={`${company.id}-2-${i}`} company={company} />)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingCompanies;
