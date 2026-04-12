import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Megaphone } from 'lucide-react';

const JobMelaTicker = () => {
  const [activeMela, setActiveMela] = useState(null);

  useEffect(() => {
    // Fetches the latest active mela which contains the ticker text 
    axios.get('/api/job-mela/active')
      .then(res => {
        if (res.data && res.data.tickertext) {
          setActiveMela(res.data);
        }
      })
      .catch(err => console.error("Ticker fetch error:", err));
  }, []);

  if (!activeMela || !activeMela.tickertext) return null;

  return (
    <div className="bg-emerald-600 py-3 border-y border-emerald-500 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 flex items-center">
        {/* Label badge stays fixed on the left */}
        <div className="flex items-center gap-2 bg-emerald-700 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shrink-0 z-10 shadow-lg">
          <Megaphone size={14} /> Update
        </div>

        {/* Marquee Container */}
        <div className="flex-1 overflow-hidden ml-4">
          <div className="ticker-wrapper flex whitespace-nowrap text-sm md:text-base font-bold text-white">
            <span className="ticker-item px-4">{activeMela.tickertext} — {activeMela.tickertext}</span>
            <span className="ticker-item px-4">{activeMela.tickertext} — {activeMela.tickertext}</span>
          </div>
        </div>
      </div>

      {/* Injected CSS for guaranteed scrolling behavior */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .ticker-wrapper {
          display: inline-flex;
          animation: ticker-scrolling 30s linear infinite;
        }
        @keyframes ticker-scrolling {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </div>
  );
};

export default JobMelaTicker;