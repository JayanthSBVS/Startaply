import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap, Briefcase, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useJobs } from '../../context/JobsContext';
import { usePageActivity } from '../../hooks/usePageActivity';

const MOBILE_PLACEHOLDERS = [
  'Search job title or role...',
  'e.g. Software Engineer',
  'e.g. Data Analyst',
  'e.g. Fresher / Graduate',
  'e.g. Remote Developer',
  'e.g. Product Manager',
];

const DESKTOP_PLACEHOLDERS = [
  'Search role, company, skill (e.g. Software Engineer, Bangalore)',
  'Search role, company, skill (e.g. Data Analyst, Remote)',
  'Search role, company, skill (e.g. Frontend Developer, Startup)',
  'Search role, company, skill (e.g. Product Manager, Hyderabad)',
  'Search role, company, skill (e.g. HR Executive, Full-time)',
];

const DesktopParallaxContainer = ({ children, heroImages, currentImageIdx }) => {
  const { scrollY } = useScroll();

  const bgY = useTransform(scrollY, [0, 800], ['0%', '30%']);
  const bgScale = useTransform(scrollY, [0, 800], [1, 1.08]);
  const contentY = useTransform(scrollY, [0, 800], [0, -60]);
  const contentOpacity = useTransform(scrollY, [0, 600], [1, 0]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: 'min(96vh, 900px)' }}>
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY, scale: bgScale }}>
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f14]/55 via-[#0b0f14]/65 to-[#0b0f14]/92" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f14]/70 via-transparent to-[#0b0f14]/30" />

        <div className="hidden md:block absolute top-0 right-[20%] w-[600px] h-[400px] rounded-full bg-brand/8 blur-[100px] pointer-events-none" />
        <div className="hidden md:block absolute bottom-0 left-[10%] w-[500px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 h-full w-full"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-center pt-24 md:pt-36 pb-10 md:pb-20 h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const StaticContainer = ({ children, heroImages, currentImageIdx, isMobile }) => {
  return (
    <div className="relative w-full h-full" style={{ minHeight: isMobile ? 'auto' : 'min(96vh, 900px)' }}>
      <div className="absolute inset-0 z-0">
        <img
          src={(heroImages && heroImages.length > 0) ? heroImages[currentImageIdx] : "/hero-bg.png"}
          alt="Hero Background"
          className="w-full h-full object-cover object-center absolute inset-0"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f14]/65 via-[#0b0f14]/75 to-[#0b0f14]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f14]/80 via-transparent to-[#0b0f14]/40" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-center pt-20 sm:pt-24 md:pt-36 pb-8 sm:pb-12 md:pb-20 h-full">
        {children}
      </div>
    </div>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  const { jobs, companies, melas, heroImages } = useJobs();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  const dropdownRef = useRef(null);
  const sectionRef = useRef(null);

  const { isMobile, shouldAnimate } = usePageActivity(sectionRef, { allowMobile: true });

  // Cycle placeholder & images only when allowed
  useEffect(() => {
    if (!shouldAnimate) return;
    const len = isMobile ? MOBILE_PLACEHOLDERS.length : DESKTOP_PLACEHOLDERS.length;
    const t = setInterval(() => setPlaceholderIdx(p => (p + 1) % len), 3000);
    return () => clearInterval(t);
  }, [shouldAnimate, isMobile]);

  useEffect(() => {
    if (!shouldAnimate || !heroImages || heroImages.length <= 1) return;
    const t = setInterval(() => setCurrentImageIdx(p => (p + 1) % heroImages.length), 6000);
    return () => clearInterval(t);
  }, [shouldAnimate, heroImages]);

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

  const content = (
    <>
      {/* ── Main Headline ────────────────────────────────────── */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-white font-black tracking-tight leading-[1.12] mb-3 md:mb-5 max-w-4xl"
        style={{ fontSize: isMobile ? 'clamp(1.85rem, 8vw, 2.45rem)' : 'clamp(2.75rem, 6vw, 5rem)' }}
      >
        Kickstart Your Career With Verified{' '}
        <span className="text-brand-hover dark:text-[#4D84FF]">Early Talent Roles</span>
      </motion.h1>

      {/* ── Subheading ─────────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="text-slate-300 text-xs sm:text-sm md:text-lg font-normal leading-relaxed max-w-2xl mb-5 md:mb-8"
      >
        Explore verified corporate job openings, internships, and walk-in drives across India — 100% free with direct recruiter applications.
      </motion.p>

      {/* ── Search Command Center ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl relative mb-3"
        ref={dropdownRef}
      >
        {/* ── MOBILE Search Bar ──────── */}
        <div className="sm:hidden relative">
          <div className="relative flex items-center bg-white/12 border border-white/20 rounded-2xl shadow-lg focus-within:bg-white/20 focus-within:border-brand-hover transition-all duration-200">
            <div className="pl-3.5 pr-2 shrink-0">
              <Search size={18} className="text-brand-hover" />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query.length >= 1 && setShowSuggestions(true)}
              autoComplete="off"
              spellCheck="false"
              className="flex-1 py-3.5 text-sm outline-none text-white placeholder-slate-400 font-medium bg-transparent min-w-0"
              placeholder={MOBILE_PLACEHOLDERS[placeholderIdx % MOBILE_PLACEHOLDERS.length]}
              style={{ minHeight: '50px' }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-2 text-slate-400 hover:text-white"
                aria-label="Clear search query"
              >
                ×
              </button>
            )}
            <div className="pr-1.5 shrink-0">
              <button
                onClick={() => handleSearch()}
                className="bg-brand hover:bg-brand-hover active:bg-brand-hover active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-brand/30 flex items-center gap-1.5 min-h-[42px]"
              >
                Search
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ── DESKTOP Search: Full inline layout ─────────────────────── */}
        <div className="hidden sm:block relative">
          <div className="flex bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] focus-within:ring-2 focus-within:ring-brand/50 focus-within:border-brand/50 transition-all duration-300 overflow-hidden">
            <div className="flex items-center pl-4">
              <Search size={18} className="text-brand-hover shrink-0" />
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
                placeholder={DESKTOP_PLACEHOLDERS[placeholderIdx % DESKTOP_PLACEHOLDERS.length]}
              />
            </div>
            <div className="py-1.5 pr-1.5">
              <button
                onClick={() => handleSearch()}
                className="group bg-brand hover:bg-brand-hover active:scale-95 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm transition-all shadow-lg shadow-brand/25 h-full min-h-[44px]"
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
                      ? 'bg-brand/10 text-brand-hover'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  <Search size={13} className={index === selectedIndex ? 'text-brand' : 'text-slate-500'} />
                  <span className="font-semibold text-sm">{suggestion}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Quick Filter Tags ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="flex flex-wrap gap-2 mb-4"
      >
        {[
          { icon: <GraduationCap size={13} />, label: 'Freshers (0-1y)', path: '/jobs?section=freshers' },
          { icon: <Briefcase size={13} />, label: 'IT & Software', path: '/category/IT%20%26%20Non-IT%20Jobs' },
          { icon: <Sparkles size={13} />, label: 'Top Startups', path: '/companies' },
          { icon: <ArrowRight size={13} />, label: 'Job Melas', path: '/job-melas' },
        ].map((tag) => (
          <button
            key={tag.label}
            onClick={() => navigate(tag.path)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/8 hover:bg-white/15 active:bg-white/20 text-slate-200 border border-white/12 transition-all active:scale-95 cursor-pointer min-h-[36px]"
          >
            {tag.icon}
            {tag.label}
          </button>
        ))}
      </motion.div>

      {/* ── Trust Strip - horizontal scroll on mobile ─────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.7 }}
        className="mt-4 md:mt-8 flex items-center gap-3.5 text-[11px] md:text-[12px] font-medium text-slate-400 overflow-x-auto no-scrollbar whitespace-nowrap pb-1"
      >
        <span className="flex items-center gap-1.5 shrink-0">
          <ShieldCheck size={14} className="text-emerald-400" />
          100% Verified
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0" />
        <span className="shrink-0">Zero Consulting Fees</span>
        <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0" />
        <span className="shrink-0">Direct Applications</span>
        {totalJobs > 0 && (
          <>
            <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0" />
            <span className="text-slate-200 font-bold shrink-0">{totalJobs}+ Active Jobs</span>
          </>
        )}
      </motion.div>
    </>
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden" style={{ minHeight: isMobile ? 'min(78vh, 580px)' : 'min(96vh, 900px)' }}>
      {shouldAnimate && !isMobile ? (
        <DesktopParallaxContainer heroImages={heroImages} currentImageIdx={currentImageIdx}>
          {content}
        </DesktopParallaxContainer>
      ) : (
        <StaticContainer heroImages={heroImages} currentImageIdx={currentImageIdx} isMobile={isMobile}>
          {content}
        </StaticContainer>
      )}

      {/* Bottom atmospheric fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-20 md:h-32 bg-gradient-to-t from-[#0b0f14] to-transparent z-20 pointer-events-none" />
    </section>
  );
};

export default Hero;
