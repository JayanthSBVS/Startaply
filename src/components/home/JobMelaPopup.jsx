import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Calendar, MapPin, ArrowRight, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JobMelaPopup = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mela, setMela] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Check if popup has already been shown in this session
    const hasBeenShown = sessionStorage.getItem('mela_popup_shown');
    if (hasBeenShown) return;

    const API_BASE = 'http://localhost:5000';
    axios.get(`${API_BASE}/api/job-mela/active`)
      .then(res => {
        if (res.data && res.data.showpopup) {
          // Programmatically fix common typos found in DB content for a professional feel
          const melaData = { ...res.data };
          if (melaData.description) {
            melaData.description = melaData.description.replace(/thei sjob mea/gi, 'this job mela');
          }
          
          setMela(melaData);
          const timer = setTimeout(() => {
            setIsOpen(true);
            sessionStorage.setItem('mela_popup_shown', 'true');
          }, 4000); // 4s delay feels more professional
          return () => clearTimeout(timer);
        }
      })
      .catch(() => { });
  }, []);

  if (!mela) return null;

  const animationVariants = isMobile ? {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 }
  } : {
    initial: { scale: 0.9, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.9, opacity: 0, y: 20 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-[200] flex ${isMobile ? 'items-end' : 'items-center justify-center'} p-0 md:p-4`}>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            variants={animationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`relative bg-white w-full ${isMobile ? 'rounded-t-[2.5rem]' : 'max-w-4xl rounded-[2.5rem]'} overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] flex flex-col md:flex-row border border-slate-200`}
          >
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-6 right-6 z-30 bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-slate-500 transition-all active:scale-95"
            >
              <X size={20} />
            </button>

            {/* Content Area */}
            <div className={`p-8 ${isMobile ? 'pb-10' : 'md:p-14'} flex flex-col justify-center order-2 md:order-1 flex-1`}>
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-100 w-fit">
                <BellRing size={12} className="animate-pulse" /> Urgent Update
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4 md:mb-6">{mela.title}</h2>
              <p className="text-slate-500 font-medium mb-6 md:mb-8 line-clamp-2 md:line-clamp-3 leading-relaxed text-sm md:text-base">
                {mela.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                <div className="flex items-center gap-3 text-slate-700 font-bold bg-slate-50 p-3 md:p-4 rounded-2xl border border-slate-100">
                  <Calendar className="text-emerald-500" size={18} /> 
                  <span className="text-xs md:text-sm">{mela.date}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 font-bold bg-slate-50 p-3 md:p-4 rounded-2xl border border-slate-100">
                  <MapPin className="text-emerald-500" size={18} /> 
                  <span className="text-xs md:text-sm line-clamp-1">{mela.venue}</span>
                </div>
              </div>

              <a 
                href="/job-melas" 
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-10 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-600/30 active:scale-[0.98]"
              >
                Explore Drive <ArrowRight size={20} />
              </a>
            </div>

            {/* Image Area */}
            <div className={`${isMobile ? 'h-48' : 'w-full md:w-[40%] h-auto'} bg-slate-100 order-1 md:order-2 shrink-0 border-b md:border-b-0 md:border-l border-slate-100`}>
              <img 
                src={mela.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070'} 
                alt="Mela" 
                className="w-full h-full object-cover" 
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default JobMelaPopup;