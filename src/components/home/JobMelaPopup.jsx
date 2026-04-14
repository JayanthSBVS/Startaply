import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Calendar, MapPin, ArrowRight, BellRing, Building2, ExternalLink } from 'lucide-react';

const JobMelaPopup = () => {
  const [mela, setMela] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem('mela_popup_shown');
    if (hasBeenShown) return;

    let timer;

    axios.get('/api/job-mela/active')
      .then(res => {
        // DB returns lowercase 'showpopup'
        if (res.data && res.data.showPopup) {
          const melaData = { ...res.data };
          if (melaData.description) {
            melaData.description = melaData.description.replace(/thei sjob mea/gi, 'this job mela');
          }

          setMela(melaData);

          // Trigger exact 5 second delay
          timer = setTimeout(() => {
            setIsOpen(true);
            sessionStorage.setItem('mela_popup_shown', 'true');
          }, 5000);
        }
      })
      .catch(() => { });

    // Proper cleanup block to prevent memory leaks
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!isOpen || !mela) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-slate-800 z-10">

        {/* Banner Section */}
        <div className="relative h-56 w-full overflow-hidden bg-slate-800">
          {mela.image ? (
            <img
              src={mela.image}
              alt="Job Mela Banner"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600/20 to-slate-900 border-b border-slate-800">
              <Building2 size={60} className="text-emerald-500/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 z-20 bg-slate-900/60 backdrop-blur-md border border-white/10 hover:bg-emerald-500 hover:text-slate-950 p-2.5 rounded-full text-white transition-all shadow-xl active:scale-95"
          >
            <X size={20} />
          </button>

          <div className="absolute bottom-6 left-8 z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500 text-slate-950 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20">
              <BellRing size={14} className="animate-bounce" /> Mega Event
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <h2 className="text-3xl font-black text-white mb-3 leading-tight tracking-tight">
            {mela.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 font-bold text-sm mb-6">
            {mela.company && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                <Building2 size={16} className="text-emerald-400" /> {mela.company}
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
              <Calendar className="text-emerald-400" size={16} /> {mela.date}
            </div>
          </div>

          <p className="text-slate-400 text-base mb-8 line-clamp-4 font-medium leading-relaxed">
            {mela.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">When</span>
              <span className="text-sm font-bold text-slate-200">{mela.time || 'TBD'}</span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Where</span>
              <span className="text-sm font-bold text-slate-200 line-clamp-1">{mela.venue || 'TBD'}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {mela.registrationLink ? (
              <a
                href={mela.registrationLink.startsWith('http') ? mela.registrationLink : `https://${mela.registrationLink}`}
                target="_blank" rel="noreferrer"
                className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 px-8 rounded-full flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group"
              >
                Secure Your Seat <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
            ) : (
              <a
                href="/job-melas"
                className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 px-8 rounded-full flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
              >
                Explore Details <ArrowRight size={20} />
              </a>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-4 px-8 rounded-full border border-white/5 transition-all flex justify-center items-center active:scale-95"
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