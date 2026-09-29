import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Briefcase, Building2, ChevronRight, Tag, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useJobs } from '../context/JobsContext';
import {
  Code2, ShoppingCart, Globe, Share2, Play, Music, Brain, Zap,
  Home, UtensilsCrossed, Smartphone, Server, Database, Layers
} from 'lucide-react';

const iconMap = {
  Code2, ShoppingCart, Globe, Share2, Play, Music, Brain, Zap,
  Home, UtensilsCrossed, Smartphone, Server, Database, Layers, Building2
};

const INDUSTRIES = [
  'All', 'Technology', 'E-Commerce', 'Social Media', 'Entertainment',
  'AI', 'Automotive', 'Travel', 'Food Tech', 'FinTech', 'IT Services'
];

// Company type badge config
const COMPANY_TYPES = [
  'All Types', 'MNC', 'Startup', 'Product Based', 'Service Based', 'Remote First', 'Unicorn'
];

const TYPE_BADGE = {
  'MNC':           { bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  'Startup':       { bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  'Product Based': { bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  'Service Based': { bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
  'Remote First':  { bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  'Unicorn':       { bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
};

const CompaniesPage = () => {
  const { jobs, companies } = useJobs();
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All');
  const [companyType, setCompanyType] = useState('All Types');

  useEffect(() => {
    document.title = "Top Companies Hiring | Startaply";
  }, []);

  const filtered = useMemo(() => {
    return companies
      .filter((c) => {
        const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
        const matchIndustry = industry === 'All' || (c.industry || '') === industry;
        const cType = c.companyType || '';
        const matchType = companyType === 'All Types' || cType === companyType;
        return matchSearch && matchIndustry && matchType;
      })
      .map(c => ({
        ...c,
        liveOpenings: jobs.filter(j => j.companyId === c.id || j.company === c.name).length
      }));
  }, [companies, search, industry, companyType, jobs]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans transition-colors duration-300">

      {/* HEADER */}
      <div className="bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-neutral-800 pt-28 pb-14 transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand/5 dark:bg-brand/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft border border-brand/20 text-brand dark:text-brand-hover text-xs font-black uppercase tracking-wider mb-4">
            <Sparkles size={13} />
            Verified Employer Network
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Top <span className="text-brand dark:text-brand-hover">Workplaces</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Explore {companies.length}+ leading companies actively hiring across diverse technology and business sectors.
          </p>

          <div className="relative mt-8 max-w-2xl mx-auto group">
            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-brand transition-colors" />
            <input
              type="text"
              placeholder="Search companies by name or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              className="w-full pl-14 pr-12 py-4 border border-slate-200 dark:border-neutral-800 rounded-full text-slate-900 dark:text-white bg-slate-50 dark:bg-[#121212] focus:bg-white dark:focus:bg-black focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all shadow-sm font-medium"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 p-1 rounded-full transition-colors" aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* INDUSTRY FILTER */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[65px] z-30 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2.5 overflow-x-auto py-3.5 no-scrollbar">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() => setIndustry(ind)}
                className={`shrink-0 text-sm font-bold px-5 py-2 rounded-full transition-all ${
                  industry === ind
                    ? 'bg-brand text-on-brand shadow-md shadow-brand/25'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-brand/30 dark:hover:border-brand/40 hover:text-brand dark:hover:text-brand-hover'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* COMPANY TYPE FILTER */}
      <div className="bg-slate-50 dark:bg-black border-b border-slate-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2.5 overflow-x-auto py-3 no-scrollbar">
            <span className="shrink-0 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pr-3">
              <Tag size={12} /> Type
            </span>
            {COMPANY_TYPES.map((t) => {
              const active = companyType === t;
              return (
                <button
                  key={t}
                  onClick={() => setCompanyType(t)}
                  className={`shrink-0 text-xs font-bold px-4 py-1.5 rounded-full border transition-all ${
                    active
                      ? 'bg-brand text-on-brand border-transparent shadow-sm'
                      : 'bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-neutral-700'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8 px-2">
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            Found <span className="font-extrabold text-slate-900 dark:text-white">{filtered.length}</span> companies
          </p>
          {(industry !== 'All' || companyType !== 'All Types' || search) && (
            <button
              onClick={() => { setSearch(''); setIndustry('All'); setCompanyType('All Types'); }}
              className="text-xs font-bold text-brand dark:text-brand-hover hover:underline flex items-center gap-1"
            >
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-slate-200 dark:border-neutral-800 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 dark:bg-[#121212] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-neutral-800">
              <Building2 size={24} className="text-slate-400 dark:text-slate-600" />
            </div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">No companies found</p>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((company) => {
              const typeBadge = TYPE_BADGE[company.companyType];
              const isHiring = company.liveOpenings > 0;
              
              return (
                <Link
                  key={company.id || company.name}
                  to={`/company/${company.id || encodeURIComponent(company.name)}`}
                  className="group premium-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 flex flex-col h-full hover:border-brand/40 hover:shadow-[0_20px_50px_-12px_rgba(0,31,142,0.15)] dark:hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-300"
                >
                  {/* Top: Badges & Pulse */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex flex-wrap gap-2">
                      {typeBadge && company.companyType && (
                        <span className={`text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-lg border ${typeBadge.bg}`}>
                          {company.companyType}
                        </span>
                      )}
                    </div>
                    {isHiring && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-soft rounded-full border border-brand/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand dark:text-brand-hover">Hiring</span>
                      </div>
                    )}
                  </div>

                  {/* Center: Logo & Name */}
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                      {company.logo ? (
                        <img 
                          src={
                            company.logo.startsWith('data:') || company.logo.startsWith('http') || company.logo.startsWith('//') || company.logo.startsWith('/')
                              ? company.logo
                              : company.logo.includes('.')
                              ? `https://${company.logo}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=001F8E&color=fff&bold=true`
                          } 
                          alt={company.name} 
                          className="w-full h-full object-contain p-2.5" 
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=001F8E&color=fff&bold=true`; 
                          }}
                        />
                      ) : (
                        <Building2 size={32} className="text-slate-400" />
                      )}
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white text-lg group-hover:text-brand dark:group-hover:text-brand-hover transition-colors leading-tight mb-1.5">
                      {company.name}
                    </h3>
                    {company.industry && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <Tag size={12} className="text-brand" />
                        {company.industry}
                      </div>
                    )}
                  </div>

                  {/* Bottom: Openings & Action */}
                  <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-0.5">Opportunities</span>
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={14} className="text-brand dark:text-brand-hover" />
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {company.liveOpenings} <span className="text-slate-500 dark:text-slate-400 font-medium text-xs">{company.liveOpenings === 1 ? 'Job' : 'Jobs'}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all duration-300">
                      <ChevronRight size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-white" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;
