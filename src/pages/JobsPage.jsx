import React, { useState, useMemo } from 'react';
import { Search, MapPin, Briefcase, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import JobCard from '../components/jobs/JobCard';
import JobDetailsPanel from '../components/jobs/JobDetailsPanel';
import { useJobs } from '../context/JobsContext';

const JOB_CATEGORIES = ['All Categories', 'IT & Software Jobs', 'Non-IT Jobs', 'Government Jobs'];
const JOB_MODES = ['All Modes', 'Hybrid', 'On-site', 'Remote'];
const EXPERIENCE_OPTIONS = ['All Experience', '0-1 years', '2-4 years', '5+ years'];

const JobsPage = () => {
  const { jobs } = useJobs();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('company') || '');
  const [category, setCategory] = useState('All Categories');
  const [mode, setMode] = useState('All Modes');
  const [experience, setExperience] = useState('All Experience');
  const [selectedJob, setSelectedJob] = useState(null);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const q = search.toLowerCase();
      const catMatch = category === 'All Categories' || job.jobCategory === category;
      const modeMatch = mode === 'All Modes' || job.mode === mode;
      const expMatch = experience === 'All Experience' || job.experience === experience;

      return (!q || job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q)) && catMatch && modeMatch && expMatch;
    });
  }, [jobs, search, category, mode, experience]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      {/* HEADER */}
      <div className="bg-slate-900 text-white pt-28 pb-16 px-4 text-center border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Discover Your Next <span className="text-emerald-400">Opportunity</span>
          </h1>
          <p className="text-lg text-slate-400 mb-10">
            Search through thousands of verified Freshers, Government, and Private jobs.
          </p>

          {/* MAIN SEARCH BAR */}
          <div className="max-w-2xl mx-auto flex bg-white/10 border border-slate-700 p-1.5 rounded-xl backdrop-blur-md focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
            <div className="flex-1 flex items-center pl-4">
              <Search size={20} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Job title, keywords, or company..."
                className="w-full bg-transparent px-4 py-3 text-white placeholder-slate-400 outline-none"
              />
            </div>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* FILTER BAR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative flex-1">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {JOB_MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative flex-1">
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {EXPERIENCE_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* RESULTS HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Showing <span className="text-emerald-600">{filtered.length}</span> Results
          </h2>
        </div>

        {/* GRID */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No jobs match your criteria</h3>
            <p className="text-slate-500">Try adjusting your filters or search terms.</p>
            <button
              onClick={() => { setSearch(''); setCategory('All Categories'); setMode('All Modes'); setExperience('All Experience'); }}
              className="mt-6 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(job => (
              <JobCard key={job.id} job={job} onViewDetails={setSelectedJob} />
            ))}
          </div>
        )}
      </div>

      <Footer />
      <JobDetailsPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
};

export default JobsPage;