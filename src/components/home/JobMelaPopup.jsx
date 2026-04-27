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
        className="absolute inset-0 bg-slate-950/80 dark:bg-black/90 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_80px_rgba(16,185,129,0.15)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-slate-200 dark:border-slate-800/80 z-10 transition-colors">

        {/* Banner Section */}
        <div className="relative h-40 sm:h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {mela.image ? (
            <img
              src={mela.image}
              alt="Job Mela Banner"
              className="w-full h-full object-cover transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600/10 dark:from-emerald-600/20 to-slate-200 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
              <Building2 size={60} className="text-emerald-500/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-white/20 dark:via-slate-900/20 to-transparent" />

          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 z-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-slate-950 p-2.5 rounded-full text-slate-900 dark:text-white transition-all shadow-xl active:scale-95"
          >
            <X size={20} />
          </button>

          <div className="absolute bottom-6 left-8 z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20">
              <BellRing size={14} className="animate-bounce" /> Mega Event
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 sm:mb-3 leading-tight tracking-tight">
            {mela.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400 font-bold text-sm mb-6">
            {mela.company && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                <Building2 size={16} className="text-emerald-600 dark:text-emerald-400" /> {mela.company}
              </div>
            )}
            {mela.date && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                <Calendar className="text-emerald-600 dark:text-emerald-400" size={16} /> {mela.date}
              </div>
            )}
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mb-4 sm:mb-8 line-clamp-3 sm:line-clamp-4 font-medium leading-relaxed">
            {mela.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-1">
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">When</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{mela.time || 'TBD'}</span>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-1">
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Where</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-200 line-clamp-1">{mela.venue || 'TBD'}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {mela.registrationLink ? (
              <a
                href={mela.registrationLink.startsWith('http') ? mela.registrationLink : `https://${mela.registrationLink}`}
                target="_blank" rel="noreferrer"
                className="flex-[2] bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-black py-3 sm:py-4 px-8 rounded-full flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 group"
              >
                Secure Your Seat <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
            ) : (
              <a
                href="/job-melas"
                className="flex-[2] bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-black py-4 px-8 rounded-full flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
              >
                Explore Details <ArrowRight size={20} />
              </a>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3 sm:py-4 px-8 rounded-full border border-slate-200 dark:border-white/5 transition-all flex justify-center items-center active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobMelaPopup;