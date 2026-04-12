import React, { useState } from 'react';
import {
  MapPin, DollarSign, Briefcase, Clock, Building2, ChevronRight,
  Eye, Users, GraduationCap, Monitor, Home, Wifi, Star, Zap, Share2
} from 'lucide-react';
import { motion } from 'framer-motion';

const WorkModeIcon = ({ mode, size = 14 }) => {
  const m = (mode || '').toLowerCase();
  if (m.includes('remote')) return <Home size={size} />;
  if (m.includes('hybrid')) return <Wifi size={size} />;
  return <Monitor size={size} />;
};

const JobCard = ({ job, onViewDetails }) => {
  if (!job) return <div className="animate-pulse bg-white border border-slate-100 rounded-[2rem] h-[22rem] w-full shadow-sm" />;

  const skills = job.requiredSkills
    ? job.requiredSkills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3)
    : [];

  const timeAgo = () => {
    if (!job.createdAt) return 'Recent';
    const diff = Date.now() - job.createdAt;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    if (days === 0) return hours < 1 ? 'Just now' : `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareText = `Explore this opportunity on Strataply!
Title: ${job.title}
Company: ${job.company}
Location: ${job.location || 'N/A'}
Salary: ${job.salary || 'Unspecified'}
Qualification: ${job.qualification || 'Unspecified'}
Description: ${job.description || job.fullDescription?.substring(0, 300) + '...'}

View & Apply Here: ${window.location.origin}/jobs?id=${job.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job.title} at ${job.company}`,
          text: shareText
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Job details copied to clipboard!');
    }
  };

  return (
    <motion.div
      onClick={() => onViewDetails && onViewDetails(job)}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="group relative bg-white border border-slate-200 hover:border-emerald-300 rounded-[2rem] p-6 flex flex-col h-full cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-10"
    >

      {/* ── HEADER: LOGO & ACTIONS ── */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="w-16 h-16 rounded-[1.25rem] bg-white border border-slate-100/80 shadow-sm p-3 flexItems-center justify-center relative group-hover:shadow-md group-hover:border-emerald-100 transition-all duration-500">
          <div className="absolute inset-0 bg-emerald-500/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain relative z-10" />
          ) : (
            <Building2 size={28} className="text-slate-300 relative z-10" />
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleShare}
            className="p-2.5 rounded-full transition-all duration-300 bg-slate-50/50 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50"
            title="Share Job"
          >
            <Share2 size={18} />
          </motion.button>
          
          {job.isFresh && !job.isFeatured && (
             <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 border border-blue-100 text-[10px] font-black uppercase tracking-wider text-blue-600">
               <Zap size={10} className="fill-blue-500 text-blue-500" /> New
             </span>
          )}
          {job.isFeatured && (
             <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-100 text-[10px] font-black uppercase tracking-wider text-amber-600">
               <Star size={10} className="fill-amber-500 text-amber-500" /> Featured
             </span>
          )}
        </div>
      </div>

      {/* ── JOB TITLE & COMPANY ── */}
      <div className="mb-4 relative z-10">
        <h3 className="text-[1.15rem] font-black text-slate-800 leading-tight group-hover:text-emerald-600 transition-colors duration-300 line-clamp-2 mb-1.5">
          {job.title || 'Position Title'}
        </h3>
        <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
          {job.company || 'Company Name'}
        </p>
      </div>

      {/* ── INFO PILLS ── */}
      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
        {job.location && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
            <MapPin size={13} className="text-emerald-500" />
            <span className="truncate max-w-[100px]">{job.location}</span>
          </span>
        )}
        {job.salary && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
            <DollarSign size={13} className="text-emerald-500" />
            <span>{job.salary}</span>
          </span>
        )}
        {job.workMode && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
            <WorkModeIcon mode={job.workMode} size={13} className="text-emerald-500" />
            <span>{job.workMode}</span>
          </span>
        )}
      </div>

      {/* ── SHORT DESCRIPTION ── */}
      {(job.description || job.fullDescription) && (
        <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2 mb-5 relative z-10 flex-1">
          {job.description || job.fullDescription?.substring(0, 150)}
        </p>
      )}

      {/* ── SKILLS ── */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto mb-5 relative z-10">
          {skills.map((skill) => (
            <span key={skill} className="px-2.5 py-1 bg-emerald-50/50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-100/50">
              {skill}
            </span>
          ))}
          {job.requiredSkills && job.requiredSkills.split(',').length > 3 && (
            <span className="px-2.5 py-1 text-slate-400 text-[10px] font-black rounded-lg">
              +{job.requiredSkills.split(',').length - 3}
            </span>
          )}
        </div>
      )}

      {/* ── BOTTOM BAR ── */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4 text-slate-400 text-[11px] font-bold">
          <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
            <Clock size={12} /> {timeAgo()}
          </span>
          {job.applicationCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Users size={12} /> {job.applicationCount} applied
            </span>
          )}
        </div>

        <motion.div
           whileHover={{ x: 4 }}
           className="flex items-center gap-1.5 text-emerald-600 text-xs font-black uppercase tracking-wider group-hover:text-emerald-500"
        >
          View Details <ChevronRight size={14} />
        </motion.div>
      </div>
      
    </motion.div>
  );
};

export default JobCard;