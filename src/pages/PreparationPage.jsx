import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  BookOpen, Download, ChevronDown, ChevronUp,
  GraduationCap, Monitor, FileText, HelpCircle, Newspaper, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'IT Jobs', icon: Monitor, color: 'blue' },
  { id: 'Non-IT Jobs', icon: GraduationCap, color: 'indigo' },
];

const CONTENT_TABS = {
  'IT Jobs':     [{ id: 'article', label: 'Articles & Guides', icon: FileText }, { id: 'qna', label: 'Interview Q&A', icon: HelpCircle }, { id: 'paper', label: 'Sample Papers', icon: Newspaper }],
  'Non-IT Jobs': [{ id: 'article', label: 'Articles & Guides', icon: FileText }, { id: 'qna', label: 'Interview Q&A', icon: HelpCircle }, { id: 'paper', label: 'Sample Papers', icon: Newspaper }],
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
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-[#1A62FE]/40 transition-all shadow-sm"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-4 p-5 md:p-6 text-left group"
        aria-expanded={open}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-[#EFF3FF] dark:bg-[#1A62FE]/10 border border-[#1A62FE]/20 flex items-center justify-center">
            <HelpCircle size={15} className="text-[#001F8E] dark:text-[#1A62FE]" />
          </span>
          <span className="font-bold text-slate-900 dark:text-white text-sm md:text-base leading-snug">{item.heading || item.question}</span>
        </div>
        <div className="flex-shrink-0 mt-0.5 text-slate-400 group-hover:text-[#1A62FE] transition-colors">
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
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-6 pt-1 border-t border-slate-100 dark:border-slate-800">
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-normal">{item.content || item.answer}</p>
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
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 hover:border-[#1A62FE]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-[#EFF3FF] dark:bg-[#1A62FE]/10 border border-[#1A62FE]/20 rounded-xl flex items-center justify-center group-hover:bg-[#001F8E] transition-all">
          <Newspaper size={22} className="text-[#001F8E] dark:text-[#1A62FE] group-hover:text-white transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-base mb-1.5 leading-snug">{item.heading}</h3>
          {item.content && (
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-normal leading-relaxed mb-3">{item.content}</p>
          )}
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#001F8E] hover:bg-[#1A62FE] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm shadow-[#001F8E]/20 active:scale-95"
            >
              <Download size={13} /> Download Material
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-medium px-3 py-1.5 rounded-lg">
              Coming Soon
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- Article Card ---
const ArticleCard = ({ item }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.97 }}
    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 hover:border-[#1A62FE]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
  >
    <div className="w-10 h-10 bg-[#EFF3FF] dark:bg-[#1A62FE]/10 border border-[#1A62FE]/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#001F8E] transition-all">
      <BookOpen size={18} className="text-[#001F8E] dark:text-[#1A62FE] group-hover:text-white transition-colors" />
    </div>
    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2.5 group-hover:text-[#001F8E] dark:group-hover:text-[#1A62FE] transition-colors leading-snug">
      {item.heading}
    </h3>
    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-normal">{item.content}</p>
  </motion.div>
);

// --- Skeleton ---
const Skeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse">
        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4" />
        <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4 mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded-full w-full" />
          <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded-full w-5/6" />
        </div>
      </div>
    ))}
  </div>
);

// --- Main Page ---
const PreparationPage = () => {
  useEffect(() => {
    document.title = "Preparation Hub | Startaply";
  }, []);
  const [activeCategory, setActiveCategory] = useState('IT Jobs');
  const [activeContentTab, setActiveContentTab] = useState('article');
  const [activeRole, setActiveRole] = useState('General');
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

  const contentTabs = CONTENT_TABS[activeCategory];

  const roles = useMemo(() => {
    const allRoles = prepData
      .filter(p => (p.jobType || p.jobtype || '') === activeCategory)
      .map(p => p.role || 'General')
      .filter(Boolean);
    return [...new Set(allRoles)].sort();
  }, [prepData, activeCategory]);

  useEffect(() => {
    if (roles.length > 0 && !roles.includes(activeRole)) {
      setActiveRole(roles[0]);
    }
  }, [activeCategory, roles, activeRole]);

  const filteredData = useMemo(() => {
    return prepData.filter(p => {
      const cat = p.jobType || p.jobtype || '';
      const type = p.contentType || p.contenttype || 'article';
      const role = p.role || 'General';
      return cat === activeCategory && type === activeContentTab && role === activeRole;
    });
  }, [prepData, activeCategory, activeContentTab, activeRole]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f14] font-sans text-slate-900 dark:text-white transition-colors duration-300">

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-b from-[#001F8E] via-[#00176b] to-slate-900 pt-28 pb-24 px-4 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#1A62FE]/20 via-transparent to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-blue-100 uppercase tracking-wider mb-6">
            <Sparkles size={13} className="text-[#1A62FE]" /> Career Resources & Guides
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            Interview & Skill <br className="hidden sm:inline" />
            <span className="text-[#EFF3FF] font-extrabold">Preparation Hub</span>
          </h1>
          <p className="text-blue-100/80 font-normal max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Curated study materials, verified interview Q&As, and comprehensive company preparation kits to help you ace your hiring process.
          </p>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10 pb-24">

        {/* Category Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/40 border border-slate-200 dark:border-slate-800 p-2 mb-6 flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-[#001F8E] text-white shadow-md shadow-[#001F8E]/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-[#EFF3FF] dark:hover:bg-slate-800 hover:text-[#001F8E] dark:hover:text-white'
              }`}
            >
              <cat.icon size={16} className="flex-shrink-0" /> {cat.id}
            </button>
          ))}
        </div>

        {/* Role Tabs */}
        {roles.length > 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                  activeRole === role
                    ? 'bg-[#001F8E] text-white border-[#001F8E] shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-[#1A62FE]/40'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        )}

        {/* Content Type Sub-tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {contentTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveContentTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap border transition-all flex-shrink-0 ${
                activeContentTab === tab.id
                  ? 'bg-[#EFF3FF] dark:bg-[#1A62FE]/20 text-[#001F8E] dark:text-[#1A62FE] border-[#001F8E]/30 dark:border-[#1A62FE]/30 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
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
            className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <BookOpen size={44} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-1.5">No Materials Available Yet</h3>
            <p className="text-slate-500 dark:text-slate-400 font-normal text-xs md:text-sm">
              {activeContentTab === 'paper' ? 'Sample papers' : activeContentTab === 'qna' ? 'Interview Q&A items' : 'Articles and guides'}
              {' '}for {activeCategory} are being prepared and will be published shortly.
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                {filteredData.map(item => <ArticleCard key={item.id} item={item} />)}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default PreparationPage;
