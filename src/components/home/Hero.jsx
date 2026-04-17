import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, GraduationCap, Building2, Briefcase, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJobs } from '../../context/JobsContext';

const Hero = () => {
  const navigate = useNavigate();
  const { jobs, companies, heroImages, melas } = useJobs();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const dropdownRef = useRef(null);

  const images = (heroImages && heroImages.length > 0) ? heroImages : [];

  useEffect(() => {
    if (images.length === 0) return;
    const img = new Image();
    img.src = images[(currentImg + 1) % images.length];
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentImg, images.length]); // Only depend on length to prevent unnecessary cycles

  // Instant Local Search Suggestions (SEO & Perf Optimized)
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const q = query.toLowerCase();
    const matchedJobs = jobs?.filter(j => j.title && j.title.toLowerCase().includes(q)).map(j => j.title) || [];
    const matchedComps = companies?.filter(c => c.name && c.name.toLowerCase().includes(q)).map(c => c.name) || [];
    const matchedMelas = melas?.filter(m => m.title && m.title.toLowerCase().includes(q)).map(m => m.title) || [];

    const combined = Array.from(new Set([...matchedJobs, ...matchedComps, ...matchedMelas])).slice(0, 8);
    
    setSuggestions(combined);
    setShowSuggestions(combined.length > 0);
    setSelectedIndex(-1);
  }, [query, jobs, companies, melas]);

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
    <section className="relative bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 overflow-hidden" style={{ minHeight: 'min(85vh, 700px)' }}>
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-50 dark:bg-slate-900">
        <AnimatePresence mode="popLayout">
          {images.length > 0 && (
            <motion.img
              key={currentImg}
              src={images[currentImg]}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.95, scale: 1 }}
              className="w-full h-full object-cover absolute inset-0 transition-opacity duration-1000"
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              alt=""
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/40 dark:from-slate-900/40 dark:via-slate-900/25 dark:to-slate-900/60 backdrop-blur-[2px] transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent dark:from-slate-900/30 to-transparent" />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImg(i)}
            className={`rounded-full transition-all duration-300 ${i === currentImg ? 'w-6 h-1.5 bg-emerald-500 shadow-[0_0_10px_theme(colors.emerald.500)]' : 'w-1.5 h-1.5 bg-slate-300 dark:bg-white/30'}`}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-[min(85vh,700px)] px-4 py-16 md:py-20">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2 mb-6">
            <span className="flex items-center gap-1.5 glass-light dark:bg-emerald-500/10 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-4 py-2 rounded-full text-xs font-black border border-emerald-400/20 dark:border-emerald-500/20 transition-all shadow-sm hover:shadow-emerald-500/20 hover:-translate-y-0.5 cursor-default">
              <GraduationCap size={14} /> Freshers
            </span>
            <span className="flex items-center gap-1.5 glass-light dark:bg-blue-500/10 hover:bg-blue-50 dark:hover:bg-blue-500/20 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full text-xs font-black border border-blue-400/20 dark:border-blue-500/20 transition-all shadow-sm hover:shadow-blue-500/20 hover:-translate-y-0.5 cursor-default">
              <Briefcase size={14} /> Private Jobs
            </span>
            <span className="flex items-center gap-1.5 glass-light dark:bg-slate-500/10 hover:bg-slate-50 dark:hover:bg-slate-500/20 text-slate-800 dark:text-slate-300 px-4 py-2 rounded-full text-xs font-black border border-slate-400/20 dark:border-slate-500/20 transition-all shadow-sm hover:shadow-slate-500/20 hover:-translate-y-0.5 cursor-default">
              <Building2 size={14} /> Govt Jobs
            </span>
            <span className="flex items-center gap-1.5 glass-light dark:bg-teal-500/10 hover:bg-teal-50 dark:hover:bg-teal-500/20 text-teal-800 dark:text-teal-300 px-4 py-2 rounded-full text-xs font-black border border-teal-400/20 dark:border-teal-500/20 transition-all shadow-sm hover:shadow-teal-500/20 hover:-translate-y-0.5 cursor-default">
              <Zap size={14} /> Gig & Services
            </span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-4 drop-shadow-sm dark:drop-shadow-xl">
            Your Career Starts Here.{' '}
            <br className="hidden sm:block" />
            <span className="text-emerald-600 dark:text-emerald-400 drop-shadow-sm dark:drop-shadow-md">
              Zero Fees. Zero Friction.
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-8 font-medium leading-relaxed px-2">
            The ultimate launchpad for Freshers and Gig Workers. 100% free platform. No login required. Browse verified opportunities and apply instantly.
          </motion.p>

          <motion.div variants={itemVariants} className="max-w-2xl mx-auto mb-8 relative" ref={dropdownRef}>
            <div className="flex bg-white/30 dark:bg-white/10 backdrop-blur-xl border border-white/50 dark:border-white/20 rounded-[2rem] overflow-hidden shadow-2xl focus-within:ring-2 focus-within:ring-emerald-500/60 transition-all pl-2">
              <div className="flex items-center pl-4 shrink-0">
                <Search size={18} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                placeholder="Job title, skills, or company..."
                className="flex-1 min-w-0 px-3 py-3.5 sm:py-4 text-sm sm:text-base outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium bg-transparent"
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
                  className="absolute left-0 right-0 mt-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-[2rem] overflow-hidden shadow-2xl z-[100] py-4"
                >
                  <div className="px-5 mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em]">Suggestions</span>
                    <span className="text-[10px] font-bold text-emerald-600/50 dark:text-emerald-500/50">Press Enter to select</span>
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(suggestion);
                        handleSearch(suggestion);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full text-left px-6 py-3.5 flex items-center gap-4 transition-all duration-150 ${index === selectedIndex ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-l-4 border-emerald-500' : 'text-slate-700 dark:text-slate-300 border-l-4 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                        {suggestion.includes(' ') ? <Briefcase size={14} className="text-slate-400" /> : <Building2 size={14} className="text-slate-400" />}
                      </div>
                      <span className="font-bold text-sm tracking-tight">{suggestion}</span>
                      <ChevronRight size={14} className={`ml-auto text-emerald-500 transition-opacity ${index === selectedIndex ? 'opacity-100' : 'opacity-0'}`} />
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