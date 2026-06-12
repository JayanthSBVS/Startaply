import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap, Building2, Briefcase, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useJobs } from '../../context/JobsContext';

const PLACEHOLDERS = [
  'Software Engineer, Bangalore',
  'Government Teacher vacancy',
  'Data Analyst, remote',
  'Bank PO 2025',
  'Frontend Developer, startup',
];

const Hero = () => {
  const navigate = useNavigate();
  const { jobs, companies, melas, heroImages } = useJobs();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const sectionRef = useRef(null);

  // Detect mobile - disable parallax on mobile for 60fps
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  // Scroll parallax - desktop only
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', isMobile ? '0%' : '30%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, isMobile ? 1 : 1.08]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 0 : -60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, isMobile ? 1 : 0]);

  // Cycle placeholder & images
  useEffect(() => {
    const t = setInterval(() => setPlaceholderIdx(p => (p + 1) % PLACEHOLDERS.length), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!heroImages || heroImages.length <= 1) return;
    const t = setInterval(() => setCurrentImageIdx(p => (p + 1) % heroImages.length), 6000);
    return () => clearInterval(t);
  }, [heroImages]);

  // Search suggestions
  useEffect(() => {
    if (!query || query.length < 1) { setSuggestions([]); setShowSuggestions(false); return; }
    const q = query.toLowerCase();
    const matchedJobs  = (jobs || []).filter(j => j.title?.toLowerCase().includes(q)).map(j => j.title);
    const matchedComps = (companies || []).filter(c => c.name?.toLowerCase().includes(q)).map(c => c.name);
    const matchedMelas = (melas || []).filter(m => m.title?.toLowerCase().includes(q)).map(m => m.title);
    const combined = Array.from(new Set([...matchedJobs, ...matchedComps, ...matchedMelas])).slice(0, 6);
    setSuggestions(combined);
    setShowSuggestions(combined.length > 0);
    setSelectedIndex(-1);
  }, [query, jobs, companies, melas]);

  const handleSearch = useCallback((searchTerm) => {
    const finalQuery = searchTerm || query;
    if (!finalQuery.trim()) return;
    setShowSuggestions(false);
    navigate(`/jobs?company=${encodeURIComponent(finalQuery.trim())}`);
  }, [query, navigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        setQuery(suggestions[selectedIndex]);
        handleSearch(suggestions[selectedIndex]);
      } else { handleSearch(); }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
      setShowSuggestions(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Escape') { setShowSuggestions(false); }
  }, [selectedIndex, suggestions, handleSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalJobs = (jobs || []).length;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ minHeight: isMobile ? 'min(78vh, 580px)' : 'min(96vh, 900px)' }}
    >
      {/* ── Cinematic Full-Width Background ──────────────────────────────── */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: bgY, scale: bgScale }}
      >
        <AnimatePresence>
          <motion.img
            key={currentImageIdx}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            src={(heroImages && heroImages.length > 0) ? heroImages[currentImageIdx] : "/hero-bg.png"}
            alt="Hero Background"
            className="w-full h-full object-cover object-center absolute inset-0"
            loading="eager"
          />
        </AnimatePresence>
        {/* Dark gradient overlays - stronger on mobile for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f14]/55 via-[#0b0f14]/65 to-[#0b0f14]/92" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f14]/70 via-transparent to-[#0b0f14]/30" />

        {/* Ambient glows - hidden on mobile (GPU cost) */}
        <div className="hidden md:block absolute top-0 right-[20%] w-[600px] h-[400px] rounded-full bg-emerald-500/8 blur-[100px] pointer-events-none" />
        <div className="hidden md:block absolute bottom-0 left-[10%] w-[500px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
      </motion.div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <motion.div
        style={{
          y: contentY,
          opacity: contentOpacity,
          minHeight: isMobile ? 'min(78vh, 580px)' : 'min(96vh, 900px)',
        }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-center pt-24 md:pt-36 pb-10 md:pb-20"
      >
        {/* Category Pills - compact on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap gap-1.5 mb-5 md:mb-8"
        >
          {[
            { icon: <GraduationCap size={11} />, label: 'Freshers', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
            { icon: <Briefcase size={11} />, label: 'Private Jobs', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25' },
            { icon: <Building2 size={11} />, label: 'Govt Jobs', color: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
            { icon: <Sparkles size={11} />, label: 'Startups', color: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
          ].map((pill) => (
            <button
              key={pill.label}
              onClick={() => navigate('/jobs')}
              className={`flex items-center gap-1 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-[11px] font-bold border transition-all active:scale-95 cursor-pointer ${pill.color}`}
              style={{ minHeight: '28px' }}
            >
              {pill.icon}
              {pill.label}
            </button>
          ))}
        </motion.div>

        {/* ── Main Headline ─────────────────────────────────────────────── */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-white font-black tracking-tight leading-[1.0] mb-4 md:mb-6 max-w-4xl"
          style={{ fontSize: isMobile ? 'clamp(1.85rem, 8.5vw, 2.6rem)' : 'clamp(2.6rem, 6.5vw, 5.5rem)' }}
        >
          Kickstart Your Career With The{' '}
          <span className="text-gradient-emerald-cyan">Best Early Talent Roles</span>
        </motion.h1>

        {/* ── Subheading - truncated on mobile ──────────────────────────── */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="text-slate-300 text-sm md:text-lg font-medium leading-relaxed max-w-2xl mb-6 md:mb-10 line-clamp-2 md:line-clamp-none"
        >
          Explore startup hiring drives, verified openings, internships, and fast-growing companies - all verified, all free, all on one platform.
        </motion.p>

        {/* ── Search Command Center ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl relative"
          ref={dropdownRef}
        >
          {/* ── MOBILE Search: Premium single-row discovery bar ──────── */}
          <div className="sm:hidden relative">
            <div className="relative flex items-center bg-white/12 border border-white/25 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.15)] focus-within:bg-white/18 focus-within:border-emerald-400/60 focus-within:shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_3px_rgba(16,185,129,0.15)] transition-all duration-300">
              {/* Search icon - left side */}
              <div className="pl-4 pr-2 shrink-0">
                <Search size={19} className="text-emerald-400" />
              </div>
              {/* Input */}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => query.length >= 1 && setShowSuggestions(true)}
                autoComplete="off"
                spellCheck="false"
                className="flex-1 py-4 text-[15px] outline-none text-white placeholder-slate-400/80 font-medium bg-transparent min-w-0"
                placeholder={PLACEHOLDERS[placeholderIdx]}
                style={{ minHeight: '52px' }}
              />
              {/* Search button - right side, always visible */}
              <div className="pr-2 shrink-0">
                <button
                  onClick={() => handleSearch()}
                  className="bg-emerald-500 active:bg-emerald-600 active:scale-95 text-slate-950 font-black px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/30 flex items-center gap-1.5 whitespace-nowrap"
                  style={{ minHeight: '44px' }}
                >
                  Search
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* ── DESKTOP Search: Full inline layout ─────────────────────── */}
          <div className="hidden sm:block relative">
            <div className="flex bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500/40 transition-all duration-300 overflow-hidden">
              <div className="flex items-center pl-4">
                <Search size={18} className="text-emerald-400 shrink-0" />
              </div>
              <div className="relative flex-1">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => query.length >= 1 && setShowSuggestions(true)}
                  autoComplete="off"
                  spellCheck="false"
                  className="w-full px-3 py-4 text-base outline-none text-white placeholder-slate-400 font-medium bg-transparent"
                  placeholder={PLACEHOLDERS[placeholderIdx]}
                />
              </div>
              <div className="py-1.5 pr-1.5">
                <button
                  onClick={() => handleSearch()}
                  className="group bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm transition-all shadow-lg shadow-emerald-500/25 h-full"
                >
                  Explore Jobs
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 right-0 mt-2 bg-[#0f1621]/95 border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-[100] py-2"
              >
                <div className="px-4 py-2 mb-1 flex items-center justify-between border-b border-white/5">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Suggestions</span>
                  <span className="text-[9px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded">↵ to select</span>
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => { setQuery(suggestion); handleSearch(suggestion); }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-100 ${
                      index === selectedIndex
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    <Search size={13} className={index === selectedIndex ? 'text-emerald-500' : 'text-slate-500'} />
                    <span className="font-semibold text-sm">{suggestion}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── CTA Buttons Row ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-wrap items-center gap-4 mt-4 md:mt-6"
        >
          <button
            onClick={() => navigate('/job-melas')}
            className="font-bold text-sm text-white/80 hover:text-white transition-colors active:opacity-70"
            style={{ minHeight: '44px' }}
          >
            Upcoming Job Melas →
          </button>
        </motion.div>

        {/* ── Trust Strip - horizontal scroll on mobile ─────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.8 }}
          className="mt-5 md:mt-10 flex items-center gap-4 text-[11px] md:text-[12px] font-semibold text-slate-400 overflow-x-auto no-scrollbar whitespace-nowrap pb-1"
        >
          <span className="flex items-center gap-1.5 shrink-0">
            <ShieldCheck size={13} className="text-emerald-400" />
            100% Verified
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0" />
          <span className="shrink-0">Zero Consulting Fees</span>
          <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0" />
          <span className="shrink-0">Direct Applications</span>
          {totalJobs > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0" />
              <span className="text-emerald-400 font-bold shrink-0">{totalJobs}+ Active Jobs</span>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Bottom atmospheric fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-20 md:h-32 bg-gradient-to-t from-[#0b0f14] to-transparent z-20 pointer-events-none" />
    </section>
  );
};

export default Hero;
