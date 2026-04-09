import React, { useState } from 'react';
import { useJobs } from '../../context/JobsContext';
import JobCard from './JobCard';
import JobDetailsPanel from './JobDetailsPanel';

const FeaturedJobs = () => {
  const { jobs } = useJobs();
  const featured = jobs.filter((job) => job.featured);
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    <section className="py-10">

      <div className="max-w-6xl mx-auto px-4">

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Featured Jobs
          </h2>

          <a href="/jobs" className="text-sm text-green-600 font-medium cursor-pointer hover:underline">
            View all
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {featured.slice(0, 4).map((job) => (
            <JobCard key={job.id} job={job} onViewDetails={setSelectedJob} />
          ))}
        </div>

      </div>

      <JobDetailsPanel job={selectedJob} onClose={() => setSelectedJob(null)} />

    </section>
  );
};

export default FeaturedJobs;