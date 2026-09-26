import React, { useRef } from 'react';
import { useJobs } from '../../context/JobsContext';
import { Users, Building2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageActivity } from '../../hooks/usePageActivity';
import { getBoundedRepeatCount } from '../../utils/motionPolicy';

const COMPANY_TRACK_MIN = 8;
const COMPANY_TRACK_MAX = 12;

const TrendingCompanies = () => {
  const { companies } = useJobs();
  const sectionRef = useRef(null);
  const { shouldAnimate, isReducedMotion } = usePageActivity(sectionRef);

  if (!companies || companies.length === 0) return null;

  const repeatToCount = (arr, count) => {
    if (!arr || arr.length === 0) return [];
    let res = [];
    while (res.length < count) res = res.concat(arr);
    return res.slice(0, count);
  };

  // Mobile: show unique companies, max 12
  const mobileCompanies = companies.slice(0, 12);

  // Desktop: we need enough cards to cover large screens.
  // Each card is ~312px wide. 15 cards = ~4680px width, more than enough for a loop on ultrawides.
  const targetDesktopCards = getBoundedRepeatCount(companies.length, COMPANY_TRACK_MIN, COMPANY_TRACK_MAX);
  const stream1 = repeatToCount(companies, targetDesktopCards);
  const stream2 = repeatToCount(companies, targetDesktopCards).reverse();

  const getLogoUrl = (logo) => {
    if (!logo) return null;
    const str = String(logo).trim();
    if (str.startsWith('data:') || str.startsWith('http://') || str.startsWith('https://') || str.startsWith('//') || str.startsWith('/')) {
      return str;
    }
    if (str.includes('.')) return `https://${str}`;
    return null;
  };

  const DesktopCompanyCard = ({ company, isDuplicate }) => {
    const logoSrc = getLogoUrl(company.logo);
    return (
      <Link
        to={`/company/${company.id || company.name}`}
        className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#1A62FE]/40 px-6 py-4 rounded-2xl backdrop-blur-md mx-3 transition-colors cursor-pointer group w-72 shrink-0 hover:[animation-play-state:paused]"
        aria-hidden={isDuplicate ? "true" : undefined}
        tabIndex={isDuplicate ? -1 : undefined}
      >
        <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-white/20 p-1 shadow-sm">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={`${company.name} logo`}
              loading="lazy"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=001F8E&color=fff&bold=true`;
              }}
            />
          ) : (
            <Building2 className="text-slate-400" size={24} />
          )}
        </div>
        <div className="min-w-0">
          <h4 className="text-white font-bold text-sm truncate group-hover:text-[#1A62FE] transition-colors">{company.name}</h4>
          <p className="text-slate-400 text-xs font-medium mt-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A62FE] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" style={{ animationPlayState: shouldAnimate ? 'running' : 'paused' }} /> Actively Hiring
          </p>
        </div>
      </Link>
    );
  };

  // Mobile company pill - compact, touch-friendly
  const MobileCompanyPill = ({ company, isDuplicate }) => {
    const logoSrc = getLogoUrl(company.logo);
    return (
      <Link
        to={`/company/${company.id || company.name}`}
        className="flex-shrink-0 flex items-center gap-3 bg-white/[0.08] border border-white/[0.12] active:bg-white/[0.15] px-4 py-3 rounded-2xl transition-colors w-52 mr-3"
        style={{ minHeight: '64px' }}
        aria-hidden={isDuplicate ? "true" : undefined}
        tabIndex={isDuplicate ? -1 : undefined}
      >
        <div className="w-10 h-10 bg-white rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-white/20 p-1 shadow-sm">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={`${company.name} logo`}
              loading="lazy"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=001F8E&color=fff&bold=true`;
              }}
            />
          ) : (
            <Building2 className="text-slate-400" size={20} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-white font-bold text-sm truncate">{company.name}</h4>
          <p className="text-[#1A62FE] text-[10px] font-bold mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A62FE] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" style={{ animationPlayState: shouldAnimate ? 'running' : 'paused' }} /> Hiring
          </p>
        </div>
      </Link>
    );
  };

  return (
    <section ref={sectionRef} className="py-12 md:py-24 relative overflow-hidden bg-[#020617] transition-colors duration-500">
      {/* Glow */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[400px] bg-[#1A62FE]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 relative z-10 mb-8 md:mb-14 text-center">
        <div className="inline-flex items-center gap-2 mb-3.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 shadow-sm text-xs font-bold uppercase tracking-wider text-blue-200">
          <Users size={13} className="text-[#1A62FE]" />
          <span>The Startaply Partner Network</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
          Verified Hiring <span className="text-[#1A62FE]">Ecosystem</span>
        </h2>
        <p className="text-slate-300 font-normal text-xs sm:text-sm md:text-base max-w-lg mx-auto mb-6 md:mb-8">
          Join leading enterprises and high-growth companies recruiting directly through Startaply.
        </p>
        <Link
          to="/companies"
          className="inline-flex items-center gap-2 px-6 md:px-8 py-3 bg-[#001F8E] hover:bg-[#1A62FE] text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-[#001F8E]/30 active:scale-95"
          style={{ minHeight: '44px' }}
        >
          Explore Company Directory <ExternalLink size={14} />
        </Link>
      </div>

      {/* ── MOBILE: Manual scrolling unique companies ── */}
      <div className="md:hidden relative z-10 overflow-hidden pb-4">
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#020617] to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#020617] to-transparent pointer-events-none z-10" />
        <div className="flex overflow-x-auto no-scrollbar">
          {mobileCompanies.map((company, i) => (
            <MobileCompanyPill key={`${company.id}-m-${i}`} company={company} isDuplicate={false} />
          ))}
        </div>
      </div>

      {/* ── DESKTOP: Marquee tracks ── */}
      <div className="hidden md:flex relative z-10 flex-col gap-4 pb-10">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#020617] to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#020617] to-transparent z-20 pointer-events-none" />

        {/* Track 1 - LTR */}
        <div className="overflow-hidden">
          <div
            className={isReducedMotion ? "flex overflow-x-auto no-scrollbar" : "companies-track hover:[animation-play-state:paused]"}
            style={{
              animationPlayState: shouldAnimate ? 'running' : 'paused'
            }}
          >
            {isReducedMotion
              ? companies.map((company, i) => <DesktopCompanyCard key={`${company.id}-1-${i}`} company={company} isDuplicate={false} />)
              : stream1.map((company, i) => <DesktopCompanyCard key={`${company.id}-1-${i}`} company={company} isDuplicate={i >= companies.length} />)
            }
          </div>
        </div>

        {/* Track 2 - RTL */}
        {!isReducedMotion && (
          <div className="overflow-hidden" aria-hidden="true">
            <div
              className="companies-track-reverse hover:[animation-play-state:paused]"
              style={{
                transform: 'translateX(-50%)',
                animationPlayState: shouldAnimate ? 'running' : 'paused'
              }}
            >
              {stream2.map((company, i) => <DesktopCompanyCard key={`${company.id}-2-${i}`} company={company} isDuplicate={true} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingCompanies;
