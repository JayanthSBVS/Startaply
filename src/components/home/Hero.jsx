import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobsContext';
import banner from '../../app/banner.png';

const Hero = ({ onSearch }) => {
  const navigate = useNavigate();
  const { jobs } = useJobs();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Build suggestions from real jobs
  const suggestions = query.trim().length > 0
    ? [
        ...new Set(
          jobs
            .map((j) => {
              const q = query.toLowerCase();
              if (j.title.toLowerCase().includes(q)) return j.title;
              if (j.company.toLowerCase().includes(q)) return j.company;
              if ((j.tags || []).some((t) => t.toLowerCase().includes(q))) return query;
              return null;
            })
            .filter(Boolean)
        ),
      ].slice(0, 6)
    : [];

  const handleSearch = () => {
    if (!query.trim()) return;
    setShowSuggestions(false);
    navigate(`/jobs?company=${encodeURIComponent(query.trim())}`);
  };

  const handleSuggestionClick = (title) => {
    setQuery(title);
    setShowSuggestions(false);
    navigate(`/jobs?company=${encodeURIComponent(title)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') setShowSuggestions(false);
  };

  const sampleCards = [
    { title: 'Frontend Developer', company: 'Google' },
    { title: 'Backend Engineer', company: 'Amazon' },
    { title: 'UI Designer', company: 'Figma' },
    { title: 'Data Scientist', company: 'Microsoft' },
    { title: 'Product Manager', company: 'Notion' },
  ];

  return (
    <div className="relative pt-20 md:pt-28 pb-10 md:pb-20">

      {/* ===== BACKGROUND & ANIMATIONS (Clipped) ===== */}
      <div className="absolute inset-0 overflow-hidden">
        {/* ===== BACKGROUND IMAGE ===== */}
      <div className="absolute inset-0">
        <img
          src={banner}
          alt="hero background"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* ===== OVERLAY ===== */}
      <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px]" />

      {/* ===== LEFT SCROLL ===== */}
      <div className="hero-side left-side">
        <div className="scroll-track">
          {sampleCards.concat(sampleCards).map((c, i) => (
            <div key={i} className="hero-card">
              <p className="text-xs font-semibold">{c.title}</p>
              <p className="text-[10px] text-gray-500">{c.company}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== RIGHT SCROLL ===== */}
      <div className="hero-side right-side">
        <div className="scroll-track reverse">
          {sampleCards.concat(sampleCards).map((c, i) => (
            <div key={i} className="hero-card">
              <p className="text-xs font-semibold">{c.title}</p>
              <p className="text-[10px] text-gray-500">{c.company}</p>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">

        <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
          Find Jobs That <span className="text-green-600">Match You</span>
        </h1>

        <p className="text-sm md:text-base text-gray-500 mt-4 max-w-xl mx-auto px-2">
          Stop scrolling endlessly. Start finding the right jobs.
        </p>

        {/* ===== SEARCH BAR ===== */}
        <div ref={wrapperRef} className="relative mt-8 max-w-2xl mx-auto">

          <div className="flex items-center bg-white rounded-xl border shadow-sm overflow-visible">
            <Search size={16} className="ml-4 text-gray-400 flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => query && setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search jobs, companies, skills..."
              className="flex-1 px-3 py-3 text-sm outline-none bg-transparent"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setShowSuggestions(false); }}
                className="px-2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-3 rounded-r-xl transition-colors"
            >
              Search
            </button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden"
              style={{ zIndex: 200 }}
            >
              <div className="px-4 py-2 text-[11px] text-gray-400 font-semibold uppercase tracking-wider border-b">
                Suggestions
              </div>
              {suggestions.map((title, i) => (
                <button
                  key={i}
                  onMouseDown={() => handleSuggestionClick(title)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2 transition-colors"
                >
                  <Search size={13} className="text-gray-400" />
                  {title}
                </button>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Hero;