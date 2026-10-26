import React, { useEffect, useState } from 'react';
import { X, Calendar, ArrowRight, BellRing, Building2, MapPin, Clock } from 'lucide-react';
import { useJobs } from '../../context/JobsContext';
import { motion, AnimatePresence } from 'framer-motion';

const JobMelaPopup = () => {
  const { melas } = useJobs();
  const [mela, setMela]   = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem('mela_popup_shown');
    if (hasBeenShown) return;
    if (!melas || melas.length === 0) return;

    const activeMela = melas.find(m => m.showPopup || m.showpopup);
    if (!activeMela) return;

    const melaData = { ...activeMela };
    if (melaData.description) {
      melaData.description = melaData.description.replace(/thei sjob mea/gi, 'this job mela');
    }

    setMela(melaData);

    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem('mela_popup_shown', 'true');
    }, 5000);

    return () => clearTimeout(timer);
  }, [melas]);

  if (!mela) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
          style={{ padding: 'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Job Mela notification"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/70 dark:bg-black/85 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* ── MOBILE: Premium Bottom Sheet ─────────────────────────── */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="sm:hidden relative bg-white dark:bg-[#0a0a0a] w-full rounded-t-[2.25rem] shadow-[0_-20px_60px_rgba(0,0,0,0.35)] border-t border-slate-200/90 dark:border-neutral-800 z-10 flex flex-col max-h-[85vh] overflow-hidden"
          >
            {/* Drag Handle Bar */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-neutral-700" />
            </div>

            {/* Close Button (44x44 Touch Target) */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 z-30 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate-900/40 hover:bg-slate-900/60 dark:bg-black/60 text-white backdrop-blur-md active:scale-95 transition-all cursor-pointer shadow-md"
              aria-label="Close notification"
            >
              <X size={18} />
            </button>

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto flex-1 overscroll-contain">
              {/* Event Visual Banner */}
              <div className="relative h-44 overflow-hidden bg-slate-950 shrink-0">
                <img
                  src={mela.bannerImage || mela.bannerimage || mela.image || '/hero-bg.png'}
                  alt={mela.title || 'Job Mela'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/hero-bg.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-3 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 bg-brand text-on-brand px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg shadow-brand/30">
                    <BellRing size={11} className="animate-bounce" /> Mega Drive Event
                  </span>
                </div>
                {mela.date && (
                  <div className="absolute bottom-3 left-4 z-10 flex items-center gap-1.5 text-xs font-extrabold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                    <Calendar size={13} className="text-brand-hover" />
                    <span>{mela.date}</span>
                  </div>
                )}
              </div>

              {/* Text Info Container */}
              <div className="px-5 pt-4 pb-4">
                {/* Title */}
                <h2 className="text-lg font-black text-slate-950 dark:text-white mb-2.5 leading-snug">
                  {mela.title}
                </h2>

                {/* Company / Sector Badges */}
                {mela.company && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-neutral-700 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Building2 size={13} className="text-brand" />
                      <span>{mela.company}</span>
                    </div>
                  </div>
                )}

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mb-4 leading-relaxed">
                  {mela.description}
                </p>

                {/* When & Where Details Grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-2">
                  <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl p-3">
                    <Clock size={16} className="text-brand shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-brand dark:text-brand-hover uppercase tracking-wider">Timing</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{mela.time || '10:00 AM Onwards'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-xl p-3">
                    <MapPin size={16} className="text-indigo-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Venue</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{mela.venue || 'Direct Campus / Hub'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pinned Sticky Bottom Actions Bar (Always Visible on Mobile) */}
            <div className="p-4 border-t border-slate-100 dark:border-neutral-800 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md flex items-center gap-2.5 pb-[calc(1rem+env(safe-area-inset-bottom))] shrink-0">
              {mela.registrationLink ? (
                <a
                  href={mela.registrationLink.startsWith('http') ? mela.registrationLink : `https://${mela.registrationLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-[2] bg-brand hover:bg-brand-hover text-on-brand font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md shadow-brand/25 active:scale-95 transition-all min-h-[46px]"
                >
                  <span>Register Free</span>
                  <ArrowRight size={15} />
                </a>
              ) : (
                <a
                  href="/job-melas"
                  className="flex-[2] bg-brand hover:bg-brand-hover text-on-brand font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md shadow-brand/25 active:scale-95 transition-all min-h-[46px]"
                >
                  <span>Explore Details</span>
                  <ArrowRight size={15} />
                </a>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300 font-bold py-3 px-3 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-neutral-700 active:scale-95 transition-all min-h-[46px]"
              >
                Dismiss
              </button>
            </div>
          </motion.div>

          {/* ── DESKTOP: Centered Modal ──────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="hidden sm:block relative bg-white dark:bg-[#0a0a0a] w-full max-w-3xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_0_100px_rgba(0,31,142,0.25)] border border-white/30 dark:border-[#1f1f1f] z-10 overflow-hidden mx-4"
          >
            {/* Decorative Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/15 dark:bg-brand/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/15 dark:bg-indigo-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

            <div className="flex flex-col md:flex-row h-full relative">
              {/* Left Image Section */}
              <div className="relative md:w-5/12 h-56 md:h-auto overflow-hidden shrink-0 bg-slate-900">
                <img
                  src={mela.image || '/workspace-editorial.png'}
                  alt={mela.title || 'Job Mela Banner'}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/workspace-editorial.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-white md:dark:to-[#0a0a0a]" />
                <div className="absolute top-5 left-5 z-10">
                  <div className="inline-flex items-center gap-2 bg-brand text-on-brand px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand/30 backdrop-blur-md">
                    <BellRing size={14} className="animate-bounce" /> Mega Event
                  </div>
                </div>
              </div>

              {/* Right Content Section */}
              <div className="p-8 md:p-10 flex flex-col justify-center relative z-10 md:w-7/12">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-5 right-5 z-20 bg-slate-100/80 dark:bg-white/5 backdrop-blur-md hover:bg-brand-soft hover:text-brand dark:hover:text-brand-hover p-2.5 rounded-full text-slate-500 dark:text-slate-400 transition-all active:scale-95"
                  aria-label="Close popup"
                >
                  <X size={20} />
                </button>

                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tight mt-2 md:mt-0 pr-8">
                  {mela.title}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-300 font-bold text-sm mb-6">
                  {mela.company && (
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                      <Building2 size={16} className="text-brand dark:text-brand-hover" /> {mela.company}
                    </div>
                  )}
                  {mela.date && (
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                      <Calendar className="text-brand dark:text-brand-hover" size={16} /> {mela.date}
                    </div>
                  )}
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mb-8 line-clamp-3 font-medium leading-relaxed">
                  {mela.description}
                </p>

                <div className="flex flex-col gap-3 mb-8">
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-4 shadow-sm transition-colors hover:border-brand/30">
                    <div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center shrink-0">
                      <Calendar className="text-brand dark:text-brand-hover" size={22} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-brand dark:text-brand-hover uppercase tracking-widest">When</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{mela.time || 'TBD'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-4 shadow-sm transition-colors hover:border-indigo-200 dark:hover:border-indigo-500/30">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <Building2 className="text-indigo-600 dark:text-indigo-400" size={22} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Where</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-200 line-clamp-1">{mela.venue || 'TBD'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                  {mela.registrationLink ? (
                    <a
                      href={mela.registrationLink.startsWith('http') ? mela.registrationLink : `https://${mela.registrationLink}`}
                      target="_blank" rel="noreferrer"
                      className="flex-[2] bg-brand hover:bg-brand-hover text-on-brand font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand/25 active:scale-95 group text-sm md:text-base"
                    >
                      Register Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                  ) : (
                    <a
                      href="/job-melas"
                      className="flex-[2] bg-brand hover:bg-brand-hover text-on-brand font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand/25 active:scale-95 group text-sm md:text-base"
                    >
                      Explore Details <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-slate-100 dark:bg-[#121212] hover:bg-slate-200 dark:hover:bg-[#1a1a1a] text-slate-700 dark:text-slate-200 font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 text-sm md:text-base border border-slate-200 dark:border-[#1f1f1f]"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JobMelaPopup;
