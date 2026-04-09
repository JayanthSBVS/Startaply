import React, { useState, useMemo } from 'react';
import { ArrowLeft, BookOpen, ChevronDown, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useJobs } from '../context/JobsContext';

const QnaAccordion = ({ item }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border rounded-xl overflow-hidden hover:border-green-300 transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between p-5 text-left gap-4"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              {item.category}
            </span>
          </div>
          <h3 className={`font-medium ${open ? 'text-green-700' : 'text-gray-900'} transition-colors`}>
            {item.question}
          </h3>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 mt-1 transition-transform ${open ? 'rotate-180 text-green-600' : ''}`}
        />
      </button>

      {open && (
        <div className="p-5 pt-0 text-gray-600 text-sm border-t border-gray-100 bg-gray-50/50">
          <div className="mt-4 flex gap-3">
            <MessageSquare size={16} className="text-green-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed whitespace-pre-wrap">{item.answer}</p>
          </div>
        </div>
      )}
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
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* Header */}
        <div className="bg-green-700 pt-24 md:pt-28 pb-10 md:pb-16 text-white text-center rounded-b-[2rem] md:rounded-b-[3rem] px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-4xl font-black mb-3 md:mb-4 flex items-center justify-center gap-2 md:gap-3">
              <BookOpen size={24} className="md:w-8 md:h-8" />
              Interview Prep
            </h1>
            <p className="text-green-100 text-sm md:text-lg">
              Master your next interview with our curated collection of real interview questions and answers.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 -mt-6 md:-mt-8 pb-20">
          
          {/* Navigation & Filters */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border p-3 md:p-4 mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link to="/" className="text-xs md:text-sm font-medium text-gray-500 hover:text-green-600 flex items-center gap-1.5 transition-colors self-start sm:self-auto">
              <ArrowLeft size={14} />
              Back to Home
            </Link>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-full pb-1 sm:pb-0 w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* QnA List */}
          <div className="space-y-4">
            {filteredQnas.length === 0 ? (
              <div className="bg-white rounded-xl md:rounded-2xl border p-8 md:p-12 text-center text-gray-500">
                <MessageSquare size={40} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No Questions Found</h3>
                <p className="text-sm">There are no interview questions available for this category yet.</p>
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
    </>
  );
};

export default InterviewPrepPage;
