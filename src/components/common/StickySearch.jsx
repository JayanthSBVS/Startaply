import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StickySearch = ({ onSearch }) => {
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/jobs?company=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div
      className={`fixed left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm px-4 py-2 transition-all duration-300 ease-in-out ${
        show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
      style={{ top: '53px', zIndex: 90 }}
    >
      <div className="max-w-4xl mx-auto flex gap-2">

        <div className="flex-1 flex items-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg px-3 gap-2 transition-colors">
          <Search size={14} className="text-slate-400 dark:text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search jobs..."
            className="flex-1 py-2 text-sm outline-none bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>

        <button
          onClick={handleSearch}
          className="bg-emerald-600 dark:bg-emerald-600 text-white px-4 rounded-lg text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          Search
        </button>

      </div>
    </div>
  );
};

export default StickySearch;