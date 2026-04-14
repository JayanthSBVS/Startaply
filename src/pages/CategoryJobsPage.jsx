import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Monitor, Building2, Briefcase, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import JobCard from '../components/jobs/JobCard';
import JobDetailsPanel from '../components/jobs/JobDetailsPanel';
import { useJobs } from '../context/JobsContext';
import EmptyState from '../components/common/EmptyState';

// Step-Up UI Configuration for each exact category
const categoryConfig = {
  'IT & Non-IT Jobs': { icon: Monitor, color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10', glow: 'bg-blue-500', desc: 'Premium Software, Design, BPO, and Corporate roles.' },
  'Government Jobs': { icon: Building2, color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10', glow: 'bg-amber-500', desc: 'Secure Central and State Government opportunities.' },
  'Private Jobs': { icon: Briefcase, color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/10', glow: 'bg-purple-500', desc: 'Top tier private sector and enterprise jobs.' },
  'Gig & Services': { icon: Zap, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', glow: 'bg-emerald-500', desc: 'Flexible, on-demand roles and high-paying service gigs.' }
};

const defaultTheme = { icon: Briefcase, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', glow: 'bg-emerald-500', desc: 'Explore the latest verified opportunities in this category.' };

const CategoryJobsPage = () => {
  const { categoryName } = useParams();
  const { jobs } = useJobs();
  const decoded = decodeURIComponent(categoryName);
  const [selectedJob, setSelectedJob] = useState(null);

  const theme = categoryConfig[decoded] || defaultTheme;
  const IconComp = theme.icon;

  const filtered = useMemo(() => {
    return jobs.filter(j => (j.jobCategory || j.category) === decoded);
  }, [jobs, decoded]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* DYNAMIC HERO */}
      <div className="relative bg-slate-950 text-white pt-32 pb-24 text-center border-b border-slate-900 px-4 overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-20 pointer-events-none ${theme.glow}`} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto relative z-10">
          <div className={`w-20 h-20 mx-auto rounded-[1.5rem] flex items-center justify-center mb-6 border ${theme.border} ${theme.bg}`}>
            <IconComp size={36} className={theme.color} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            {decoded}
          </h1>
          <p className="text-lg text-slate-400 font-medium">
            {theme.desc}
          </p>
        </motion.div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-12 -mt-8 relative z-20">

        <div className="bg-white/80 backdrop-blur-md rounded-full shadow-lg shadow-slate-200/50 border border-slate-200 px-6 py-4 mb-10 flex justify-between items-center">
          <Link to="/" className="text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors px-2">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme.glow}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${theme.glow}`}></span>
            </span>
            <p className="text-sm font-bold text-slate-700">
              {filtered.length} Live Openings
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title={`No roles open in ${decoded}`}
            message="Check back soon! We are constantly partnering with companies to bring you the best opportunities."
            onReset={() => window.location.href = '/'}
            resetLabel="Explore other categories"
          />
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map(job => (
                <motion.div key={job.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <JobCard job={job} onViewDetails={setSelectedJob} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Footer />
      <JobDetailsPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
};

export default CategoryJobsPage;