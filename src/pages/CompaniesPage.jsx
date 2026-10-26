import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Briefcase, Building2, ChevronRight, Tag, Sparkles, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';
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

// Company type filters
const COMPANY_TYPES = [
  'All Types', 'MNC', 'Startup', 'Product Based', 'Service Based', 'Remote First', 'Unicorn'
];

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
        liveOpenings: jobs.filter(j =>
          j.companyId === c.id ||
          j.company?.toLowerCase() === c.name?.toLowerCase() ||
          (j.company && c.name && (
            j.company.toLowerCase().includes(c.name.toLowerCase()) ||
            c.name.toLowerCase().includes(j.company.toLowerCase())
          ))
        ).length
      }));
  }, [companies, search, industry, companyType, jobs]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans transition-colors duration-300">

      {/* HEADER */}
      <div className="bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-neutral-800 pt-20 sm:pt-28 pb-8 sm:pb-14 transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand/5 dark:bg-brand/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2 sm:mb-4">
            Top <span className="text-brand dark:text-brand-hover">Workplaces</span>
          </h1>
          <p className="text-xs sm:text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Explore {companies.length}+ leading companies actively hiring across diverse technology and business sectors.
          </p>

          <div className="relative mt-5 sm:mt-8 max-w-2xl mx-auto group">
            <Search size={18} className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-brand transition-colors" />
            <input
              type="text"
              placeholder="Search companies by name or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              className="w-full pl-11 sm:pl-14 pr-10 sm:pr-12 py-3 sm:py-4 border border-slate-200 dark:border-neutral-800 rounded-full text-slate-900 dark:text-white bg-slate-50 dark:bg-[#121212] focus:bg-white dark:focus:bg-black focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all shadow-sm font-medium text-base sm:text-sm placeholder:text-xs sm:placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[46px]"
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
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-14 md:top-16 z-30 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex gap-2 sm:gap-2.5 overflow-x-auto py-2.5 sm:py-3.5 no-scrollbar snap-x">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() => setIndustry(ind)}
                className={`shrink-0 text-xs sm:text-sm font-bold px-3.5 sm:px-5 py-2 rounded-full transition-all min-h-[40px] active:scale-95 ${
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-2.5 sm:py-3 no-scrollbar snap-x">
            <span className="shrink-0 flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pr-2 sm:pr-3">
              <Tag size={12} /> Type
            </span>
            {COMPANY_TYPES.map((t) => {
              const active = companyType === t;
              return (
                <button
                  key={t}
                  onClick={() => setCompanyType(t)}
                  className={`shrink-0 text-xs font-bold px-3 sm:px-4 py-1.5 rounded-full border transition-all min-h-[36px] active:scale-95 ${
                    active
                      ? 'bg-brand text-on-brand border-transparent shadow-xs'
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="flex justify-between items-center mb-6 sm:mb-8 px-1 sm:px-2">
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-lg">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((company) => {
              const isHiring = company.liveOpenings > 0;

              return (
                <Link
                  key={company.id || company.name}
                  to={`/company/${company.id || encodeURIComponent(company.name)}`}
                  className="group relative bg-white dark:bg-neutral-900 border border-slate-200/90 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 flex flex-col h-full hover:border-brand/40 dark:hover:border-brand/50 hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-black/60 hover:-translate-y-1 transition-all duration-200"
                >
                  {/* Top Row: Clean Logo & Opening Count */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 dark:bg-neutral-800/90 border border-slate-200/80 dark:border-neutral-700/80 p-2.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
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
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=001F8E&color=fff&bold=true`;
                          }}
                        />
                      ) : (
                        <Building2 size={26} className="text-slate-400 dark:text-slate-500" />
                      )}
                    </div>

                    <div className="text-right pt-1">
                      {isHiring ? (
                        <span className="text-xs font-black text-brand dark:text-brand-hover tracking-tight block">
                          {company.liveOpenings} {company.liveOpenings === 1 ? 'Open Role' : 'Open Roles'}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block">
                          Verified Partner
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Company Name & Typographic Sector Metadata */}
                  <div className="mt-4 mb-2">
                    <h3 className="font-black text-slate-900 dark:text-white text-lg group-hover:text-brand dark:group-hover:text-brand-hover transition-colors leading-snug">
                      {company.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                      {company.industry && <span>{company.industry}</span>}
                      {company.industry && company.companyType && <span className="text-slate-300 dark:text-slate-700">·</span>}
                      {company.companyType && <span>{company.companyType}</span>}
                    </div>
                    {company.location && (
                      <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5">
                        <MapPin size={13} className="text-brand shrink-0" />
                        <span className="truncate">{company.location}</span>
                      </p>
                    )}
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-normal leading-relaxed line-clamp-2 mt-2 mb-4">
                    {company.description || `Explore verified openings, culture, and active corporate drives at ${company.name}.`}
                  </p>

                  {/* Bottom Action Bar */}
                  <div className="mt-auto pt-3.5 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {isHiring ? 'Actively Hiring' : 'Workplace Profile'}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-brand dark:group-hover:text-brand-hover group-hover:translate-x-0.5 transition-all">
                      Explore <ChevronRight size={14} />
                    </span>
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
