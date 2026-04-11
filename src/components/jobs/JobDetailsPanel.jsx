import React, { useEffect, useState } from 'react';
import { X, MapPin, Briefcase, DollarSign, CheckCircle2, Upload, ArrowRight } from 'lucide-react';
import axios from 'axios';

const JobDetailsPanel = ({ job, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);

  // Application Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resume: ''
  });

  useEffect(() => {
    if (job) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setIsVisible(true), 10);
      setApplied(false);
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', resume: '' });

      // Increment view count in backend
      axios.post(`http://localhost:5000/api/jobs/${job.id}/view`).catch(console.error);
    } else {
      setIsVisible(false);
      document.body.style.overflow = '';
    }
    return () => (document.body.style.overflow = '');
  }, [job]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setFormData({ ...formData, resume: ev.target.result });
      reader.readAsDataURL(file);
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Save applicant lead to the admin database
      await axios.post(`http://localhost:5000/api/jobs/${job.id}/apply`, formData);

      setApplied(true);
      setIsSubmitting(false);

      // 2. Routing logic based on application type
      if (job.applyType === 'external' && job.applyUrl) {
        window.open(job.applyUrl, '_blank');
      }

      // Close panel after success
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 2000);

    } catch (err) {
      console.error('Application submission failed:', err);
      alert('Failed to submit application. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!job) return null;

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} />

      <div className={`relative w-full max-w-[500px] bg-white h-full flex flex-col shadow-2xl transition-transform duration-300 transform ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">{job.title}</h2>
            <p className="text-sm font-bold text-emerald-600 mt-1">{job.company}</p>
          </div>
          <button onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* CONTENT SWITCHER */}
        {showForm ? (
          /* ── APPLICATION FORM ── */
          <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar bg-white">
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-800 text-sm font-bold flex items-center gap-2 transition-colors mb-2">
              &larr; Back to Job Details
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">Complete Application</h3>
              <p className="text-sm text-slate-500 font-medium">Please provide your details to continue.</p>
            </div>

            <form id="applyForm" onSubmit={submitApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address *</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium" placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resume / CV (Optional)</label>
                <label className="flex items-center gap-3 cursor-pointer border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-xl px-4 py-4 transition-all">
                  <Upload size={20} className={formData.resume ? "text-emerald-500" : "text-slate-400"} />
                  <span className="text-sm font-medium text-slate-600">
                    {formData.resume ? 'Resume attached successfully ✓' : 'Click to upload document'}
                  </span>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </form>
          </div>
        ) : (
          /* ── JOB DETAILS ── */
          <div className="p-6 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
            <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-700">
              {job.location && <span className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5"><MapPin size={14} className="text-emerald-500" /> {job.location}</span>}
              {job.type && <span className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5"><Briefcase size={14} className="text-emerald-500" /> {job.type}</span>}
              {job.salary && <span className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5"><DollarSign size={14} className="text-emerald-500" /> {job.salary}</span>}
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-2">Job Description</h3>
              <div className="text-slate-700 font-medium leading-relaxed text-sm whitespace-pre-line">{job.fullDescription || job.description}</div>
            </div>

            {job.requiredSkills && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.split(',').map((s) => (
                    <span key={s} className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-md border border-emerald-100">{s.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {job.aboutCompany && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-2">About Company</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{job.aboutCompany}</p>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM ACTION BAR */}
        <div className="p-6 border-t border-slate-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {showForm ? (
            <button
              type="submit"
              form="applyForm"
              disabled={isSubmitting || applied}
              className={`w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all duration-300 ${applied ? 'bg-emerald-100 text-emerald-700 cursor-default' : isSubmitting ? 'bg-emerald-400 text-white cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 text-white hover:-translate-y-0.5 active:scale-95'}`}
            >
              {applied ? <><CheckCircle2 size={20} /> Application Saved</> : isSubmitting ? "Processing..." : job.applyType === 'external' ? <><ArrowRight size={20} /> Proceed to Apply</> : "Submit Application"}
            </button>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 text-white hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
            >
              Apply Now
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default JobDetailsPanel;