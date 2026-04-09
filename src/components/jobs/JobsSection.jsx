import React, { useState, useEffect } from 'react';
import JobCard from './JobCard';
import JobDetailsPanel from './JobDetailsPanel';
import { useJobs } from '../../context/JobsContext';

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

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {filteredJobs.length} Jobs Found
          </h2>
          <a href="/jobs" className="text-sm text-green-600 font-medium hover:underline">
            Browse all jobs
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

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