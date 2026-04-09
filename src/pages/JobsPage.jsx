import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import JobCard from '../components/jobs/JobCard';
import JobDetailsPanel from '../components/jobs/JobDetailsPanel';
import { useJobs } from '../context/JobsContext';


const JOB_CATEGORIES = ['All', 'IT Job', 'Non-IT Job', 'Government Job', 'Internship'];
const JOB_MODES = ['All', 'Remote', 'Hybrid', 'On-site'];
const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Internship', 'Contract'];
const EXPERIENCE_OPTIONS = ['All', '0-1 years', '0-2 years', '2-4 years', '3-5 years', '5+ years', '7+ years', '10+ years'];

const FilterSection = ({ title, options, value, onChange }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-sm font-semibold text-gray-800 mb-2"
      >
        {title}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="space-y-1.5 mt-2">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name={title}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="accent-green-600"
              />
              <span className={`text-sm group-hover:text-green-600 transition-colors ${value === opt ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                {opt}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const JobsPage = () => {
  const { jobs } = useJobs();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('company') || '');
  const [category, setCategory] = useState('All');
  const [mode, setMode] = useState('All');
  const [jobType, setJobType] = useState('All');
  const [experience, setExperience] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync search if query param changes
  useEffect(() => {
    const company = searchParams.get('company');
    if (company) setSearch(company);

    const jobId = searchParams.get('jobId');
    if (jobId && jobs.length > 0) {
      const job = jobs.find(j => String(j.id) === jobId);
      if (job) {
        setSelectedJob(job);
      }
    }
  }, [searchParams, jobs]);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        (job.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        job.location.toLowerCase().includes(q);

      const matchCategory = category === 'All' || job.jobCategory === category;
      const matchMode = mode === 'All' || job.mode === mode;
      const matchType = jobType === 'All' || job.type === jobType;
      const matchExp = experience === 'All' || job.experience === experience;

      return matchSearch && matchCategory && matchMode && matchType && matchExp;
    });
  }, [jobs, search, category, mode, jobType, experience]);

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setMode('All');
    setJobType('All');
    setExperience('All');
  };

  const hasFilters = category !== 'All' || mode !== 'All' || jobType !== 'All' || experience !== 'All' || search;

  const FiltersPanel = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-green-600" />
          Filters
        </h3>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-medium">
            Clear All
          </button>
        )}
      </div>
      <FilterSection title="Job Category" options={JOB_CATEGORIES} value={category} onChange={setCategory} />
      <FilterSection title="Work Mode" options={JOB_MODES} value={mode} onChange={setMode} />
      <FilterSection title="Job Type" options={JOB_TYPES} value={jobType} onChange={setJobType} />
      <FilterSection title="Experience" options={EXPERIENCE_OPTIONS} value={experience} onChange={setExperience} />
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* Page Header */}
        <div className="bg-white border-b pt-20 pb-6">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">All Jobs</h1>
            <p className="text-xs md:text-sm text-gray-500">Find your next opportunity from {jobs.length} active listings</p>

            {/* Search Bar */}
            <div className="relative mt-4 max-w-xl">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, company, skill or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Active Filter Chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mt-3">
                {search && (
                  <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                    "{search}"
                    <button onClick={() => setSearch('')}><X size={10} /></button>
                  </span>
                )}
                {category !== 'All' && (
                  <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                    {category} <button onClick={() => setCategory('All')}><X size={10} /></button>
                  </span>
                )}
                {mode !== 'All' && (
                  <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                    {mode} <button onClick={() => setMode('All')}><X size={10} /></button>
                  </span>
                )}
                {jobType !== 'All' && (
                  <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                    {jobType} <button onClick={() => setJobType('All')}><X size={10} /></button>
                  </span>
                )}
                {experience !== 'All' && (
                  <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                    {experience} <button onClick={() => setExperience('All')}><X size={10} /></button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-6">

          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="w-full flex items-center justify-between gap-2 text-sm font-medium text-gray-700 border border-gray-200 bg-white px-4 py-2.5 rounded-lg active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} />
                Filters {hasFilters && <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />}
              </div>
              <ChevronDown size={14} className={`transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileFiltersOpen && (
              <div className="mt-3">
                <FiltersPanel />
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-6">

            {/* Desktop Sidebar */}
            <div className="hidden md:block w-60 flex-shrink-0">
              <FiltersPanel />
            </div>

            {/* Jobs List */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600 font-medium">
                  <span className="text-gray-900 font-bold">{filtered.length}</span> jobs found
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="font-semibold text-gray-800">No jobs match your filters</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search terms</p>
                  <button onClick={clearFilters} className="mt-4 text-sm text-green-600 font-medium hover:underline">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                  {filtered.map((job) => (
                    <JobCard key={job.id} job={job} onViewDetails={setSelectedJob} />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        <Footer />

        {/* Job Details Panel */}
        <JobDetailsPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
      </div>
    </>
  );
};

export default JobsPage;