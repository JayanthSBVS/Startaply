import React, { useState, useMemo } from 'react';
import { Search, X, Briefcase, Building2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useJobs } from '../context/JobsContext';
import { companiesData } from '../data/jobsData';
import { Code2, ShoppingCart, Globe, Share2, Play, Music, Brain, Zap, Home, UtensilsCrossed, Smartphone, Server, Database, Layers } from 'lucide-react';

const iconMap = {
  Code2, ShoppingCart, Globe, Share2, Play, Music, Brain, Zap, Home, UtensilsCrossed, Smartphone, Server, Database, Layers, Building2
};

const INDUSTRIES = ['All', 'Technology', 'E-Commerce', 'Social Media', 'Entertainment', 'AI', 'Automotive', 'Travel', 'Food Tech', 'FinTech', 'Government', 'IT Services'];

const CompaniesPage = () => {
  const { jobs, companies } = useJobs();
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All');

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
      const matchIndustry = industry === 'All' || c.industry === industry;
      return matchSearch && matchIndustry;
    }).map(c => ({
        ...c,
        liveOpenings: jobs.filter(j => j.company === c.name).length
    }));
  }, [companies, search, industry, jobs]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Top Workplaces</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Explore leading companies actively hiring across diverse industries.</p>

          <div className="relative mt-10 max-w-2xl mx-auto group">
            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search companies by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-12 py-4 border border-slate-200 rounded-full text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm font-medium"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 p-1 rounded-full transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="bg-white border-b border-slate-200 sticky top-[73px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto py-4 custom-scrollbar">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() => setIndustry(ind)}
                className={`flex-shrink-0 text-sm font-bold px-6 py-2.5 rounded-full transition-all ${industry === ind
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8 px-2">
          <p className="text-slate-500 font-medium text-lg">
            Found <span className="font-extrabold text-slate-900">{filtered.length}</span> companies
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Building2 size={24} className="text-slate-400" />
            </div>
            <p className="text-xl font-extrabold text-slate-900 mb-2">No companies found</p>
            <p className="text-slate-500 font-medium">Try adjusting your industry filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((company) => {
              const IconComp = iconMap[company.iconName] || Building2;
              return (
                <Link
                  key={company.name}
                  to={`/jobs?company=${encodeURIComponent(company.name)}`}
                  className="group bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-emerald-300 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={company.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2073'}
                        alt={company.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-black px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-500">
                      {company.industry}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-xl mb-1 group-hover:text-emerald-600 transition-colors">
                    {company.name}
                  </h3>

                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                      <Briefcase size={14} className="text-emerald-500" />
                      <span><span className="text-slate-900 font-black">{company.liveOpenings}</span> Openings</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
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