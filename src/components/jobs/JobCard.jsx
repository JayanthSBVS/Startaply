import React, { memo, useMemo } from 'react';
import {
  MapPin, IndianRupee, Clock, Building2, ArrowRight,
  Briefcase, GraduationCap, AlertCircle, BadgeCheck, Zap,
  ExternalLink, Star, BookOpen, Globe, Share2, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useJobs } from '../../context/JobsContext';

const JobCard = memo(({ job, onViewDetails, layout = 'standard' }) => {
  const { companies } = useJobs();
  const [imageError, setImageError] = React.useState(false);

  if (!job) return (
    <div className="animate-pulse bg-slate-100 dark:bg-[#121821] border border-slate-200/60 dark:border-white/5 rounded-[2rem] h-64 md:h-[26rem] w-full" />
  );

  const companyLogo = useMemo(() => {
    if (job.companyLogo) return job.companyLogo;
    const id = job.companyId || job.companyid;
    if (id) {
      const found = (companies || []).find(c => c.id === id);
      if (found?.logo) return found.logo;
    }
    const byName = (companies || []).find(c => c.name?.toLowerCase() === job.company?.toLowerCase());
    return byName?.logo || null;
  }, [job, companies]);

  const rawSkills = useMemo(() => {
    const src = job.requiredSkills || job.skills || '';
    return src.split(',').map(s => s.trim()).filter(Boolean);
  }, [job.requiredSkills, job.skills]);
  const skills = rawSkills.slice(0, 3);
  const extraSkills = rawSkills.length > 3 ? rawSkills.length - 3 : 0;

  const createdAt = job.createdAt || Date.now();
  const daysRemaining = useMemo(() => {
    if (!job.expiryDays || job.expiryDays <= 0) return null;
    return Math.ceil(((createdAt + job.expiryDays * 86400000) - Date.now()) / 86400000);
  }, [createdAt, job.expiryDays]);

  if (daysRemaining !== null && daysRemaining < 0) return null;

  const timeAgo = useMemo(() => {
    const diff = Date.now() - createdAt;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  }, [createdAt]);

  const isUrgent = daysRemaining !== null && daysRemaining <= 3;
  const isNew = (Date.now() - createdAt) < 86400000 * 2;
  const isHero = layout === 'hero';

  const handleShare = (e) => {
    e.stopPropagation();
    const shareData = {
      title: `${job.title} at ${job.company}`,
      text: `Check out this ${job.title} opportunity at ${job.company} on Startaply!`,
      url: `${window.location.origin}/jobs?id=${job.id}`,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      toast.success('Job link copied!');
    }
  };

  const experience = job.experience || job.experienceLevel || null;
  const jobType = job.type || job.jobType || null;
  const workMode = job.workMode || null;

  return (
    <div className="relative group p-[1px] rounded-2xl md:rounded-[2rem] transition-all duration-300 h-full hover:bg-gradient-to-b hover:from-brand/25 hover:to-transparent hover:shadow-lg">
      <motion.div
        onClick={() => onViewDetails && onViewDetails(job)}
        whileTap={{ scale: 0.98 }}
        className={`relative rounded-[0.95rem] md:rounded-[1.95rem] bg-white dark:bg-[#0b0f14]/90 border border-slate-200/80 dark:border-white/5 group-hover:border-brand/40 flex flex-col cursor-pointer overflow-hidden h-full ${isHero ? 'p-4 sm:p-6 md:p-8' : 'p-3.5 sm:p-4 md:p-5'}`}
      >
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-brand/0 to-transparent group-hover:via-brand/50 transition-all duration-500 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* ── Header: Logo & Badges ── */}
        <div className="flex items-start justify-between gap-2.5 mb-3">
          <div className="flex gap-2.5 min-w-0 flex-1">
            <div className={`shrink-0 ${isHero ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-10 h-10 sm:w-12 sm:h-12'} rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 flex items-center justify-center overflow-hidden shadow-xs group-hover:border-brand/20 transition-colors`}>
              {companyLogo && !imageError ? (
                <img src={companyLogo} alt={job.company} className="w-full h-full object-contain p-1" loading="lazy" onError={() => setImageError(true)} />
              ) : (
                <span className="text-slate-400 font-black text-base uppercase">{job.company?.charAt(0) || <Building2 size={18} />}</span>
              )}
            </div>
            <div className="min-w-0 pt-0.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{job.company || 'Company'}</p>
                <BadgeCheck size={13} className="text-brand shrink-0" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-brand/80 dark:text-brand-hover/80 truncate">
                {job.category || job.jobCategory || ''}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1 shrink-0">
            {isNew && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-soft border border-brand/20 text-brand dark:text-brand-hover text-[8px] sm:text-[9px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" /> New
              </span>
            )}
            {job.isTrending && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[8px] sm:text-[9px] font-black uppercase tracking-wider">
                <Star size={9} className="fill-indigo-500/50" /> Hot
              </span>
            )}
          </div>
        </div>

        <div className="mb-2">
          <h3 className={`font-bold text-slate-900 dark:text-white leading-snug group-hover:text-brand dark:group-hover:text-brand-hover transition-colors duration-200 line-clamp-2 ${isHero ? 'text-base sm:text-lg md:text-xl' : 'text-xs sm:text-sm md:text-base'}`}>
            {job.title || 'Position Title'}
          </h3>
        </div>

        {/* ── Description ── */}
        {job.description && (
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
            {job.description}
          </p>
        )}

        {/* ── Salary & Skills ── */}
        <div className="mb-3 sm:mb-4 space-y-2">
          {job.salary && (
            <div className="flex items-center gap-1 text-slate-900 dark:text-brand-hover font-bold text-xs sm:text-sm bg-brand-soft w-max px-2.5 py-1 rounded-lg border border-brand/10">
              <IndianRupee size={12} strokeWidth={2.5} className="text-brand" />
              {job.salary}
            </div>
          )}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span key={skill} className="px-2 py-0.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[9px] sm:text-[10px] md:text-xs font-semibold rounded-md border border-slate-200/60 dark:border-white/5">
                  {skill}
                </span>
              ))}
              {extraSkills > 0 && (
                <span className="px-2 py-0.5 text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] font-bold rounded-md border border-dashed border-slate-300 dark:border-white/10">
                  +{extraSkills}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* ── Metadata Grid ── */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 mb-4 md:mb-6">
          {job.location && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800/50 text-slate-400"><MapPin size={12} /></div>
              <span className="truncate">{job.location}</span>
            </div>
          )}
          {workMode && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800/50 text-slate-400">
                {workMode.toLowerCase().includes('remote') ? <Globe size={12} /> : <Briefcase size={12} />}
              </div>
              <span>{workMode}</span>
            </div>
          )}
          {experience && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800/50 text-slate-400"><GraduationCap size={12} /></div>
              <span>{experience}</span>
            </div>
          )}
          {jobType && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800/50 text-slate-400"><Clock size={12} /></div>
              <span>{jobType}</span>
            </div>
          )}
        </div>

        {/* ── Footer Action Bar ── */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100 dark:border-white/5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Posted {timeAgo}</span>
            {daysRemaining !== null && (
              <span className={`text-[9px] sm:text-[10px] font-bold flex items-center gap-1 ${isUrgent ? 'text-amber-500' : 'text-slate-500'}`}>
                {isUrgent && <AlertCircle size={9} />}
                {daysRemaining === 0 ? 'Expires today' : `${daysRemaining}d left`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title="Share job"
              aria-label="Share this job"
              style={{ minWidth: '38px', minHeight: '38px' }}
            >
              <Share2 size={15} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={(e) => { e.stopPropagation(); onViewDetails && onViewDetails(job); }}
              className={`flex items-center gap-1 font-bold text-xs px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all ${job.applyType === 'easy' ? 'bg-brand text-on-brand shadow-sm shadow-brand/20 hover:bg-brand-hover' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'}`}
              style={{ minHeight: '38px' }}
            >
              {job.applyType === 'easy' ? 'Easy Apply' : 'View Job'}
              {job.applyType === 'external' ? <ExternalLink size={12} /> : <ChevronRight size={14} />}
            </motion.button>
          </div>
        </div>
        </div>
      </motion.div>
    </div>
  );
});

JobCard.displayName = 'JobCard';
export default JobCard;

