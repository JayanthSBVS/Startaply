import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import {
  BookOpen, Download, ChevronDown, ChevronUp,
  GraduationCap, Building2, Monitor, FileText, HelpCircle, Newspaper
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'IT Jobs', icon: Monitor, color: 'emerald' },
  { id: 'Non-IT Jobs', icon: GraduationCap, color: 'blue' },
  { id: 'Government Jobs', icon: Building2, color: 'amber' },
];

const CONTENT_TABS = {
  'IT Jobs':         [{ id: 'article', label: 'Articles & Tips', icon: FileText }, { id: 'qna', label: 'Q&A', icon: HelpCircle }, { id: 'paper', label: 'Papers', icon: Newspaper }],
  'Non-IT Jobs':     [{ id: 'article', label: 'Articles & Tips', icon: FileText }, { id: 'qna', label: 'Q&A', icon: HelpCircle }, { id: 'paper', label: 'Papers', icon: Newspaper }],
  'Government Jobs': [{ id: 'paper', label: 'Previous Year Papers', icon: Newspaper }, { id: 'article', label: 'Study Notes', icon: FileText }, { id: 'qna', label: 'Q&A', icon: HelpCircle }],
};

const COLOR_MAP = {
  emerald: { active: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', glow: 'from-emerald-500/10' },
  blue:    { active: 'bg-blue-600 text-white shadow-lg shadow-blue-600/30',    badge: 'bg-blue-50 text-blue-700 border-blue-200',    glow: 'from-blue-500/10' },
  amber:   { active: 'bg-amber-600 text-white shadow-lg shadow-amber-600/30',  badge: 'bg-amber-50 text-amber-700 border-amber-200',  glow: 'from-amber-500/10' },
};

// --- Q&A Accordion Card ---
const QnACard = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-emerald-300 transition-all shadow-sm"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-4 p-5 md:p-6 text-left group"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
            <HelpCircle size={14} className="text-blue-500" />
          </span>
          <span className="font-bold text-slate-800 text-sm md:text-base leading-snug">{item.heading || item.question}</span>
        </div>
        <div className="flex-shrink-0 mt-0.5 text-slate-400 group-hover:text-emerald-500 transition-colors">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-5 pt-1 border-t border-slate-100">
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{item.content || item.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Paper Download Card ---
const PaperCard = ({ item }) => {
  const fileUrl = item.fileurl || item.fileUrl;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 hover:border-amber-300 hover:shadow-xl hover:-translate-y-0.5 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-all">
          <Newspaper size={22} className="text-amber-500 group-hover:text-white transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-slate-900 text-sm md:text-base mb-1 leading-snug">{item.heading}</h3>
          {item.content && (
            <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed mb-3">{item.content}</p>
          )}
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-black px-4 py-2.5 rounded-full transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Download size={14} /> Download Paper
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-400 text-xs font-bold px-4 py-2 rounded-full">
              Coming Soon
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- Article Card ---
const ArticleCard = ({ item, color }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.97 }}
    className="bg-white border border-slate-200 rounded-2xl p-5 md:p-7 hover:border-emerald-300 hover:shadow-2xl hover:-translate-y-1 transition-all group"
  >
    <div className={`w-11 h-11 bg-${color}-50 border border-${color}-200 rounded-xl flex items-center justify-center mb-4 group-hover:bg-${color}-600 group-hover:border-${color}-600 transition-all`}>
      <BookOpen size={20} className={`text-${color}-500 group-hover:text-white transition-colors`} />
    </div>
    <h3 className="text-base md:text-lg font-extrabold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors leading-snug">
      {item.heading}
    </h3>
    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{item.content}</p>
  </motion.div>
);

// --- Skeleton ---
const Skeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse">
        <div className="w-11 h-11 bg-slate-100 rounded-xl mb-4" />
        <div className="h-5 bg-slate-100 rounded-full w-3/4 mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-50 rounded-full w-full" />
          <div className="h-3 bg-slate-50 rounded-full w-5/6" />
        </div>
      </div>
    ))}
  </div>
);

// --- Main Page ---
const PreparationPage = () => {
  const [activeCategory, setActiveCategory] = useState('IT Jobs');
  const [activeContentTab, setActiveContentTab] = useState('article');
  const [prepData, setPrepData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/prep-data')
      .then(res => { setPrepData(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Reset content tab to first when category changes
  useEffect(() => {
    const tabs = CONTENT_TABS[activeCategory];
    setActiveContentTab(tabs[0].id);
  }, [activeCategory]);

  const catObj = CATEGORIES.find(c => c.id === activeCategory);
  const colors = COLOR_MAP[catObj.color];
  const contentTabs = CONTENT_TABS[activeCategory];

  const filteredData = useMemo(() => {
    return prepData.filter(p => {
      const cat = p.jobType || p.jobtype || '';
      const type = p.contentType || p.contenttype || 'article';
      return cat === activeCategory && type === activeContentTab;
    });
  }, [prepData, activeCategory, activeContentTab]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100">
      <Navbar />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-slate-900 pt-28 pb-24 px-4 text-center relative overflow-hidden"
      >
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${colors.glow} via-transparent to-transparent opacity-60`} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            <BookOpen size={12} /> Preparation Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Interview & Exam<br /><span className="text-emerald-400">Preparation</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-xl mx-auto text-sm md:text-base">
            Curated study materials, interview Q&As, and previous year papers — all in one place.
          </p>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10 pb-24">

        {/* Category Tabs */}
        <div className="bg-white rounded-full shadow-xl shadow-slate-200/60 border border-slate-200 p-1.5 md:p-2 mb-6 flex gap-1 md:gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                activeCategory === cat.id
                  ? colors.active
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <cat.icon size={14} className="flex-shrink-0" /> {cat.id}
            </button>
          ))}
        </div>

        {/* Content Type Sub-tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {contentTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveContentTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap border transition-all flex-shrink-0 ${
                activeContentTab === tab.id
                  ? 'bg-slate-900 text-emerald-400 border-slate-700 shadow-lg'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'
              }`}
            >
              <tab.icon size={13} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {loading ? (
          <Skeleton />
        ) : filteredData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 md:py-28 bg-white rounded-3xl border border-slate-200 shadow-sm"
          >
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg md:text-xl font-extrabold text-slate-900 mb-2">Nothing Here Yet</h3>
            <p className="text-slate-500 font-medium text-sm">
              {activeContentTab === 'paper' ? 'Previous year papers' : activeContentTab === 'qna' ? 'Q&A content' : 'Articles'}
              {' '}for {activeCategory} will be added soon.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {activeContentTab === 'qna' ? (
              <div className="space-y-3">
                {filteredData.map(item => <QnACard key={item.id} item={item} />)}
              </div>
            ) : activeContentTab === 'paper' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredData.map(item => <PaperCard key={item.id} item={item} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {filteredData.map(item => <ArticleCard key={item.id} item={item} color={catObj.color} />)}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PreparationPage;