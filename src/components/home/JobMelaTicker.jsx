import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Sparkles, ExternalLink, Radio } from 'lucide-react';

const TYPE_BADGES = [
  { label: 'URGENT', color: 'text-red-300 bg-red-500/15 border-red-500/20' },
  { label: 'GOVT',   color: 'text-amber-300 bg-amber-500/15 border-amber-500/20' },
  { label: 'IT',     color: 'text-blue-300 bg-blue-500/15 border-blue-500/20' },
  { label: 'NEW',    color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/20' },
  { label: 'MELA',   color: 'text-purple-300 bg-purple-500/15 border-purple-500/20' },
  { label: 'FRESHER',color: 'text-teal-300 bg-teal-500/15 border-teal-500/20' },
];

const SECONDARY_TEXT = [
  '🏢 Infosys • Bangalore • Walk-in',
  '🏛️ SSC CGL 2024 • Apply Now',
  '⚡ Amazon Warehouse • Immediate',
  '🚀 TCS Digital • 800 openings',
  '📋 IBPS PO Result Out',
  '🎯 Wipro Elite • Fresh Grads',
  '🌟 Google India • SDE-2',
  '🔥 Zepto Delivery • Weekly Pay',
];

const JobMelaTicker = () => {
  const [activeMela, setActiveMela] = useState(null);
  const [badgeIdx, setBadgeIdx] = useState(0);

  useEffect(() => {
    axios.get('/api/job-mela/active')
      .then(res => { if (res.data) setActiveMela(res.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setBadgeIdx(p => (p + 1) % TYPE_BADGES.length), 2800);
    return () => clearInterval(t);
  }, []);

  const primaryText = activeMela?.tickerText ||
    '🚀 New Government Notifications  •  Exam Admit Cards Released  •  Urgent IT Hiring Drive  •  State Govt Jobs Open  •  Job Mela 2024 Registrations Live  •  Railway Recruitment Announced  •  Amazon 1000+ Openings  •  TCS Digital Fresh Drive';

  const currentBadge = TYPE_BADGES[badgeIdx];

  // Repeat items for seamless loop
  const primaryItems = [...Array(4)].map((_, i) => (
    <span key={i} className="flex items-center gap-8 px-6 shrink-0">
      <span className="flex items-center gap-2 text-slate-200 text-sm font-medium tracking-tight whitespace-nowrap">
        <Sparkles size={13} className="text-emerald-400 shrink-0" />
        {primaryText}
      </span>
      <Link
        to="/job-melas"
        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 px-3 py-1 rounded-full text-[11px] font-bold transition-all shrink-0"
        onClick={e => e.stopPropagation()}
      >
        SEE ALL <ExternalLink size={11} />
      </Link>
    </span>
  ));

  const secondaryItems = [...SECONDARY_TEXT, ...SECONDARY_TEXT, ...SECONDARY_TEXT, ...SECONDARY_TEXT].map((text, i) => (
    <span key={i} className="flex items-center gap-3 px-6 shrink-0 text-slate-500 text-xs font-semibold whitespace-nowrap">
      <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0" />
      {text}
    </span>
  ));

  return (
    <div className="relative z-40 bg-slate-900 dark:bg-slate-900/80 border-y border-slate-800/60 overflow-hidden select-none">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="flex">
        {/* ── Live Badge ──────────────────────────────────────────────────── */}
        <div className="relative z-20 flex flex-col justify-center gap-1 px-4 py-3 bg-slate-950 border-r border-slate-800 shrink-0 min-w-[90px]">
          {/* Ping dot */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Live</span>
          </div>
          {/* Rotating type badge */}
          <span
            key={badgeIdx}
            className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border transition-all duration-300 ${currentBadge.color}`}
          >
            {currentBadge.label}
          </span>
        </div>

        {/* ── Ticker Tracks ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden">
          {/* Primary track */}
          <div className="relative overflow-hidden py-2 border-b border-slate-800/40">
            <div className="ticker-wrapper">{primaryItems}</div>
            {/* Edge fades */}
            <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />
          </div>
          {/* Secondary track (reverse, slower) */}
          <div className="relative overflow-hidden py-1.5">
            <div
              className="inline-flex whitespace-nowrap"
              style={{ animation: 'marquee-rtl 45s linear infinite' }}
            >
              {secondaryItems}
            </div>
            <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
    </div>
  );
};

export default JobMelaTicker;