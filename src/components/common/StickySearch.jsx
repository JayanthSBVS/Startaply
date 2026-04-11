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
      className={`fixed left-0 right-0 bg-white border-b shadow-sm px-4 py-2 transition-all duration-300 ease-in-out ${
        show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
      style={{ top: '53px', zIndex: 90 }}
    >
      <div className="max-w-4xl mx-auto flex gap-2">

        <div className="flex-1 flex items-center border rounded-lg px-3 gap-2">
          <Search size={14} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search jobs..."
            className="flex-1 py-2 text-sm outline-none"
          />
        </div>

        <button
          onClick={handleSearch}
          className="bg-green-600 text-white px-4 rounded-lg text-sm font-medium"
        >
          Search
        </button>

      </div>
    </div>
  );
};

export default StickySearch;