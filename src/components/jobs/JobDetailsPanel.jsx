import React, { useEffect } from 'react';
import {
  X, MapPin, Clock, Briefcase, GraduationCap, DollarSign,
  CheckCircle2, Layers, Building2, Gift, Wifi, Monitor, Building,
} from 'lucide-react';
import { CompanyLogo } from '../common/CompanyLogo';
import { useTimeAgo } from '../../utils/timeAgo';

const modeIcon = {
  Remote:   Wifi,
  Hybrid:   Layers,
  'On-site': Building,
};

const JobDetailsPanel = ({ job, onClose }) => {
  const livePostedTime = useTimeAgo(job?.createdAt);

  // Lock body scroll when panel is open
  useEffect(() => {
    if (job) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [job]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!job) return null;

  const ModeIcon = modeIcon[job.mode] || Monitor;

  const renderList = (items) => {
    if (!items) return <p className="text-gray-400 text-sm">Not specified</p>;
    const arr = Array.isArray(items)
      ? items
      : items.split(',').map((s) => s.trim()).filter(Boolean);
    return (
      <div className="flex flex-wrap gap-2">
        {arr.map((item) => (
          <span
            key={item}
            className="text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-100 font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  const renderBenefits = (items) => {
    if (!items) return <p className="text-gray-400 text-sm">Not specified</p>;
    const arr = Array.isArray(items)
      ? items
      : items.split(',').map((s) => s.trim()).filter(Boolean);
    return (
      <ul className="space-y-2">
        {arr.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle2 size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex">

      {/* Dark overlay — click to close */}
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Right Panel */}
      <div className="w-full max-w-[520px] h-full bg-white shadow-2xl flex flex-col z-[200]">

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center rounded-lg border flex-shrink-0"
                style={{ background: `${job.companyColor}15`, borderColor: `${job.companyColor}30` }}
              >
                {job.companyLogo ? (
                  <img src={job.companyLogo} alt={job.company} className="w-6 h-6 object-contain" />
                ) : (
                  <CompanyLogo company={job.company} color={job.companyColor || '#16A34A'} size={18} />
                )}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-base leading-tight">{job.title}</h2>
                <p className="text-xs text-gray-500">{job.company}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Meta Chips */}
          <div className="px-6 pt-5 pb-3 flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100">
              <MapPin size={12} /> {job.location}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              <ModeIcon size={12} /> {job.mode}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full border border-purple-100">
              <Briefcase size={12} /> {job.type}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full border border-orange-100">
              <DollarSign size={12} /> {job.salary}
            </span>
          </div>

          {/* Job Details Row */}
          <div className="px-6 pb-4 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Experience</p>
              <p className="text-sm font-semibold text-gray-800">{job.experience || 'Not specified'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Qualification</p>
              <p className="text-sm font-semibold text-gray-800">{job.qualification || 'Not specified'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Job Type</p>
              <p className="text-sm font-semibold text-gray-800">{job.jobCategory || job.type}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Posted</p>
              <p className="text-sm font-medium text-gray-900">{livePostedTime}</p>
            </div>
          </div>

          <div className="px-6 space-y-6 pb-6">

            {/* Full Job Description */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Briefcase size={14} className="text-green-600" />
                Full Job Description
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {job.fullDescription || job.description || 'No description provided.'}
              </p>
            </div>

            <hr className="border-gray-100" />

            {/* Required Skills */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-600" />
                Required Skills
              </h3>
              {renderList(job.requiredSkills || job.tags)}
            </div>

            <hr className="border-gray-100" />

            {/* Tech Stack */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Layers size={14} className="text-green-600" />
                Tech Stack
              </h3>
              {renderList(job.techStack)}
            </div>

            <hr className="border-gray-100" />

            {/* About Company */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Building2 size={14} className="text-green-600" />
                About Company
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {job.aboutCompany || 'No company information provided.'}
              </p>
            </div>

            <hr className="border-gray-100" />

            {/* Benefits */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Gift size={14} className="text-green-600" />
                Benefits & Perks
              </h3>
              {renderBenefits(job.benefits)}
            </div>

          </div>
        </div>

        {/* ── STICKY APPLY BUTTON ── */}
        <div className="border-t bg-white px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
          >
            Apply Now
          </button>
          <p className="text-center text-[11px] text-gray-400 mt-2">
            You'll be redirected to the company's official application
          </p>
        </div>

      </div>

    </div>
  );
};

export default JobDetailsPanel;