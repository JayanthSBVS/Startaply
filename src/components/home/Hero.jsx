import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap, Building2, Briefcase, ChevronRight, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useJobs } from '../../context/JobsContext';

// ── Floating Opportunity Node ─────────────────────────────────────────────
const OpportunityNode = ({ x, y, size, delay, colorClass, nodeClass, label }) => (
  <div
    className={`opportunity-node ${nodeClass}`}
    style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}s` }}
  >
    <div
      className={`rounded-full ${colorClass} flex items-center justify-center`}
      style={{ width: size, height: size }}
    />
    {label && (
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-white/30">
        {label}
      </div>
    )}
  </div>
);

// ── Animated placeholder array ────────────────────────────────────────────
const PLACEHOLDERS = [
  'Software Engineer, Bangalore',
  'Government Teacher vacancy',
  'Data Analyst, remote',
  'Bank PO 2024',
  'Delivery partner, Mumbai',
  'React Developer, Hyderabad',
];

const TRUST_STATS = [
  { value: '10K+', label: 'Verified Jobs', color: 'text-emerald-400' },
  { value: '500+', label: 'Companies Hiring', color: 'text-cyan-400' },
  { value: '100%', label: 'Free Forever', color: 'text-emerald-400' },
];

const Hero = () => {
  const navigate = useNavigate();
  const { jobs, companies, melas } = useJobs();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const dropdownRef = useRef(null);
  const sectionRef = useRef(null);

  // ── Scroll-based cinematic exit ───────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // ── Cycle placeholder ─────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setPlaceholderIdx(p => (p + 1) % PLACEHOLDERS.length), 3000);
    return () => clearInterval(t);
  }, []);

  // ── Search suggestions ────────────────────────────────────────────────
  useEffect(() => {
    if (!query || query.length < 1) { setSuggestions([]); setShowSuggestions(false); return; }
    const q = query.toLowerCase();
    const matchedJobs  = (jobs || []).filter(j => j.title?.toLowerCase().includes(q)).map(j => j.title);
    const matchedComps = (companies || []).filter(c => c.name?.toLowerCase().includes(q)).map(c => c.name);
    const matchedMelas = (melas || []).filter(m => m.title?.toLowerCase().includes(q)).map(m => m.title);
    const combined = Array.from(new Set([...matchedJobs, ...matchedComps, ...matchedMelas])).slice(0, 8);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } }
  };

  const lineVariants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
  };

  const pillVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 12 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-slate-950 dark:bg-[#020617]"
      style={{ minHeight: 'min(92vh, 780px)' }}
    >
      {/* ── Animated Background System ─────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ scale: bgScale, opacity: bgOpacity }}
      >
        {/* Base dark layer */}
        <div className="absolute inset-0 bg-[#020617]" />

        {/* Cinematic dot grid */}
        <div className="absolute inset-0 opacity-40 dark:opacity-60"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.15) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Atmospheric mesh glow orbs */}
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
        <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div className="absolute bottom-[-10%] left-[40%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#020617] to-transparent" />

        {/* Floating Opportunity Nodes */}
        <OpportunityNode x={12} y={20} size={10} delay={0} nodeClass="node-a"
          colorClass="bg-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.8)]" />
        <OpportunityNode x={78} y={15} size={7} delay={1.5} nodeClass="node-b"
          colorClass="bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.7)]" />
        <OpportunityNode x={88} y={60} size={12} delay={0.8} nodeClass="node-c"
          colorClass="bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.9)]" />
        <OpportunityNode x={5} y={70} size={6} delay={2.2} nodeClass="node-d"
          colorClass="bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.7)]" />
        <OpportunityNode x={55} y={10} size={8} delay={0.5} nodeClass="node-e"
          colorClass="bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.6)]" />
        <OpportunityNode x={95} y={35} size={5} delay={3} nodeClass="node-f"
          colorClass="bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.5)]" />

        {/* Connection lines (decorative SVG) */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <line x1="12%" y1="20%" x2="55%" y2="10%" stroke="#10b981" strokeWidth="1" />
          <line x1="55%" y1="10%" x2="78%" y2="15%" stroke="#10b981" strokeWidth="1" />
          <line x1="78%" y1="15%" x2="88%" y2="60%" stroke="#06b6d4" strokeWidth="1" />
          <line x1="12%" y1="20%" x2="5%" y2="70%" stroke="#10b981" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-center min-h-[min(92vh,780px)] px-4 py-16 md:py-24">
        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-5xl mx-auto text-center"
        >
          {/* Category Pills */}
          <motion.div variants={lineVariants} className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              { icon: <GraduationCap size={13} />, label: 'Freshers', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' },
              { icon: <Briefcase size={13} />, label: 'Private Jobs', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' },
              { icon: <Building2 size={13} />, label: 'Govt Jobs', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' },
              { icon: <Zap size={13} />, label: 'Gig & Services', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20 hover:bg-teal-500/20' },
            ].map((pill, i) => (
              <motion.span
                key={pill.label}
                variants={pillVariants}
                custom={i}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border cursor-default transition-all duration-200 hover:-translate-y-0.5 ${pill.color}`}
              >
                {pill.icon}
                {pill.label}
              </motion.span>
            ))}
          </motion.div>

          {/* Headline — Cinematic Typography */}
          <div className="overflow-hidden mb-4">
            <motion.div variants={lineVariants}>
              <h1 className="text-[clamp(2.6rem,8vw,6.5rem)] font-black text-white tracking-tighter leading-[0.95] mb-2">
                FIND WORK THAT
              </h1>
            </motion.div>
            <motion.div variants={lineVariants}>
              <h1 className="text-[clamp(2.6rem,8vw,6.5rem)] font-black tracking-tighter leading-[0.95] mb-2">
                <span className="text-gradient-emerald-cyan">ACTUALLY MOVES</span>
              </h1>
            </motion.div>
            <motion.div variants={lineVariants}>
              <h1 className="text-[clamp(2.6rem,8vw,6.5rem)] font-black text-white tracking-tighter leading-[0.95]">
                YOU.
              </h1>
            </motion.div>
          </div>

          {/* Subtitle */}
          <motion.p
            variants={lineVariants}
            className="text-sm sm:text-base md:text-lg text-slate-400 max-w-lg mx-auto mb-10 font-medium leading-relaxed"
          >
            India's fastest-growing opportunity platform. Government, IT, Non-IT & Fresher roles — all verified, all free.
          </motion.p>

          {/* ── Search Bar ─────────────────────────────────────────────── */}
          <motion.div variants={lineVariants} className="max-w-2xl mx-auto mb-10 relative z-50" ref={dropdownRef}>
            <div className="flex bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.4)] focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center pl-4 shrink-0">
                <Search size={18} className="text-emerald-400" />
              </div>
              <div className="relative flex-1 overflow-hidden">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => query.length >= 1 && setShowSuggestions(true)}
                  autoComplete="off"
                  spellCheck="false"
                  className="w-full px-3 py-4 text-sm sm:text-base outline-none text-white placeholder-slate-500 font-medium bg-transparent"
                  placeholder={PLACEHOLDERS[placeholderIdx]}
                />
              </div>
              <button
                onClick={() => handleSearch()}
                className="relative overflow-hidden bg-emerald-500 hover:bg-emerald-400 text-white px-6 sm:px-8 font-bold transition-all duration-200 flex items-center justify-center gap-2 text-sm shrink-0 m-1.5 rounded-xl shadow-[0_4px_16px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_24px_rgba(16,185,129,0.5)] hover:-translate-y-0.5"
              >
                <span className="hidden xs:inline">Search</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-[100] py-3"
                >
                  <div className="px-5 mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Suggestions</span>
                    <span className="text-[10px] font-bold text-emerald-500/50">↩ to select</span>
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => { setQuery(suggestion); handleSearch(suggestion); }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-all duration-100 ${
                        index === selectedIndex
                          ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500'
                          : 'text-slate-300 border-l-2 border-transparent hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                        {suggestion.includes(' ')
                          ? <Briefcase size={12} className="text-slate-500" />
                          : <Building2 size={12} className="text-slate-500" />
                        }
                      </div>
                      <span className="font-semibold text-sm">{suggestion}</span>
                      <ChevronRight size={13} className={`ml-auto text-emerald-500 transition-opacity ${index === selectedIndex ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Trust Indicators ────────────────────────────────────────── */}
          <motion.div variants={lineVariants} className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            {TRUST_STATS.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-2">
                {i > 0 && <div className="w-px h-4 bg-slate-700 hidden sm:block" />}
                <div className="text-center">
                  <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-[#020617] to-transparent z-20 pointer-events-none" />
    </section>
  );
};

export default Hero;