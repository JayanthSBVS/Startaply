import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, GraduationCap, Building2, Briefcase, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJobs } from '../../context/JobsContext';

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1400",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1400",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1400",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1400",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1400"
];

const Hero = () => {
  const navigate = useNavigate();
  const { heroImages } = useJobs();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const dropdownRef = useRef(null);

  const images = (heroImages && heroImages.length >= 5) ? heroImages : DEFAULT_IMAGES;

  useEffect(() => {
    const img = new Image();
    img.src = images[(currentImg + 1) % images.length];
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentImg, images]);

  // Fetch suggestions with debouncing
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/jobs/search/suggestions?q=${encodeURIComponent(query)}`);
        if (Array.isArray(res.data)) {
          setSuggestions(res.data);
          setShowSuggestions(res.data.length > 0);
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.error("Suggestions fetch error:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (searchTerm) => {
    const finalQuery = searchTerm || query;
    if (!finalQuery.trim()) return;
    setShowSuggestions(false);
    navigate(`/jobs?company=${encodeURIComponent(finalQuery.trim())}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        setQuery(suggestions[selectedIndex]);
        handleSearch(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
      setShowSuggestions(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
  };

  return (
    <section className="relative bg-slate-900 border-b border-slate-800 overflow-hidden" style={{ minHeight: 'min(85vh, 700px)' }}>
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-900">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentImg}
            src={images[currentImg]}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 0.55, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
            className="w-full h-full object-cover absolute inset-0"
            alt=""
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/30 to-slate-900/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 to-transparent" />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImg(i)}
            className={`rounded-full transition-all duration-300 ${i === currentImg ? 'w-6 h-1.5 bg-emerald-400' : 'w-1.5 h-1.5 bg-white/30'}`}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-[min(85vh,700px)] px-4 py-16 md:py-20">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2 mb-6">
            <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-500/30 backdrop-blur-md">
              <GraduationCap size={13} /> Freshers
            </span>
            <span className="flex items-center gap-1.5 bg-slate-500/30 text-slate-200 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-500/40 backdrop-blur-md">
              <Building2 size={13} /> Govt Jobs
            </span>
            <span className="flex items-center gap-1.5 bg-teal-500/20 text-teal-300 px-3 py-1.5 rounded-full text-xs font-bold border border-teal-500/30 backdrop-blur-md">
              <Briefcase size={13} /> Gig & Services
            </span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-4 drop-shadow-xl">
            Your Career Starts Here.{' '}
            <br className="hidden sm:block" />
            <span className="text-emerald-400 drop-shadow-md">
              Zero Fees. Zero Friction.
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-sm sm:text-lg text-slate-300 max-w-xl mx-auto mb-8 font-medium leading-relaxed px-2">
            The ultimate launchpad for Freshers and Gig Workers. 100% free platform. No login required. Browse verified opportunities and apply instantly.
          </motion.p>

          <motion.div variants={itemVariants} className="max-w-2xl mx-auto mb-8 relative" ref={dropdownRef}>
            <div className="flex bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] overflow-hidden shadow-2xl focus-within:ring-2 focus-within:ring-emerald-500/60 focus-within:border-emerald-400 transition-all pl-2">
              <div className="flex items-center pl-4 shrink-0">
                <Search size={18} className="text-emerald-400" />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                placeholder="Job title, skills, or company..."
                className="flex-1 min-w-0 px-3 py-3.5 sm:py-4 text-sm sm:text-base outline-none text-white placeholder-slate-400 font-medium bg-transparent"
              />
              <button
                onClick={() => handleSearch()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 sm:px-8 font-bold transition-colors flex items-center justify-center shrink-0 gap-1.5 text-sm sm:text-base rounded-r-full"
              >
                <span className="hidden xs:inline">Search</span>
                <Search size={18} className="xs:hidden" />
              </button>
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 mt-3 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] py-4"
                >
                  <div className="px-5 mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Suggestions</span>
                    <span className="text-[10px] font-bold text-emerald-500/50">Press Enter to select</span>
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(suggestion);
                        handleSearch(suggestion);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full text-left px-6 py-3.5 flex items-center gap-4 transition-all duration-150 ${index === selectedIndex ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500' : 'text-slate-300 border-l-4 border-transparent hover:bg-slate-800/50'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                        {suggestion.includes(' ') ? <Briefcase size={14} className="text-slate-400" /> : <Building2 size={14} className="text-slate-400" />}
                      </div>
                      <span className="font-bold text-sm tracking-tight">{suggestion}</span>
                      <ChevronRight size={14} className={`ml-auto opacity-0 transition-opacity ${index === selectedIndex ? 'opacity-100' : ''}`} />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default Hero;