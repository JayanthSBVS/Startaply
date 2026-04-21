import React, { useState, useMemo } from 'react';
import { Search, X, Briefcase, Building2, ChevronRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
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
  'AI', 'Automotive', 'Travel', 'Food Tech', 'FinTech', 'Government', 'IT Services'
];

// Company type badge config
const COMPANY_TYPES = [
  'All Types', 'MNC', 'Startup', 'Product Based', 'Service Based', 'Govt PSU', 'Remote First', 'Unicorn'
];

const TYPE_BADGE = {
  'MNC':           { bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  'Startup':       { bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  'Product Based': { bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  'Service Based': { bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
  'Govt PSU':      { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  'Remote First':  { bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  'Unicorn':       { bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
};

const CompaniesPage = () => {
  const { jobs, companies } = useJobs();
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All');
  const [companyType, setCompanyType] = useState('All Types');

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
        liveOpenings: jobs.filter(j => j.company === c.name).length
      }));
  }, [companies, search, industry, companyType, jobs]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <Navbar />

      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-24 pb-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Top Workplaces
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Explore {companies.length}+ leading companies actively hiring across diverse industries.
          </p>

          <div className="relative mt-10 max-w-2xl mx-auto group">
            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search companies by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              className="w-full pl-14 pr-12 py-4 border border-slate-200 dark:border-slate-700 rounded-full text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm font-medium"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 p-1 rounded-full transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* INDUSTRY FILTER */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[73px] z-30 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2.5 overflow-x-auto py-4 no-scrollbar">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() => setIndustry(ind)}
                className={`shrink-0 text-sm font-bold px-5 py-2 rounded-full transition-all ${
                  industry === ind
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-400'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* COMPANY TYPE FILTER */}
      <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2.5 overflow-x-auto py-3 no-scrollbar">
            <span className="shrink-0 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 pr-3">
              <Tag size={12} /> Type
            </span>
            {COMPANY_TYPES.map((t) => {
              const active = companyType === t;
              const badge = TYPE_BADGE[t] || {};
              return (
                <button
                  key={t}
                  onClick={() => setCompanyType(t)}
                  className={`shrink-0 text-xs font-bold px-4 py-1.5 rounded-full border transition-all ${
                    active
                      ? 'bg-slate-900 dark:bg-emerald-600 dark:text-white text-white border-transparent'
                      : `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600`
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
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
              <Building2 size={24} className="text-slate-400 dark:text-slate-600" />
            </div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">No companies found</p>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((company) => {
              const IconComp = iconMap[company.iconName] || Building2;
              const typeBadge = TYPE_BADGE[company.companyType];
              return (
                <Link
                  key={company.id || company.name}
                  to={`/jobs?company=${encodeURIComponent(company.name)}`}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                      {company.logo
                        ? <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-1.5" onError={e => { e.target.style.display = 'none'; }} />
                        : <Building2 size={22} className="text-slate-400" />
                      }
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {typeBadge && company.companyType && (
                        <span className={`text-[9px] uppercase tracking-wider font-black px-2.5 py-1 rounded-lg border ${typeBadge.bg}`}>
                          {company.companyType}
                        </span>
                      )}
                      {company.industry && (
                        <span className="text-[9px] uppercase tracking-wider font-black px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                          {company.industry}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-black text-slate-900 dark:text-white text-lg mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                    {company.name}
                  </h3>

                  <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg">
                      <Briefcase size={13} className="text-emerald-600 dark:text-emerald-400" />
                      <span>
                        <span className="text-slate-900 dark:text-white font-black">{company.liveOpenings}</span> {company.liveOpenings === 1 ? 'Opening' : 'Openings'}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/40 transition-colors">
                      <ChevronRight size={16} className="text-slate-400 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CompaniesPage;