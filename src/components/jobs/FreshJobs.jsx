import React, { useState } from 'react';
import { useJobs } from '../../context/JobsContext';
import JobCard from './JobCard';
import JobDetailsPanel from './JobDetailsPanel';

const FreshJobs = () => {
  const { jobs } = useJobs();
  // Exclude featured jobs so this section shows different jobs
  const fresh = [...jobs]
    .filter((job) => !job.isFeatured && !job.featured)
    .reverse()
    .slice(0, 4);
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    <section className="py-10">

      <div className="max-w-6xl mx-auto px-4">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">
            Recently Added Jobs
          </h2>
          <a href="/jobs" className="text-sm text-green-600 font-medium hover:underline">
            View all
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {fresh.map((job) => (
            <JobCard key={job.id} job={job} onViewDetails={setSelectedJob} />
          ))}
        </div>

      </div>

      <JobDetailsPanel job={selectedJob} onClose={() => setSelectedJob(null)} />

    </section>
  );
};

export default FreshJobs;