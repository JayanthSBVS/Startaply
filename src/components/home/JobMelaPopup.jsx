import React, { useEffect, useState } from 'react';
import { X, Calendar, ArrowRight, BellRing, Building2, ExternalLink } from 'lucide-react';
import { useJobs } from '../../context/JobsContext';

const JobMelaPopup = () => {
  const { melas } = useJobs();
  const [mela, setMela]   = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Don't show again in the same session
    const hasBeenShown = sessionStorage.getItem('mela_popup_shown');
    if (hasBeenShown) return;

    // Wait until melas are loaded from context (no separate API call needed)
    if (!melas || melas.length === 0) return;

    // Find the first active mela that has showPopup set
    const activeMela = melas.find(m => m.showPopup || m.showpopup);
    if (!activeMela) return;

    const melaData = { ...activeMela };
    if (melaData.description) {
      melaData.description = melaData.description.replace(/thei sjob mea/gi, 'this job mela');
    }

    setMela(melaData);

    // Show after 5-second delay
    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem('mela_popup_shown', 'true');
    }, 5000);

    return () => clearTimeout(timer);
  }, [melas]); // re-run if melas loads after initial render

  if (!isOpen || !mela) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-500"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative bg-white dark:bg-[#0b0f14] w-full max-w-3xl rounded-[2rem] sm:rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_0_100px_rgba(16,185,129,0.15)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/40 dark:border-white/10 z-10 transition-colors">

        {/* Decorative Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="flex flex-col md:flex-row h-full relative">
          {/* Left Image Section */}
          <div className="relative md:w-5/12 h-48 md:h-auto overflow-hidden shrink-0">
            {mela.image ? (
              <img
                src={mela.image}
                alt="Job Mela Banner"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-emerald-950/30">
                <Building2 size={80} className="text-emerald-500/30" />
              </div>
            )}
            
            {/* Desktop Gradient Overlay (horizontal) & Mobile Gradient Overlay (vertical) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent md:bg-gradient-to-r md:from-transparent md:to-white md:dark:to-[#0b0f14]" />
            
            <div className="absolute top-5 left-5 z-10">
              <div className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/30 backdrop-blur-md">
                <BellRing size={14} className="animate-bounce" /> Mega Event
              </div>
            </div>
          </div>

          {/* Right Content Section */}
          <div className="p-6 md:p-10 flex flex-col justify-center relative z-10 md:w-7/12">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 z-20 bg-slate-100/80 dark:bg-white/5 backdrop-blur-md hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 p-2.5 rounded-full text-slate-500 dark:text-slate-400 transition-all active:scale-95"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight mt-2 md:mt-0 pr-8">
              {mela.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-300 font-bold text-sm mb-6">
              {mela.company && (
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                  <Building2 size={16} className="text-emerald-600 dark:text-emerald-400" /> {mela.company}
                </div>
              )}
              {mela.date && (
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                  <Calendar className="text-emerald-600 dark:text-emerald-400" size={16} /> {mela.date}
                </div>
              )}
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mb-8 line-clamp-3 font-medium leading-relaxed">
              {mela.description}
            </p>

            <div className="flex flex-col gap-3 mb-10">
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-4 shadow-sm transition-colors hover:border-emerald-200 dark:hover:border-emerald-500/30">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Calendar className="text-emerald-600 dark:text-emerald-400" size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">When</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{mela.time || 'TBD'}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-4 shadow-sm transition-colors hover:border-amber-200 dark:hover:border-amber-500/30">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Building2 className="text-amber-600 dark:text-amber-400" size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Where</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-200 line-clamp-1">{mela.venue || 'TBD'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              {mela.registrationLink ? (
                <a
                  href={mela.registrationLink.startsWith('http') ? mela.registrationLink : `https://${mela.registrationLink}`}
                  target="_blank" rel="noreferrer"
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(16,185,129,0.3)] active:scale-95 group text-sm md:text-base"
                >
                  Register Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <a
                  href="/job-melas"
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(16,185,129,0.3)] active:scale-95 group text-sm md:text-base"
                >
                  Explore Details <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 text-sm md:text-base border border-slate-200 dark:border-white/5"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobMelaPopup;
