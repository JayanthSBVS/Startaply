import React from 'react';
import { MapPin, DollarSign, Briefcase, Clock, Building2, ChevronRight, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

const JobCard = ({ job, onViewDetails }) => {
  // SAFETY GUARD: If job is undefined, show a skeleton or return null to prevent crash
  if (!job) return <div className="animate-pulse bg-slate-100 rounded-[2rem] h-64 w-full" />;

  const getCategoryStyles = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('govt') || cat.includes('government')) return 'bg-blue-50 text-blue-700 border-blue-100 group-hover:bg-blue-100 group-hover:text-blue-800';
    if (cat.includes('fresher')) return 'bg-orange-50 text-orange-700 border-orange-100 group-hover:bg-orange-100 group-hover:text-orange-800';
    if (cat.includes('it') || cat.includes('software') || cat.includes('private')) return 'bg-emerald-50 text-emerald-700 border-emerald-100 group-hover:bg-emerald-100 group-hover:text-emerald-800';
    return 'bg-slate-50 text-slate-500 border-slate-100 group-hover:bg-slate-100 group-hover:text-slate-700';
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => onViewDetails && onViewDetails(job)}
      className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-7 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] hover:border-emerald-200 active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden"
    >
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-3 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-white group-hover:border-emerald-100 transition-all duration-300">
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain" />
          ) : (
            <span className="text-2xl font-black text-slate-300 group-hover:text-emerald-500 transition-colors">
              {job.company ? job.company.charAt(0).toUpperCase() : <Building2 size={24} />}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 items-end">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border transition-all ${getCategoryStyles(job.jobCategory)}`}>
              {job.jobCategory || 'General'}
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); /* Handle save logic */ }} 
              className="p-2 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
            >
              <Bookmark size={16} />
            </button>
          </div>
          {job.isFresh && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-100">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase text-amber-600">New Post</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mb-6 flex-1">
        <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors duration-300 line-clamp-2 mb-1.5">
          {job.title || "Position Title"}
        </h3>
        <p className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
          {job.company || "Company Name"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 relative z-10">
        {job.location && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors">
            <MapPin size={14} className="text-emerald-500" />
            <span className="text-[11px] font-bold text-slate-600">{job.location}</span>
          </div>
        )}
        {job.experience && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors">
            <Briefcase size={14} className="text-emerald-500" />
            <span className="text-[11px] font-bold text-slate-600">{job.experience}</span>
          </div>
        )}
        {job.salary && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors">
            <DollarSign size={14} className="text-emerald-500" />
            <span className="text-[11px] font-bold text-slate-600">{job.salary}</span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100/50 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
          <Clock size={14} className="text-slate-300" />
          {job.postedTime || "Active Now"}
        </div>

        <div className="flex items-center gap-1 text-emerald-600 text-xs font-black uppercase tracking-widest group-hover:translate-x-1 transition-all">
          Details <ChevronRight size={16} />
        </div>
      </div>
    </motion.div>
  );
};

export default JobCard;