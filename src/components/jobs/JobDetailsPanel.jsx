import React, { useEffect, useState } from 'react';
import { X, MapPin, Briefcase, IndianRupee, CheckCircle2, ArrowRight, Share2, CalendarDays, GraduationCap, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API = '/api';

const JobDetailsPanel = ({ job, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', resume: '' });
  const [errors, setErrors] = useState({});

  // Fetch full details dynamically
  const [fullJob, setFullJob] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const displayJob = fullJob || job;

  const handleShare = async () => {
    const shareData = {
      title: `${displayJob.title} at ${displayJob.company}`,
      text: `Check out this ${displayJob.title} opportunity at ${displayJob.company} on Strataply!`,
      url: window.location.origin + `/jobs?id=${displayJob.id}`,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { }
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      toast.success("Job details copied to clipboard!");
    }
  };

  useEffect(() => {
    if (job) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setIsVisible(true), 10);
      setApplied(false);
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', resume: '' });
      setErrors({});
      setFullJob(null);
      setLoadingDetails(true);
      
      axios.get(`${API}/jobs/${job.id}/view`)
        .then(res => setFullJob(res.data))
        .catch(err => console.error("Failed to fetch full job view", err))
        .finally(() => setLoadingDetails(false));
      
      // Increment view counter in the background
      axios.post(`${API}/jobs/${job.id}/view`).catch(() => {});
        
    } else {
      setIsVisible(false);
      document.body.style.overflow = '';
      setFullJob(null);
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

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); // Strip non-numeric characters automatically
    if (val.length <= 10) {
      setFormData({ ...formData, phone: val });
      if (errors.phone) setErrors({ ...errors, phone: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!emailRegex.test(formData.email)) newErrors.email = "Please enter a valid email address";
    if (formData.phone && formData.phone.length !== 10) newErrors.phone = "Phone number must be exactly 10 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Include Job context so Admin Dashboard displays correct data instead of "Unknown"
      const payload = {
        ...formData,
        jobTitle: displayJob.title,
        companyName: displayJob.company
      };

      await axios.post(`${API}/jobs/${displayJob.id}/apply`, payload);
      setApplied(true);
      setIsSubmitting(false);

      if (displayJob.applyType === 'external' && displayJob.applyUrl) window.open(displayJob.applyUrl, '_blank');
      setTimeout(() => { setIsVisible(false); setTimeout(onClose, 300); }, 2000);
    } catch (err) {
      toast.error('Failed to submit application. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!job) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex justify-end transition-opacity duration-300 ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} />

      <div className={`relative w-full max-w-[500px] bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl transition-transform duration-300 transform ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-950/50 shrink-0">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight pr-4">{displayJob.title}</h2>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">{displayJob.company}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={handleShare} className="p-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-full text-emerald-600 dark:text-emerald-400 transition-colors border border-emerald-100 dark:border-emerald-800"><Share2 size={18} /></button>
            <button onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors"><X size={20} /></button>
          </div>
        </div>

        {/* BODY */}
        {showForm ? (
          <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-white dark:bg-slate-900 custom-scrollbar">
            <button onClick={() => setShowForm(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-bold flex items-center gap-2 transition-colors mb-2">&larr; Back to Details</button>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">Complete Application</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Please provide your details to continue.</p>
            </div>

            <form id="applyForm" onSubmit={submitApplication} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Name *</label>
                <input required type="text" value={formData.name} onChange={e => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: null }); }} className={`w-full border rounded-xl px-4 py-3 outline-none transition-all font-medium dark:bg-slate-950 dark:text-white ${errors.name ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'}`} />
                {errors.name && <p className="text-rose-500 text-xs font-bold mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Email *</label>
                <input required type="email" value={formData.email} onChange={e => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: null }); }} className={`w-full border rounded-xl px-4 py-3 outline-none transition-all font-medium dark:bg-slate-950 dark:text-white ${errors.email ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'}`} />
                {errors.email && <p className="text-rose-500 text-xs font-bold mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Phone (10 Digits)</label>
                <input type="text" placeholder="e.g. 9876543210" value={formData.phone} onChange={handlePhoneChange} className={`w-full border rounded-xl px-4 py-3 outline-none transition-all font-medium dark:bg-slate-950 dark:text-white ${errors.phone ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'}`} />
                {errors.phone && <p className="text-rose-500 text-xs font-bold mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Resume (PDF/Doc)</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium text-slate-600 dark:text-slate-400 dark:bg-slate-950 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-50 dark:file:bg-emerald-900/40 file:text-emerald-700 dark:file:text-emerald-400 hover:file:bg-emerald-100 dark:hover:file:bg-emerald-900/60 cursor-pointer" />
              </div>
            </form>
          </div>
        ) : (
          <div className="p-6 space-y-8 overflow-y-auto flex-1 custom-scrollbar bg-white dark:bg-slate-900 transition-colors">

            {/* TAGS */}
            <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              {displayJob.location && <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"><MapPin size={14} className="text-emerald-500 dark:text-emerald-400" /> {displayJob.location}</span>}
              {displayJob.type && <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"><Briefcase size={14} className="text-emerald-500 dark:text-emerald-400" /> {displayJob.type}</span>}
              {displayJob.salary && <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"><IndianRupee size={14} className="text-emerald-500 dark:text-emerald-400" /> {displayJob.salary}</span>}
              {displayJob.expiryDays && (
                <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors">
                  <CalendarDays size={14} className="text-emerald-500 dark:text-emerald-400" /> Last Date to Apply: {(() => {
                    const d = new Date(new Date(displayJob.createdAt || Date.now()).getTime() + (displayJob.expiryDays * 24 * 60 * 60 * 1000));
                    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                  })()}
                </span>
              )}
            </div>

            {/* MAP LOCATION FOR VOICE/NON-VOICE PROCESSES */}
            {(displayJob.processType === 'Voice Process' || displayJob.processType === 'Non-Voice Process') && displayJob.mapLocationUrl && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <MapPin size={16} /> Interview Walk-in Location
                </h3>
                <div className="w-full h-64 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                  {displayJob.mapLocationUrl.includes('<iframe') || displayJob.mapLocationUrl.includes('embed') ? (
                    <iframe
                      src={displayJob.mapLocationUrl.match(/src="([^"]+)"/)?.[1] || displayJob.mapLocationUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Interview Location"
                    />
                  ) : (
                    <a href={displayJob.mapLocationUrl} target="_blank" rel="noreferrer" className="w-full h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                      <MapPin size={32} className="mb-2" />
                      <span className="font-bold">Click to open Google Maps</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {loadingDetails ? (
              <div className="flex justify-center py-6">
                 <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* DESCRIPTIONS */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">Job Description</h3>
                  <div className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-[15px] whitespace-pre-wrap">{displayJob.fullDescription || displayJob.description || 'No detailed description provided.'}</div>
                </div>

                {displayJob.benefits && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">Benefits & Perks</h3>
                    <div className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-[15px] whitespace-pre-wrap">{displayJob.benefits}</div>
                  </div>
                )}

                {displayJob.aboutCompany && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">About {displayJob.company}</h3>
                    <div className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-[15px] whitespace-pre-wrap">{displayJob.aboutCompany}</div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* FOOTER ACTION */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.3)] z-20">
          {showForm ? (
            <button type="submit" form="applyForm" disabled={isSubmitting || applied} className={`w-full py-4 rounded-full font-bold text-lg flex justify-center items-center gap-2 transition-all ${applied ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'}`}>
              {applied ? <><CheckCircle2 size={20} /> Application Saved</> : isSubmitting ? "Processing..." : displayJob.applyType === 'external' ? "Proceed to Apply" : "Submit Application"}
            </button>
          ) : (
            <button onClick={() => setShowForm(true)} className="w-full py-4 rounded-full font-bold text-lg flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/30">
              Apply Now <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPanel;