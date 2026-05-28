import React, { memo, useMemo } from 'react';
import { MapPin, IndianRupee, Clock, Building2, ChevronRight, Share2, AlertCircle, BadgeCheck, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useJobs } from '../../context/JobsContext';

// ── Pure component — only re-renders when the job object reference changes ─
const JobCard = memo(({ job, onViewDetails, large = false }) => {
  const { companies } = useJobs();
  const [imageError, setImageError] = React.useState(false);

  if (!job) return (
    <div className="animate-pulse bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl h-[22rem] w-full" />
  );

  // ── LOGO PRIORITY ──
  const companyLogo = useMemo(() => {
    if (job.companyLogo) return job.companyLogo;
    if (job.companyid || job.companyId) {
      const id = job.companyid || job.companyId;
      const found = (companies || []).find(c => c.id === id);
      if (found?.logo) return found.logo;
    }
    const foundByName = (companies || []).find(c => c.name?.toLowerCase() === job.company?.toLowerCase());
    return foundByName?.logo || null;
  }, [job, companies]);

  const createdAt = job.createdAt || Date.now();

  const daysRemaining = useMemo(() => {
    if (!job.expiryDays || job.expiryDays <= 0) return null;
    const expiryTimeMs = createdAt + (job.expiryDays * 86400000);
    return Math.ceil((expiryTimeMs - Date.now()) / 86400000);
  }, [createdAt, job.expiryDays]);

  if (daysRemaining !== null && daysRemaining < 0) return null;

  const skills = useMemo(
    () => (job.requiredSkills ? job.requiredSkills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 4) : []),
    [job.requiredSkills]
  );

  const timeAgo = useMemo(() => {
    const diff = Date.now() - createdAt;
    const days = Math.floor(diff / 86400000);
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

  const isUrgent = daysRemaining !== null && daysRemaining <= 3;
  const isNew = Date.now() - createdAt < 86400000 * 2;

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareText = `Explore this opportunity on Startaply!\nTitle: ${job.title}\nCompany: ${job.company}\nView: ${window.location.origin}/jobs?id=${job.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: job.title, text: shareText }); } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Job details copied!');
    }
  };

  return (
    <motion.div
      onClick={() => onViewDetails && onViewDetails(job)}
      whileHover={{ y: large ? -10 : -8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`group relative bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/60 backdrop-blur-sm hover:border-emerald-400/60 dark:hover:border-emerald-500/40 rounded-3xl flex flex-col cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-[0_24px_60px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_24px_60px_rgba(16,185,129,0.1)] ${large ? 'p-8' : 'p-6'}`}
    >
      {/* Top gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/[0.02] group-hover:to-transparent transition-all duration-500 pointer-events-none rounded-3xl" />

      {/* ── Header Row ─────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        {/* Company Logo */}
        <div className="relative">
          <div className={`${large ? 'w-16 h-16' : 'w-14 h-14'} rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-emerald-200 dark:group-hover:border-emerald-700/40 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all duration-300`}>
            {companyLogo && !imageError ? (
              <img
                src={companyLogo}
                alt={job.company}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-xl uppercase">
                {job.company?.charAt(0) || <Building2 size={22} />}
              </div>
            )}
          </div>
          {/* New badge */}
          {isNew && (
            <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 rounded-full w-5 h-5 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)]">
              <Sparkles size={9} className="text-white" />
            </div>
          )}
        </div>

        {/* Top-right actions */}
        <div className="flex items-center gap-2">
          {isUrgent && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-500 dark:text-red-400 text-[10px] font-black uppercase tracking-wider rounded-full border border-red-500/20 animate-pulse">
              <AlertCircle size={9} /> Urgent
            </span>
          )}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all duration-200"
          >
            <Share2 size={15} />
          </motion.button>
        </div>
      </div>

      {/* ── Company + Role ─────────────────────────────────────────────── */}
      <div className="mb-4 relative z-10">
        <div className="flex items-center gap-1.5 mb-1.5">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {job.company || 'Company'}
          </p>
          <BadgeCheck size={12} className="text-emerald-500 shrink-0" />
        </div>
        <h3 className={`font-black text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200 line-clamp-2 ${large ? 'text-2xl' : 'text-[1.1rem]'}`}>
          {job.title || 'Position Title'}
        </h3>
      </div>

      {/* ── Salary (prominent) ─────────────────────────────────────────── */}
      {job.salary && (
        <div className="mb-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-xl">
            <IndianRupee size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">{job.salary}</span>
          </div>
        </div>
      )}

      {/* ── Location ───────────────────────────────────────────────────── */}
      {job.location && (
        <div className="flex items-center gap-1.5 mb-4 relative z-10">
          <MapPin size={13} className="text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{job.location}</span>
        </div>
      )}

      {/* ── Description ────────────────────────────────────────────────── */}
      {(job.description || job.fullDescription) && (
        <p className={`text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2 mb-4 relative z-10 flex-1 ${large ? 'text-base line-clamp-3' : ''}`}>
          {job.description || job.fullDescription?.substring(0, 150)}
        </p>
      )}

      {/* ── Skills ─────────────────────────────────────────────────────── */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto mb-4 relative z-10">
          {skills.map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-[11px] font-semibold rounded-lg border border-slate-200/50 dark:border-slate-700/40 group-hover:border-emerald-200/50 dark:group-hover:border-emerald-800/30 transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* ── Footer Row ─────────────────────────────────────────────────── */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2 relative z-10">
        <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          {daysRemaining !== null && daysRemaining <= 7 ? (
            <span className="flex items-center gap-1 text-red-500 dark:text-red-400">
              <AlertCircle size={11} /> Last date: {lastDateStr}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Clock size={11} /> {timeAgo}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider group-hover:gap-2 transition-all duration-200">
          View <ChevronRight size={13} />
        </div>
      </div>
    </motion.div>
  );
});

JobCard.displayName = 'JobCard';
export default JobCard;