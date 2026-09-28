import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Sparkles, ExternalLink } from 'lucide-react';
import { usePageActivity } from '../../hooks/usePageActivity';
import { getBoundedRepeatCount } from '../../utils/motionPolicy';

const TICKER_SECONDARY_MIN = 8;
const TICKER_SECONDARY_MAX = 16;

const TYPE_BADGES = [
  { label: 'URGENT', color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/15 border-red-200 dark:border-red-500/20' },
  { label: 'TECH',   color: 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-500/15 border-sky-200 dark:border-sky-500/20' },
  { label: 'IT',     color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/15 border-blue-200 dark:border-blue-500/20' },
  { label: 'NEW',    color: 'text-brand-hover dark:text-brand-hover bg-brand-soft dark:bg-brand-soft border-brand/20 dark:border-brand/20' },
  { label: 'FRESHER',color: 'text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-500/15 border-teal-200 dark:border-teal-500/20' },
];



const JobMelaTicker = () => {
  const [activeMela, setActiveMela] = useState(null);
  const [tickerItems, setTickerItems] = useState([]);
  const [badgeIdx, setBadgeIdx] = useState(0);

  const sectionRef = useRef(null);
  const { shouldAnimate, isReducedMotion } = usePageActivity(sectionRef, { allowMobile: true });
  const staticMode = isReducedMotion;

  useEffect(() => {
    axios.get('/api/job-mela/active')
      .then(res => { if (res.data) setActiveMela(res.data); })
      .catch(() => {});

    axios.get('/api/live-ticker')
      .then(res => { if (Array.isArray(res.data)) setTickerItems(res.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!shouldAnimate || staticMode) return;
    const t = setInterval(() => setBadgeIdx(p => (p + 1) % TYPE_BADGES.length), 3500);
    return () => clearInterval(t);
  }, [shouldAnimate, staticMode]);

  const primaryText = activeMela?.tickerText ||
    '🚀 Verified Early Talent Openings  •  Direct HR Connect Drives  •  Urgent IT & Tech Openings  •  Corporate Hiring Live  •  Job Mela Registrations Live  •  Top Startup Roles  •  Amazon 1000+ Openings  •  TCS Digital Fresh Drive';

  const currentBadge = TYPE_BADGES[badgeIdx];

  // 2 repeats are required for continuous seamless loop
  const primaryRepeats = staticMode ? 1 : 2;
  const primaryItems = [...Array(primaryRepeats)].map((_, i) => (
    <span key={i} className="flex items-center gap-6 sm:gap-8 px-4 sm:px-6 shrink-0" aria-hidden={i > 0 ? "true" : undefined}>
      <span className="flex items-center gap-2 text-slate-100 text-xs sm:text-sm font-semibold tracking-tight whitespace-nowrap">
        <Sparkles size={13} className="text-brand-hover shrink-0" />
        {primaryText}
      </span>
      <Link
        to="/job-melas"
        className="flex items-center gap-1 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/15 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold transition-all shrink-0 uppercase tracking-wider"
        onClick={e => e.stopPropagation()}
        tabIndex={i > 0 ? -1 : 0}
      >
        Explore <ExternalLink size={10} />
      </Link>
    </span>
  ));

  const defaultSecondaryItems = [
    '🔥 500+ Verified Hiring Drives Live',
    '⚡ Direct HR Contacts & Zero Consulting Fees',
    '🚀 100% Free Job & Internship Applications',
    '🎯 Urgent IT & Tech Drive Openings'
  ];

  const rawArray = tickerItems.map(t => t.text).filter(t => t && t.trim() !== '');
  const tickerArray = rawArray.length > 0 ? rawArray : defaultSecondaryItems;

  const targetSecondaryItems = staticMode ? tickerArray.length : (tickerArray.length > 0 ? getBoundedRepeatCount(tickerArray.length, TICKER_SECONDARY_MIN, TICKER_SECONDARY_MAX) : 0);

  const repeatToCount = (arr, count) => {
    if (!arr || arr.length === 0) return [];
    let res = [];
    while (res.length < count) {
      res = res.concat(arr);
    }
    return res.slice(0, count);
  };

  const secondaryItems = repeatToCount(tickerArray, targetSecondaryItems).map((text, i) => (
    <span key={i} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-8 shrink-0 text-slate-400 text-[11px] sm:text-xs font-semibold whitespace-nowrap" aria-hidden={i >= tickerArray.length ? "true" : undefined}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
      {text}
    </span>
  ));

  return (
    <div ref={sectionRef} className="relative z-40 bg-slate-950 border-y border-slate-900 overflow-hidden select-none">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

      <div className="flex items-stretch">
        {/* ── Live Intelligence Badge (Compact on mobile) ── */}
        <div className="relative z-20 flex flex-col sm:flex-col justify-center items-center sm:items-start gap-1 px-3 sm:px-5 py-2 sm:py-3 bg-[#020617] border-r border-slate-800 shrink-0 min-w-[70px] sm:min-w-[100px] shadow-[6px_0_15px_rgba(2,6,23,0.8)]">
          {/* Ping dot */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
              {!staticMode && (
                <span
                  className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"
                  style={{ animationPlayState: shouldAnimate ? 'running' : 'paused' }}
                />
              )}
              <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </span>
            <span className="text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Live</span>
          </div>
          {/* Rotating type badge */}
          <span
            key={badgeIdx}
            className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider border ${staticMode ? '' : 'animate-[badge-fade_3.5s_ease-in-out_infinite]'} ${currentBadge.color}`}
            style={{ animationPlayState: shouldAnimate ? 'running' : 'paused' }}
          >
            {currentBadge.label}
          </span>
        </div>

        {/* ── Ticker Tracks ── */}
        <div className="flex-1 overflow-hidden min-w-0">
          {/* Primary track (LTR) */}
          <div className="relative overflow-hidden py-2 sm:py-2.5 border-b border-slate-900/80">
            <div
              className={staticMode ? "flex overflow-x-auto no-scrollbar" : "ticker-wrapper"}
              style={!staticMode ? { animationPlayState: shouldAnimate ? 'running' : 'paused' } : {}}
            >
              {primaryItems}
            </div>
            {!staticMode && (
              <>
                <div className="absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />
              </>
            )}
          </div>

          {/* Secondary track (RTL) */}
          {tickerArray.length > 0 && (
            <div className="relative overflow-hidden py-1 sm:py-1.5 bg-[#03081c]">
              <div
                className={staticMode ? "flex overflow-x-auto no-scrollbar" : "ticker-wrapper-rtl"}
                style={
                  !staticMode
                    ? { animationPlayState: shouldAnimate ? 'running' : 'paused' }
                    : {}
                }
              >
                {secondaryItems}
              </div>
              {!staticMode && (
                <>
                  <div className="absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-[#03081c] to-transparent z-10 pointer-events-none" />
                  <div className="absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-[#03081c] to-transparent z-10 pointer-events-none" />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
    </div>
  );
};

export default JobMelaTicker;
