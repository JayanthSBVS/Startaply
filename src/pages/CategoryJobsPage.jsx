import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import JobCard from '../components/jobs/JobCard';
import JobDetailsPanel from '../components/jobs/JobDetailsPanel';
import { useJobs } from '../context/JobsContext';


const JOB_MODES = ['All', 'Remote', 'Hybrid', 'On-site'];
const EXPERIENCE_OPTIONS = ['All', '0-1 years', '0-2 years', '2-4 years', '3-5 years', '5+ years', '7+ years', '10+ years'];

// Category → jobCategory mapping
const categoryMap = {
  'IT Jobs':         'IT Job',
  'Remote Jobs':     null,           // handled by mode filter
  'Internships':     'Internship',
  'Fresher Jobs':    null,           // handled by experience
  'Government Jobs': 'Government Job',
  'Startup Jobs':    'IT Job',       // approximate
  'Govt Jobs':       'Government Job',
  'Private Sector':  null,
  'Non-IT Roles':    'Non-IT Job',
  'IT Job':          'IT Job',
  'Non-IT Job':      'Non-IT Job',
  'Government Job':  'Government Job',
  'Internship':      'Internship',
};

const specialMode = {
  'Remote Jobs': 'Remote',
};

const specialExperience = {
  'Fresher Jobs': '0-1 years',
};

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

const CategoryJobsPage = () => {
  const { categoryName } = useParams();
  const { jobs } = useJobs();

  const decodedCategory = decodeURIComponent(categoryName);
  const mappedJobCategory = categoryMap[decodedCategory];
  const defaultMode = specialMode[decodedCategory] || 'All';
  const defaultExp = specialExperience[decodedCategory] || 'All';

  const [mode, setMode] = useState(defaultMode);
  const [experience, setExperience] = useState(defaultExp);
  const [selectedJob, setSelectedJob] = useState(null);

  // Subcategories definition based on category
  const SUBCATEGORIES_MAP = {
    'Government Jobs': ['All', 'Central Government Jobs', 'State Government Jobs', 'Railway Jobs', 'Banking Jobs', 'Defence Jobs', 'Police Jobs'],
    'Govt Jobs': ['All', 'Central Government Jobs', 'State Government Jobs', 'Railway Jobs', 'Banking Jobs', 'Defence Jobs', 'Police Jobs'],
    'Private Sector': ['All', 'MNC Fresher Jobs', 'Experienced Jobs', 'Work From Home Jobs', 'Walk-in Interviews', 'Off-Campus Drives'],
    'IT Jobs': ['All', 'MNC Fresher Jobs', 'Experienced Jobs', 'Work From Home Jobs', 'Walk-in Interviews', 'Off-Campus Drives'],
    'Non-IT Roles': ['All', 'BPO / Call Centre', 'Sales Jobs', 'Retail Jobs', 'Warehouse Jobs'],
    'Non-IT Job': ['All', 'BPO / Call Centre', 'Sales Jobs', 'Retail Jobs', 'Warehouse Jobs'],
  };

  const subcategories = SUBCATEGORIES_MAP[decodedCategory] || [];
  const [subcategory, setSubcategory] = useState('All');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      // Category match
      let matchCat = true;
      if (mappedJobCategory) {
        matchCat = job.jobCategory === mappedJobCategory;
      } else if (decodedCategory === 'Remote Jobs') {
        matchCat = true; // handled by mode
      } else if (decodedCategory === 'Fresher Jobs') {
        matchCat = true; // handled by experience
      } else if (decodedCategory === 'Startup Jobs') {
        matchCat = job.category === 'Private Sector';
      }

      const matchMode = mode === 'All' || job.mode === mode;
      const matchExp = experience === 'All' || job.experience === experience;
      
      // Subcategory match
      const matchSub = subcategory === 'All' || job.subcategory === subcategory;

      return matchCat && matchMode && matchExp && matchSub;
    });
  }, [jobs, mappedJobCategory, decodedCategory, mode, experience, subcategory]);

  const clearFilters = () => {
    setMode(defaultMode);
    setExperience(defaultExp);
    setSubcategory('All');
  };

  const hasFilters = mode !== defaultMode || experience !== defaultExp || subcategory !== 'All';

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* Header */}
        <div className="bg-white border-b pt-20 pb-6">
          <div className="max-w-6xl mx-auto px-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 mb-3 transition-colors">
              <ArrowLeft size={14} />
              Back to Home
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{decodedCategory}</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Browse <span className="font-semibold text-green-600">{filtered.length}</span> jobs in {decodedCategory}
            </p>
          </div>
        </div>

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
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <SlidersHorizontal size={14} className="text-green-600" />
                      Filters
                    </h3>
                    {hasFilters && (
                      <button onClick={clearFilters} className="text-xs text-red-500 font-medium">Clear</button>
                    )}
                  </div>
                  {subcategories.length > 0 && (
                    <FilterSection title="Sub Category" options={subcategories} value={subcategory} onChange={setSubcategory} />
                  )}
                  <FilterSection title="Work Mode" options={JOB_MODES} value={mode} onChange={setMode} />
                  <FilterSection title="Experience" options={EXPERIENCE_OPTIONS} value={experience} onChange={setExperience} />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-6">

            {/* Desktop Filters Sidebar */}
            <div className="hidden md:block w-56 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal size={14} className="text-green-600" />
                    Filters
                  </h3>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-red-500 font-medium">Clear</button>
                  )}
                </div>
                {subcategories.length > 0 && (
                  <FilterSection title="Sub Category" options={subcategories} value={subcategory} onChange={setSubcategory} />
                )}
                <FilterSection title="Work Mode" options={JOB_MODES} value={mode} onChange={setMode} />
                <FilterSection title="Experience" options={EXPERIENCE_OPTIONS} value={experience} onChange={setExperience} />
              </div>
            </div>

            {/* Jobs Grid */}
            <div className="flex-1">
              {filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="font-semibold text-gray-800">No jobs found</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                  <button onClick={clearFilters} className="mt-4 text-sm text-green-600 font-medium hover:underline">
                    Reset filters
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

        <JobDetailsPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
      </div>
    </>
  );
};

export default CategoryJobsPage;
