import React, { useEffect, useState, useRef } from 'react';
import {
  X, MapPin, Clock, Briefcase, GraduationCap, DollarSign,
  CheckCircle2, Layers, Building2, Gift, Wifi, Monitor, Building,
  Share2, UploadCloud
} from 'lucide-react';
import { CompanyLogo } from '../common/CompanyLogo';
import { useTimeAgo } from '../../utils/timeAgo';
import { useJobs } from '../../context/JobsContext';

const modeIcon = {
  Remote:   Wifi,
  Hybrid:   Layers,
  'On-site': Building,
};

const JobDetailsPanel = ({ job, onClose }) => {
  const livePostedTime = useTimeAgo(job?.createdAt);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [resumeBase64, setResumeBase64] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const { trackJobView } = useJobs();

  // Lock body scroll when panel is open
  useEffect(() => {
    if (job) {
      document.body.style.overflow = 'hidden';
      setShowForm(false);
      setSuccess(false);
      setFormData({ name: '', email: '', phone: '' });
      setResumeBase64('');
      
      // Track view automatically when opened
      trackJobView(job.id);
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

  const handleShare = async () => {
    const url = `${window.location.origin}/jobs?jobId=${job.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job.title} at ${job.company}`,
          text: `Check out this job opportunity on Strataply: ${job.title}`,
          url,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleApplyClick = () => {
    if (job.applyType === 'easy') {
      setShowForm(true);
    } else {
      if (job.applyUrl) {
        window.open(job.applyUrl, '_blank');
      } else {
        alert('No external application link provided.');
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setResumeBase64(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !resumeBase64) {
      alert('Please fill out Name, Email, and attach a Resume.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${job.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          resume: resumeBase64
        })
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to apply.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Right Panel */}
      <div className="w-full max-w-[520px] h-full bg-white shadow-2xl flex flex-col z-[200] relative">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 hover:bg-green-100 text-green-600 transition-colors flex-shrink-0"
              title="Share Job"
            >
              <Share2 size={14} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex-1 overflow-y-auto relative p-0 m-0">

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
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
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
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
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
          
          {/* EASY APPLY SLIDE-UP OVERLAY */}
          <div className={`absolute bottom-0 left-0 right-0 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-300 z-30 flex flex-col ${showForm ? 'translate-y-0 relative' : 'translate-y-full hidden'}`}>
            <div className="p-6 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-900">Easy Apply to {job.company}</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
              </div>
              
              {success ? (
                <div className="text-center py-8">
                  <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-900 text-lg mb-1">Application Sent!</h4>
                  <p className="text-sm text-gray-500">Your resume has been sent to the employer.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                    <input required type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                    <input required type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 8900"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Resume (PDF/DOC) *</label>
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition">
                      <UploadCloud size={20} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-xs text-gray-600 font-medium">Click to upload resume</p>
                      {resumeBase64 && <p className="text-[10px] text-green-600 mt-1 font-bold">Resume Uploaded Successfully!</p>}
                    </div>
                    <input required={!resumeBase64} type="file" accept=".pdf,.doc,.docx" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors text-sm flex justify-center items-center gap-2 disabled:bg-gray-400">
                    {isSubmitting ? 'Sending...' : 'Submit Final Application'}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* ── STICKY APPLY BUTTON ── */}
        {!showForm && (
          <div className="border-t bg-white px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-20 sticky bottom-0">
            <button
              onClick={handleApplyClick}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2 py-3.5 rounded-xl transition-transform active:scale-95 text-sm"
            >
              {job.applyType === 'easy' ? 'Apply Now (Easy Apply)' : 'Apply on Company Site'}
            </button>
            <p className="text-center text-[11px] text-gray-400 mt-2">
              {job.applyType === 'easy' ? 'Takes less than 1 minute to apply here' : 'You\'ll be redirected to the company\'s official application'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default JobDetailsPanel;