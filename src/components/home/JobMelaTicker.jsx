import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Megaphone, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const JobMelaTicker = () => {
  const [activeMela, setActiveMela] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch active JobMela from backend
    axios.get('/api/job-mela/active')
      .then(res => {
        if (res.data) {
          // Property mapping: backend returns 'tickerText' (via our query mapping)
          setActiveMela(res.data);
        }
      })
      .catch(err => console.error("Ticker fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Fallback content if no active event is found (Senior UI strategy)
  const tickerText = activeMela?.tickerText || "🚀 Big JobMela 2024 is approaching! Stay tuned for massive hiring opportunities from TOP tech industries. Over 500+ positions expected! ✨";
  const registrationLink = activeMela?.registrationLink;

  return (
    <div className="relative z-40 bg-emerald-600/95 backdrop-blur-md border-y border-emerald-400/30 overflow-hidden group select-none shadow-[0_-10px_40px_rgba(16,185,129,0.1)]">
      {/* Decorative inner glow */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />
      
      <div className="flex items-center">
        {/* News Badge - Premium Glassmorphism */}
        <div className="relative z-50 flex items-center gap-2.5 bg-slate-900 text-emerald-400 px-6 py-4 rounded-r-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl border-r border-emerald-500/20 group-hover:bg-black transition-colors duration-500">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="hidden md:inline">Live JobMela</span> News
        </div>

        {/* Marquee Container */}
        <div className="flex-1 overflow-hidden relative py-4">
          <div className="ticker-wrapper flex items-center whitespace-nowrap">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-12 px-6">
                <span className="text-white text-base md:text-lg font-bold tracking-tight flex items-center gap-3">
                  <Sparkles size={18} className="text-emerald-300 opacity-60" />
                  {tickerText}
                </span>

                <Link 
                  to="/job-melas"
                  className="bg-white text-emerald-700 px-5 py-2 rounded-full text-xs font-black shadow-[0_4px_15px_rgba(255,255,255,0.3)] hover:bg-emerald-50 transition-all flex items-center gap-2"
                >
                  REGISTER NOW <ExternalLink size={14} />
                </Link>
                
                {/* Separator Ball */}
                <div className="w-2 h-2 bg-emerald-400/30 rounded-full" />
              </div>
            ))}
          </div>
          
          {/* Fades for smooth entry/exit */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-emerald-600/95 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-emerald-600/95 to-transparent z-10 pointer-events-none" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .ticker-wrapper {
          display: inline-flex;
          animation: ticker-marquee 35s linear infinite;
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
          .ticker-wrapper {
            animation-duration: 25s;
          }
        }
      `}} />
    </div>
  );
};

export default JobMelaTicker;