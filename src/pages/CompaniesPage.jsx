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
  const { jobs } = useJobs();
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All');

  const companiesWithCount = useMemo(() => {
    return companiesData.map((c) => ({
      ...c,
      liveOpenings: jobs.filter((j) => j.company === c.name).length || c.openings,
    }));
  }, [jobs]);

  const filtered = useMemo(() => {
    return companiesWithCount.filter((c) => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
      const matchIndustry = industry === 'All' || c.industry === industry;
      return matchSearch && matchIndustry;
    });
  }, [companiesWithCount, search, industry]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Top Workplaces</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Explore leading companies actively hiring across diverse industries.</p>

          <div className="relative mt-8 max-w-xl mx-auto group">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search companies by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-10 py-4 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="bg-white border-b border-slate-200 sticky top-[72px] z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4 no-scrollbar">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() => setIndustry(ind)}
                className={`flex-shrink-0 text-sm font-semibold px-5 py-2.5 rounded-lg transition-all ${industry === ind
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <p className="text-slate-600 font-medium">
            Found <span className="font-bold text-slate-900">{filtered.length}</span> companies
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-xl font-bold text-slate-900 mb-2">No companies found</p>
            <p className="text-slate-500">Try adjusting your industry filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((company) => {
              const IconComp = iconMap[company.iconName] || Building2;
              return (
                <Link
                  key={company.name}
                  to={`/jobs?company=${encodeURIComponent(company.name)}`}
                  className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform duration-300"
                      style={{ background: `${company.color}10`, borderColor: `${company.color}20` }}
                    >
                      <IconComp size={28} style={{ color: company.color }} strokeWidth={2} />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                      {company.industry}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg mb-1 group-hover:text-emerald-600 transition-colors">
                    {company.name}
                  </h3>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                      <Briefcase size={16} className="text-emerald-500" />
                      <span><span className="text-slate-900 font-bold">{company.liveOpenings}</span> Openings</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
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