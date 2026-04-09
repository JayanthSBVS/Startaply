import React, { useState, useMemo } from 'react';
import { Search, X, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useJobs } from '../context/JobsContext';
import { companiesData } from '../data/jobsData';
import {
  Search as SearchIcon, Code2, ShoppingCart, Globe, Share2, Play, Music,
  Brain, Zap, Home, UtensilsCrossed, Smartphone, Server, Database, Layers, Building2,
} from 'lucide-react';

const iconMap = {
  Search: SearchIcon,
  Code2: Code2,
  ShoppingCart: ShoppingCart,
  Globe: Globe,
  Share2: Share2,
  Play: Play,
  Music: Music,
  Brain: Brain,
  Zap: Zap,
  Home: Home,
  UtensilsCrossed: UtensilsCrossed,
  Smartphone: Smartphone,
  Server: Server,
  Database: Database,
  Layers: Layers,
  Building2: Building2,
};

const INDUSTRIES = ['All', 'Technology', 'E-Commerce', 'Social Media', 'Entertainment', 'AI', 'Automotive', 'Travel', 'Food Tech', 'FinTech', 'Government', 'IT Services'];

const CompaniesPage = () => {
  const { jobs } = useJobs();
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All');

  // Compute live openings count from jobs in context
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
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* Page Header */}
        <div className="bg-white border-b pt-20 pb-8">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Companies</h1>
            <p className="text-xs md:text-sm text-gray-500">Discover top companies hiring right now</p>

            {/* Search */}
            <div className="relative mt-4 max-w-lg">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Industry Filter Tabs */}
        <div className="bg-white border-b sticky top-14 md:top-16 z-30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto py-3 no-scrollbar scroll-smooth">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setIndustry(ind)}
                  className={`flex-shrink-0 text-[11px] md:text-xs font-medium px-4 py-2 rounded-full transition-all ${
                    industry === ind
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          <p className="text-sm text-gray-500 mb-5">
            Showing <span className="font-bold text-gray-900">{filtered.length}</span> companies
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              <div className="text-4xl mb-3">🏢</div>
              <p className="font-semibold text-gray-800">No companies found</p>
              <p className="text-sm text-gray-500 mt-1">Try a different search or filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {filtered.map((company) => {
                const IconComp = iconMap[company.iconName] || Building2;
                return (
                  <Link
                    key={company.name}
                    to={`/jobs?company=${encodeURIComponent(company.name)}`}
                    className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all block"
                  >
                    {/* Logo & Category */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center border"
                        style={{ background: `${company.color}15`, borderColor: `${company.color}30` }}
                      >
                        <IconComp size={24} style={{ color: company.color }} strokeWidth={1.5} />
                      </div>
                      <span
                        className="text-[10px] md:text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: `${company.color}15`, color: company.color }}
                      >
                        {company.industry}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base group-hover:text-green-600 transition-colors">
                      {company.name}
                    </h3>

                    <div className="flex items-center gap-1 mt-3 text-sm text-gray-600">
                      <Briefcase size={14} className="text-green-600" />
                      <span>
                        <span className="font-semibold text-green-600">{company.liveOpenings}</span>
                        {' '}open position{company.liveOpenings !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div
                      className="mt-4 text-xs font-semibold text-center py-2 rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: `${company.color}15`, color: company.color }}
                    >
                      View Jobs →
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default CompaniesPage;
