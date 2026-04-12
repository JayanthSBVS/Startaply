import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Calendar, MapPin, ArrowRight, BellRing, Building2, ExternalLink } from 'lucide-react';

const JobMelaPopup = () => {
  const [mela, setMela] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if popup has already been shown in this session
    const hasBeenShown = sessionStorage.getItem('mela_popup_shown');
    if (hasBeenShown) return;

    axios.get('/api/job-mela/active')
      .then(res => {
        if (res.data && res.data.showpopup) {
          const melaData = { ...res.data };
          if (melaData.description) {
            melaData.description = melaData.description.replace(/thei sjob mea/gi, 'this job mela');
          }
          
          setMela(melaData);
          const timer = setTimeout(() => {
            setIsOpen(true);
            sessionStorage.setItem('mela_popup_shown', 'true');
          }, 3000); 
          return () => clearTimeout(timer);
        }
      })
      .catch(() => { });
  }, []);

  if (!isOpen || !mela) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        
        {/* Header Image */}
        {mela.image && (
          <div className="w-full h-40 bg-slate-100">
            <img 
              src={mela.image} 
              alt="Job Mela" 
              className="w-full h-full object-cover" 
            />
          </div>
        )}

        <button 
          onClick={() => setIsOpen(false)} 
          className="absolute top-4 right-4 z-10 bg-white/50 backdrop-blur border border-white/50 hover:bg-white p-2 rounded-full text-slate-700 transition-all shadow-sm"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-4 border border-emerald-100">
            <BellRing size={12} /> Upcoming Event
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">
            {mela.title}
          </h2>
          
          {mela.company && (
            <div className="flex items-center gap-2 text-slate-600 font-medium mb-4">
              <Building2 size={16} className="text-slate-400" /> {mela.company}
            </div>
          )}

          <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
            {mela.description}
          </p>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-slate-700 font-semibold">
              <Calendar className="text-emerald-500 shrink-0" size={16} /> 
              <span>{mela.date} {mela.time && `• ${mela.time}`}</span>
            </div>
            {mela.venue && (
              <div className="flex items-start gap-3 text-sm text-slate-700 font-semibold">
                <MapPin className="text-emerald-500 shrink-0 mt-0.5" size={16} /> 
                <span>{mela.venue}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {mela.registrationlink ? (
               <a 
                 href={mela.registrationlink.startsWith('http') ? mela.registrationlink : `https://${mela.registrationlink}`}
                 target="_blank" rel="noreferrer"
                 className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
               >
                 Register Now <ExternalLink size={16} />
               </a>
            ) : (
               <a 
                 href="/job-melas" 
                 className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
               >
                 View Details <ArrowRight size={16} />
               </a>
            )}
            <button 
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-white hover:bg-slate-50 text-slate-600 font-bold py-3 px-5 rounded-xl border border-slate-200 transition-all flex justify-center items-center"
            >
              Maybe Later
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JobMelaPopup;