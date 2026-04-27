import React, { memo, useMemo } from 'react';
import { MapPin, IndianRupee, Clock, Building2, ChevronRight, Share2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

// ── Pure component — only re-renders when the job object reference changes ─
const JobCard = memo(({ job, onViewDetails }) => {
  if (!job) return <div className="animate-pulse bg-white border border-slate-100 rounded-[2rem] h-[22rem] w-full shadow-sm" />;

  const createdAt = job.createdAt || Date.now();

  // ── Expiry calculation ─────────────────────────────────────────────────
  // Only calculate if expiryDays is explicitly set and > 0
  const daysRemaining = useMemo(() => {
    if (!job.expiryDays || job.expiryDays <= 0) return null;
    const expiryTimeMs = createdAt + (job.expiryDays * 86400000);
    return Math.ceil((expiryTimeMs - Date.now()) / 86400000);
  }, [createdAt, job.expiryDays]);

  // Hide if expired
  if (daysRemaining !== null && daysRemaining < 0) return null;

  // ── Derived values ─────────────────────────────────────────────────────
  const skills = useMemo(
    () => (job.requiredSkills ? job.requiredSkills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3) : []),
    [job.requiredSkills]
  );

  const timeAgo = useMemo(() => {
    const diff = Date.now() - createdAt;
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    if (days === 0) return hours < 1 ? 'Just now' : `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7)  return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  }, [createdAt]);

  const lastDateStr = useMemo(() => {
    if (daysRemaining === null) return null;
    const d = new Date(createdAt + (job.expiryDays * 86400000));
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  }, [createdAt, job.expiryDays, daysRemaining]);

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareText = `Explore this opportunity on Strataply!\nTitle: ${job.title}\nCompany: ${job.company}\nView: ${window.location.origin}/jobs?id=${job.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: job.title, text: shareText }); } catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Job details copied to clipboard!');
    }
  };

  return (
    <motion.div
      onClick={() => onViewDetails && onViewDetails(job)}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-[2.5rem] p-7 flex flex-col h-full cursor-pointer transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] z-10 overflow-hidden"
    >
      {/* Top Accent Hover Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="w-16 h-16 rounded-[1.25rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm p-3 flex items-center justify-center relative group-hover:shadow-md group-hover:border-emerald-200 transition-all duration-200 overflow-hidden">
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain relative z-10" loading="lazy" />
          ) : (
            <Building2 size={28} className="text-slate-300 dark:text-slate-600 relative z-10" />
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleShare}
            className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors duration-200"
          >
            <Share2 size={18} />
          </motion.button>
        </div>
      </div>

      <div className="mb-4 relative z-10">
        <h3 className="text-[1.2rem] font-black text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 dark:group-hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] transition-all duration-300 line-clamp-2 mb-1.5">
          {job.title || 'Position Title'}
        </h3>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          {job.company || 'Company Name'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
        {job.location && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-200">
            <MapPin size={13} className="text-emerald-500 dark:text-emerald-400" />
            <span className="truncate max-w-[100px]">{job.location}</span>
          </span>
        )}
        {job.salary && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-200">
            <IndianRupee size={13} className="text-emerald-500 dark:text-emerald-400" />
            <span>{job.salary}</span>
          </span>
        )}
      </div>

      {(job.description || job.fullDescription) && (
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2 mb-5 relative z-10 flex-1">
          {job.description || job.fullDescription?.substring(0, 150)}
        </p>
      )}

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto mb-5 relative z-10">
          {skills.map((skill) => (
            <span key={skill} className="px-2.5 py-1 bg-emerald-50/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold rounded-lg border border-emerald-100/50 dark:border-emerald-800/50">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-[11px] font-bold">
          {daysRemaining !== null && daysRemaining <= 7 ? (
            <span className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2 py-1 rounded-md animate-pulse border border-red-100 dark:border-red-900/40">
              <AlertCircle size={12} /> Last date: {lastDateStr}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
              <Clock size={12} /> {timeAgo}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider group-hover:text-emerald-500 dark:group-hover:text-emerald-300 transition-colors duration-200 transform group-hover:translate-x-1 shrink-0">
          View <ChevronRight size={14} />
        </div>
      </div>
    </motion.div>
  );
});

JobCard.displayName = 'JobCard';

export default JobCard;