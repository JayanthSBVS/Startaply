import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Sparkles, ExternalLink } from 'lucide-react';

const TYPE_BADGES = [
  { label: 'URGENT', color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/15 border-red-200 dark:border-red-500/20' },
  { label: 'GOVT',   color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/20' },
  { label: 'IT',     color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/15 border-blue-200 dark:border-blue-500/20' },
  { label: 'NEW',    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/20' },
  { label: 'FRESHER',color: 'text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-500/15 border-teal-200 dark:border-teal-500/20' },
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
  const [tickerItems, setTickerItems] = useState([]);
  const [badgeIdx, setBadgeIdx] = useState(0);

  useEffect(() => {
    axios.get('/api/job-mela/active')
      .then(res => { if (res.data) setActiveMela(res.data); })
      .catch(() => {});
      
    axios.get('/api/live-ticker')
      .then(res => { if (Array.isArray(res.data)) setTickerItems(res.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setBadgeIdx(p => (p + 1) % TYPE_BADGES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const primaryText = activeMela?.tickerText ||
    '🚀 New Government Notifications  •  Exam Admit Cards Released  •  Urgent IT Hiring Drive  •  State Govt Jobs Open  •  Job Mela 2024 Registrations Live  •  Railway Recruitment Announced  •  Amazon 1000+ Openings  •  TCS Digital Fresh Drive';

  const currentBadge = TYPE_BADGES[badgeIdx];

  // Repeat items for seamless loop
  const primaryItems = [...Array(4)].map((_, i) => (
    <span key={i} className="flex items-center gap-8 px-6 shrink-0">
      <span className="flex items-center gap-2 text-slate-100 text-sm font-semibold tracking-tight whitespace-nowrap">
        <Sparkles size={14} className="text-emerald-400 shrink-0" />
        {primaryText}
      </span>
      <Link
        to="/job-melas"
        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 uppercase tracking-wider"
        onClick={e => e.stopPropagation()}
      >
        Explore <ExternalLink size={10} />
      </Link>
    </span>
  ));

  const tickerArray = tickerItems.length > 0 ? tickerItems.map(t => t.text) : SECONDARY_TEXT;
  const repeatToCount = (arr, count) => {
    if (!arr || arr.length === 0) return [];
    let res = [];
    while (res.length < count) {
      res = res.concat(arr);
    }
    return res.slice(0, count);
  };
  
  const secondaryItems = repeatToCount(tickerArray, 30).map((text, i) => (
    <span key={i} className="flex items-center gap-4 px-8 shrink-0 text-slate-400 text-xs font-semibold whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
      {text}
    </span>
  ));

  return (
    <div className="relative z-40 bg-slate-950 border-y border-slate-900 overflow-hidden select-none">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      {/* Shimmer background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent opacity-50" style={{ animation: 'shimmer 8s linear infinite', backgroundSize: '200% 100%' }} />

      <div className="flex">
        {/* ── Live Intelligence Badge ───────────────────────────────────── */}
        <div className="relative z-20 flex flex-col justify-center gap-1.5 px-5 py-3 bg-[#020617] border-r border-slate-800 shrink-0 min-w-[100px] shadow-[10px_0_20px_rgba(2,6,23,0.8)]">
          {/* Ping dot */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </span>
            <span className="text-white text-[10px] font-black uppercase tracking-widest">Live Feed</span>
          </div>
          {/* Rotating type badge */}
          <span
            key={badgeIdx}
            className={`px-2 py-0.5 rounded flex items-center justify-center text-[9px] font-black uppercase tracking-wider border animate-[badge-fade_3.5s_ease-in-out_infinite] ${currentBadge.color}`}
          >
            {currentBadge.label}
          </span>
        </div>

        {/* ── Ticker Tracks ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden">
          {/* Primary track (LTR) */}
          <div className="relative overflow-hidden py-2.5 border-b border-slate-900/80">
            <div className="ticker-wrapper">{primaryItems}</div>
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />
          </div>
          
          {/* Secondary track (RTL, slower) */}
          <div className="relative overflow-hidden py-1.5 bg-[#03081c]">
            <div
              className="inline-flex whitespace-nowrap"
              style={{ animation: 'marquee-rtl 55s linear infinite' }}
            >
              {secondaryItems}
            </div>
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#03081c] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#03081c] to-transparent z-10 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
    </div>
  );
};

export default JobMelaTicker;
