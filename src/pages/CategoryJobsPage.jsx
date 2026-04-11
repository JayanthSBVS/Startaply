import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import JobCard from '../components/jobs/JobCard';
import JobDetailsPanel from '../components/jobs/JobDetailsPanel';
import { useJobs } from '../context/JobsContext';
import EmptyState from '../components/common/EmptyState';

const CategoryJobsPage = () => {
  const { categoryName } = useParams();
  const { jobs } = useJobs();
  const decoded = decodeURIComponent(categoryName);
  const [selectedJob, setSelectedJob] = useState(null);

  const filtered = useMemo(() => {
    return jobs.filter(j => j.jobCategory === decoded);
  }, [jobs, decoded]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* HERO */}
      <div className="bg-slate-900 text-white pt-28 pb-20 text-center border-b border-slate-800 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            <span className="text-emerald-400">{decoded}</span>
          </h1>
          <p className="text-lg text-slate-400">
            Explore the latest verified opportunities in this category.
          </p>
        </motion.div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-12 -mt-8 relative z-10">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-8 flex justify-between items-center">
          <Link to="/" className="text-sm font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-2 transition-colors px-2">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <p className="text-sm font-medium text-slate-500">
            <span className="font-bold text-slate-900">{filtered.length}</span> jobs available
          </p>
        </div>

        {filtered.length === 0 ? (
          <EmptyState 
            title={`No ${decoded} available`}
            message={`We currently don't have any open positions in the ${decoded} category. Check back soon for new updates!`}
            onReset={() => window.location.href = '/'}
            resetLabel="Go to Home"
          />
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

export default CategoryJobsPage;