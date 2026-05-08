import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, MapPin, Globe, Tag, Briefcase, 
  ChevronRight, ArrowLeft, Users, Calendar, 
  Target, TrendingUp, Info
} from 'lucide-react';
import { useJobs } from '../context/JobsContext';
import SkeletonCard from '../components/common/SkeletonCard';
import JobCard from '../components/jobs/JobCard';

const CompanyProfilePage = () => {
  const { companyId } = useParams();
  const { fetchCompanyById, fetchJobsByCompanyId } = useJobs();
  
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [compData, jobsData] = await Promise.all([
          fetchCompanyById(companyId),
          fetchJobsByCompanyId(companyId)
        ]);
        setCompany(compData);
        setJobs(jobsData);
      } catch (err) {
        console.error('Error loading company profile:', err);
        setError('Company profile not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
    window.scrollTo(0, 0);
  }, [companyId, fetchCompanyById, fetchJobsByCompanyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-64 bg-slate-200 dark:bg-slate-900 rounded-[3rem] animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
              <div className="h-40 bg-white dark:bg-slate-900 rounded-3xl animate-pulse" />
              <div className="h-64 bg-white dark:bg-slate-900 rounded-3xl animate-pulse" />
            </div>
            <div className="md:col-span-2 space-y-6">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mb-6">
          <Building2 size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Company Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">{error || "The company you're looking for doesn't exist."}</p>
        <Link to="/companies" className="bg-slate-900 dark:bg-emerald-600 text-white font-black px-8 py-4 rounded-full transition-all flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Companies
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-emerald-500/30">
      {/* Premium Header Section */}
      <div className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent dark:from-emerald-500/10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <Link to="/companies" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors font-bold text-sm mb-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800">
            <ArrowLeft size={16} /> Back to Companies
          </Link>

          <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center">
            {/* Logo container with Glassmorphism */}
            <div className="w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex items-center justify-center p-6 border border-white/20 dark:border-slate-800 shrink-0 group hover:scale-105 transition-transform duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="w-full h-full object-contain relative z-10" />
              ) : (
                <Building2 size={64} className="text-slate-300 dark:text-slate-700" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {company.companyType && (
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                    {company.companyType}
                  </span>
                )}
                {company.industry && (
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                    {company.industry}
                  </span>
                )}
                {jobs.length > 0 && (
                  <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    Hiring Now
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">
                {company.name}
              </h1>
              
              <div className="flex flex-wrap gap-6 text-slate-500 dark:text-slate-400 font-bold">
                {company.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-emerald-500" />
                    {company.location}
                  </div>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
                    <Globe size={18} className="text-emerald-500" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-auto">
               <div className="flex-1 lg:w-48 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Open Positions</p>
                  <p className="text-3xl font-black text-emerald-500">{jobs.length}</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Sidebar: About & Details */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Info size={120} />
              </div>
              <h3 className="text-xl font-black mb-6 flex items-center gap-3 relative z-10">
                <Target size={22} className="text-emerald-500" /> About {company.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6 relative z-10">
                {company.description || `Explore career opportunities at ${company.name}, leading the way in the ${company.industry || 'technology'} sector. Join a team dedicated to innovation and growth.`}
              </p>
              
              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Industry</span>
                  <span className="text-sm font-black">{company.industry || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Type</span>
                  <span className="text-sm font-black">{company.companyType || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Headquarters</span>
                  <span className="text-sm font-black">{company.location || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Widget */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-colors" />
              <h3 className="text-lg font-black mb-6 flex items-center gap-3 relative z-10">
                <TrendingUp size={20} className="text-emerald-400" /> Career Growth
              </h3>
              <p className="text-slate-400 text-sm font-medium mb-6 relative z-10 leading-relaxed">
                Unlock your potential at {company.name}. We're looking for driven individuals to join our expanding team.
              </p>
              <Link to="/jobs" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all relative z-10">
                Explore All Jobs <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          {/* Main: Jobs List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <Briefcase size={26} className="text-emerald-500" /> Current Opportunities
              </h2>
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                {jobs.length} Results
              </div>
            </div>

            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase size={32} className="text-slate-300 dark:text-slate-700" />
                </div>
                <h3 className="text-xl font-black mb-2">No Active Openings</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  We don't have any open roles at {company.name} right now. Check back soon!
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
