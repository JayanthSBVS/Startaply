import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ExternalLink, Sparkles, BellRing } from 'lucide-react';

const UPDATE_TYPES = [
  { label: 'Govt Notifications', color: 'text-amber-300' },
  { label: 'Exam Alerts',        color: 'text-blue-300' },
  { label: 'Admit Cards',        color: 'text-purple-300' },
  { label: 'Results',            color: 'text-rose-300' },
  { label: 'Job Melas',          color: 'text-emerald-300' },
  { label: 'Urgent Hiring',      color: 'text-orange-300' },
];

const JobMelaTicker = () => {
  const [activeMela, setActiveMela] = useState(null);
  const [badgeIdx, setBadgeIdx] = useState(0);

  useEffect(() => {
    axios.get('/api/job-mela/active')
      .then(res => { if (res.data) setActiveMela(res.data); })
      .catch(() => {});
  }, []);

  // Cycle through update type labels for the badge
  useEffect(() => {
    const t = setInterval(() => setBadgeIdx(p => (p + 1) % UPDATE_TYPES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const tickerText = activeMela?.tickerText ||
    '🚀 New Government Notifications • Exam Admit Cards Released • Urgent IT Hiring Drive • State Govt Jobs Open • Job Mela 2024 Registrations Live • Railway Recruitment Announced ✨';

  const currentType = UPDATE_TYPES[badgeIdx];

  return (
    <div className="relative z-40 bg-emerald-600/95 backdrop-blur-md border-y border-emerald-400/30 overflow-hidden group select-none shadow-[0_-10px_40px_rgba(16,185,129,0.1)]">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />

      <div className="flex items-center">
        {/* Animated Badge */}
        <div className="relative z-50 flex flex-col items-start gap-0.5 bg-slate-900 text-emerald-400 px-5 py-3 rounded-r-3xl font-black text-[10px] uppercase tracking-[0.15em] shadow-2xl border-r border-emerald-500/20 min-w-[100px] shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400">Live</span>
          </div>
          <span className={`transition-all duration-500 ${currentType.color}`} style={{ minWidth: 80 }}>
            {currentType.label}
          </span>
        </div>

        {/* Marquee */}
        <div className="flex-1 overflow-hidden relative py-3.5">
          <div className="ticker-wrapper flex items-center whitespace-nowrap">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-14 px-8">
                <span className="text-white text-sm md:text-base font-bold tracking-tight flex items-center gap-2.5">
                  <Sparkles size={15} className="text-emerald-300 opacity-70 shrink-0" />
                  {tickerText}
                </span>
                <Link
                  to="/job-melas"
                  className="bg-white text-emerald-700 px-4 py-1.5 rounded-full text-[11px] font-black shadow-[0_4px_15px_rgba(255,255,255,0.2)] hover:bg-emerald-50 transition-all flex items-center gap-1.5 shrink-0"
                >
                  VIEW ALL <ExternalLink size={12} />
                </Link>
                <div className="w-1.5 h-1.5 bg-emerald-300/40 rounded-full" />
              </div>
            ))}
          </div>

          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-emerald-600/95 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-emerald-600/95 to-transparent z-10 pointer-events-none" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .ticker-wrapper {
          display: inline-flex;
          animation: ticker-marquee 40s linear infinite;
        }
        .ticker-wrapper:hover {
          animation-play-state: paused;
          cursor: pointer;
        }
        @keyframes ticker-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (max-width: 768px) {
          .ticker-wrapper { animation-duration: 28s; }
        }
      `}} />
    </div>
  );
};

export default JobMelaTicker;