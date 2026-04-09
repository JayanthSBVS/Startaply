import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../context/JobsContext';
import JobCard from './JobCard';
import JobDetailsPanel from './JobDetailsPanel';

const TAB_OPTIONS = [
  { label: "Today's Jobs", filter: (jobs) => jobs.slice(0, 6) },
  { label: 'IT Jobs', filter: (jobs) => jobs.filter((j) => j.jobCategory === 'IT Job').slice(0, 6) },
  { label: 'Govt Jobs', filter: (jobs) => jobs.filter((j) => j.jobCategory === 'Government Job').slice(0, 6) },
  { label: 'Internships', filter: (jobs) => jobs.filter((j) => j.jobCategory === 'Internship').slice(0, 6) },
  { label: 'Remote', filter: (jobs) => jobs.filter((j) => j.mode === 'Remote').slice(0, 6) },
];

const TodaysJobs = () => {
  const { jobs } = useJobs();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);

  const displayed = TAB_OPTIONS[activeTab].filter(jobs);

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Browse Jobs
          </h2>
          <Link to="/jobs" className="text-sm text-green-600 font-medium hover:underline self-start sm:self-auto">
            View all {jobs.length} jobs →
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TAB_OPTIONS.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`text-sm px-4 py-2 rounded-full font-medium transition-all ${
                activeTab === i
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Jobs Grid */}
        {displayed.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">No jobs in this category yet. Admin can add them from the dashboard.</p>
            <Link
              to={`/category/${encodeURIComponent(TAB_OPTIONS[activeTab].label)}`}
              className="mt-3 inline-block text-sm text-green-600 font-medium hover:underline"
            >
              Browse all {TAB_OPTIONS[activeTab].label}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayed.map((job) => (
              <JobCard key={job.id} job={job} onViewDetails={setSelectedJob} />
            ))}
          </div>
        )}

      </div>

      <JobDetailsPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
    </section>
  );
};

export default TodaysJobs;
