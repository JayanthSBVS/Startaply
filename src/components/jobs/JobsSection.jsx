import React, { useState, useEffect } from 'react';
import JobCard from './JobCard';
import JobDetailsPanel from './JobDetailsPanel';
import { useJobs } from '../../context/JobsContext';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobsSection = ({ searchQuery }) => {
  const { jobs } = useJobs();
  const [searchInput, setSearchInput] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    if (searchQuery?.keyword) {
      setSearchInput(searchQuery.keyword);
    }
  }, [searchQuery]);

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchInput.toLowerCase()) ||
    job.company.toLowerCase().includes(searchInput.toLowerCase()) ||
    (job.tags || []).some((t) => t.toLowerCase().includes(searchInput.toLowerCase()))
  );

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 flex justify-between items-center px-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {filteredJobs.length} <span className="text-emerald-600">Jobs Found</span>
          </h2>
          <Link to="/jobs" className="text-sm text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-1 transition-colors bg-emerald-50 px-4 py-2 rounded-full">
            Browse all jobs <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={setSelectedJob}
            />
          ))}
        </div>
      </div>
      <JobDetailsPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
    </section>
  );
};

export default JobsSection;