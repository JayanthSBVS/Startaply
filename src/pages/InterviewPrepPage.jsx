import React, { useState, useMemo } from 'react';
import { ArrowLeft, BookOpen, ChevronDown, MessageSquareQuote } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useJobs } from '../context/JobsContext';

const QnaAccordion = ({ item }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-all duration-300 ${open ? 'border-emerald-400 shadow-md ring-1 ring-emerald-400' : 'border-slate-200 hover:border-emerald-300 hover:shadow-sm'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between p-6 text-left gap-4 bg-white"
      >
        <div className="flex-1">
          <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded mb-3">
            {item.category}
          </span>
          <h3 className={`font-bold text-lg leading-snug transition-colors ${open ? 'text-emerald-700' : 'text-slate-900'}`}>
            {item.question}
          </h3>
        </div>
        <div className={`mt-1 p-1 rounded-full transition-colors ${open ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400'}`}>
          <ChevronDown size={20} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-6 pt-0 bg-slate-50/50 border-t border-slate-100">
          <div className="flex gap-4">
            <MessageSquareQuote size={24} className="text-emerald-500 shrink-0 mt-1 opacity-50" />
            <p className="leading-relaxed text-slate-700 text-sm md:text-base whitespace-pre-wrap font-medium">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InterviewPrepPage = () => {
  const { qnas } = useJobs();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...new Set(qnas.map(q => q.category))];

  const filteredQnas = useMemo(() => {
    if (activeCategory === 'All') return qnas;
    return qnas.filter(q => q.category === activeCategory);
  }, [qnas, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* HEADER */}
      <div className="bg-slate-900 pt-28 pb-20 text-white text-center px-4 border-b border-slate-800">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Acing the <span className="text-emerald-400">Interview</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Real questions, expert answers. Prepare with confidence for your next technical or behavioral round.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 pb-24 relative z-10">

        {/* FILTERS */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link to="/" className="text-sm font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-2 transition-colors self-start sm:self-auto px-2">
            <ArrowLeft size={16} /> Home
          </Link>

          <div className="flex gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${activeCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {filteredQnas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
              <MessageSquareQuote size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Questions Found</h3>
              <p className="text-slate-500">Check back later or try a different category.</p>
            </div>
          ) : (
            filteredQnas.map((qna) => (
              <QnaAccordion key={qna.id} item={qna} />
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default InterviewPrepPage;