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

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', resume: '', city: '', vehicleStatus: '' });
  const [errors, setErrors] = useState({});
  const [kotakData, setKotakData] = useState(null);

  // Fetch full details dynamically
  const [fullJob, setFullJob] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const displayJob = fullJob || job;

  const handleShare = async () => {
    const shareData = {
      title: `${displayJob.title} at ${displayJob.company}`,
      text: `Check out this ${displayJob.title} opportunity at ${displayJob.company} on Startaply!`,
      url: window.location.origin + `/jobs?id=${displayJob.id}`,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) {
        if (err.name !== 'AbortError') {
          navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
          toast.success("Link copied to clipboard!");
        }
      }
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
      setKotakData(null);
      setFormData({ name: '', email: '', phone: '', resume: '', city: '', vehicleStatus: '' });
      setErrors({});
      setFullJob(null);
      setLoadingDetails(true);
      
      axios.get(`${API}/jobs/${job.id}/view`)
        .then(res => setFullJob(res.data))
        .catch(err => console.error("Failed to fetch full job view", err))
        .finally(() => setLoadingDetails(false));
      
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
    const val = e.target.value.replace(/\D/g, '');
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
      const payload = {
        ...formData,
        jobTitle: displayJob.title,
        companyName: displayJob.company
      };

      const res = await axios.post(`${API}/jobs/${displayJob.id}/apply`, payload);
      setApplied(true);
      setIsSubmitting(false);

      if (res.data?.kotakUrl) {
        setKotakData(res.data);
      }

      if (displayJob.applyType === 'external' && displayJob.applyUrl) {
        window.open(displayJob.applyUrl, '_blank');
      }
    } catch (err) {
      toast.error('Failed to submit application. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!job) return null;

  return (
    <div 
      className={`fixed inset-0 z-[2000] flex justify-end transition-opacity duration-300 ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      role="dialog" 
      aria-modal="true" 
      aria-label="Job details"
    >
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-[#0b0f14]/80 backdrop-blur-sm" 
        onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} 
      />

      <div className={`relative w-full md:max-w-[520px] bg-white dark:bg-slate-900 h-[92vh] md:h-full mt-auto md:mt-0 rounded-t-[2rem] md:rounded-none flex flex-col shadow-2xl transition-transform duration-300 transform ${isVisible ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'}`}>

        {/* Mobile Drag Indicator Handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* HEADER */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-[#0b0f14]/50 shrink-0">
          <div className="min-w-0 pr-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight line-clamp-2">{displayJob.title}</h2>
            <p className="text-xs sm:text-sm font-bold text-brand dark:text-brand-hover mt-1 truncate">{displayJob.company}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={handleShare} 
              className="p-2.5 bg-brand-soft hover:bg-brand/20 rounded-full text-brand dark:text-brand-hover transition-colors border border-brand/20 flex items-center justify-center min-h-[40px] min-w-[40px]" 
              aria-label="Share this job"
            >
              <Share2 size={16} />
            </button>
            <button 
              onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} 
              className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors flex items-center justify-center min-h-[40px] min-w-[40px]" 
              aria-label="Close job details"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* BODY */}
        {showForm ? (
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1 bg-white dark:bg-slate-900 custom-scrollbar">
            <button 
              onClick={() => setShowForm(false)} 
              className="text-slate-400 dark:text-slate-500 hover:text-brand dark:hover:text-brand-hover text-xs font-bold flex items-center gap-1.5 transition-colors mb-2 min-h-[36px]"
            >
              &larr; Back to Details
            </button>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1">Complete Application</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Please provide your verified details to apply.</p>
            </div>

            {applied ? (
              <div className="py-4 sm:py-6 space-y-6 animate-in fade-in">
                <div className="bg-brand-soft border border-brand/20 rounded-2xl p-4 flex items-center gap-3 text-brand dark:text-brand-hover">
                  <CheckCircle2 size={24} className="shrink-0 text-brand" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Application Received Successfully!</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-normal">Your record has been logged in our verified recruitment system.</p>
                  </div>
                </div>

                {kotakData?.kotakUrl && (
                  <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-brand/40 text-white rounded-2xl p-5 sm:p-6 border border-red-500/30 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2 text-red-400 text-[10px] font-black uppercase tracking-widest mb-2">
                      <span>Official Kotak 811 Partner Channel</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold tracking-tight mb-2 text-white">
                      Open Kotak 811 Zero-Balance Payroll Account
                    </h3>
                    
                    <p className="text-xs text-slate-300 leading-relaxed mb-4 font-normal">
                      To activate your daily and weekly rolling salary direct deposits with zero fees, complete your 3-minute Video KYC zero-balance account setup:
                    </p>

                    <div className="space-y-2 mb-5 text-xs font-medium text-slate-200">
                      <div className="flex items-center gap-2.5 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                        <span><strong>₹0 Minimum Balance:</strong> No penalty fees.</span>
                      </div>
                      <div className="flex items-center gap-2.5 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                        <span><strong>Instant Virtual Debit Card:</strong> Ready in minutes.</span>
                      </div>
                      <div className="flex items-center gap-2.5 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span><strong>Automated Direct Credits:</strong> 24-hr verification.</span>
                      </div>
                    </div>

                    <a
                      href={kotakData.kotakUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/30 active:scale-95 uppercase tracking-wider min-h-[44px]"
                    >
                      Proceed to Kotak 811 Video KYC <ArrowRight size={14} />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <form id="applyForm" onSubmit={submitApplication} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Name *</label>
                  <input required type="text" value={formData.name} onChange={e => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: null }); }} className={`w-full border rounded-xl px-4 py-3 outline-none transition-all text-sm font-medium dark:bg-[#0b0f14] dark:text-white ${errors.name ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-brand focus:ring-2 focus:ring-brand/20'}`} />
                  {errors.name && <p className="text-rose-500 text-xs font-medium mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email *</label>
                  <input required type="email" value={formData.email} onChange={e => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: null }); }} className={`w-full border rounded-xl px-4 py-3 outline-none transition-all text-sm font-medium dark:bg-[#0b0f14] dark:text-white ${errors.email ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-brand focus:ring-2 focus:ring-brand/20'}`} />
                  {errors.email && <p className="text-rose-500 text-xs font-medium mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Phone (10 Digits)</label>
                  <input type="tel" placeholder="e.g. 9876543210" value={formData.phone} onChange={handlePhoneChange} className={`w-full border rounded-xl px-4 py-3 outline-none transition-all text-sm font-medium dark:bg-[#0b0f14] dark:text-white ${errors.phone ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-brand focus:ring-2 focus:ring-brand/20'}`} />
                  {errors.phone && <p className="text-rose-500 text-xs font-medium mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.phone}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">City / Location</label>
                    <input type="text" placeholder="e.g. Hyderabad" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none transition-all text-sm font-medium dark:bg-[#0b0f14] dark:text-white focus:border-brand" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Vehicle Status</label>
                    <select value={formData.vehicleStatus} onChange={e => setFormData({ ...formData, vehicleStatus: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none transition-all text-sm font-medium dark:bg-[#0b0f14] dark:text-white focus:border-brand">
                      <option value="">Select Option</option>
                      <option value="Two Wheeler">Two Wheeler</option>
                      <option value="Four Wheeler">Four Wheeler</option>
                      <option value="No Vehicle">No Vehicle</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Resume (PDF/Doc)</label>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 dark:bg-[#0b0f14] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-soft file:text-brand hover:file:bg-brand/20 cursor-pointer" />
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1 custom-scrollbar bg-white dark:bg-slate-900 transition-colors">

            {/* TAGS */}
            <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              {displayJob.location && <span className="bg-brand-soft dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"><MapPin size={13} className="text-brand" /> {displayJob.location}</span>}
              {displayJob.type && <span className="bg-brand-soft dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"><Briefcase size={13} className="text-brand" /> {displayJob.type}</span>}
              {displayJob.salary && <span className="bg-brand-soft dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"><IndianRupee size={13} className="text-brand" /> {displayJob.salary}</span>}
              {displayJob.expiryDays && (
                <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                  <CalendarDays size={13} className="text-amber-600 dark:text-amber-400" /> Apply by: {(() => {
                    const d = new Date(new Date(displayJob.createdAt || Date.now()).getTime() + (displayJob.expiryDays * 24 * 60 * 60 * 1000));
                    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                  })()}
                </span>
              )}
            </div>

            {/* MAP LOCATION FOR VOICE/NON-VOICE PROCESSES */}
            {(displayJob.processType === 'Voice Process' || displayJob.processType === 'Non-Voice Process') && displayJob.mapLocationUrl && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand dark:text-brand-hover mb-2.5 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                  <MapPin size={14} /> Interview Walk-in Location
                </h3>
                <div className="w-full h-48 sm:h-56 bg-slate-100 dark:bg-[#0b0f14] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
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
                    <a href={displayJob.mapLocationUrl} target="_blank" rel="noreferrer" className="w-full h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-brand dark:hover:text-brand-hover hover:bg-brand-soft dark:hover:bg-slate-800 transition-colors">
                      <MapPin size={28} className="mb-2 text-brand" />
                      <span className="font-bold text-xs">Click to open Google Maps</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {loadingDetails ? (
              <div className="flex justify-center py-8">
                 <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* DESCRIPTIONS */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">Job Description</h3>
                  <div className="text-slate-600 dark:text-slate-300 font-normal leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">{displayJob.fullDescription || 'No detailed description provided.'}</div>
                </div>

                {displayJob.benefits && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">Benefits & Perks</h3>
                    <div className="text-slate-600 dark:text-slate-300 font-normal leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">{displayJob.benefits}</div>
                  </div>
                )}

                {displayJob.aboutCompany && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">About {displayJob.company}</h3>
                    <div className="text-slate-600 dark:text-slate-300 font-normal leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">{displayJob.aboutCompany}</div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* FOOTER ACTION */}
        <div className="p-4 sm:p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.3)] z-20">
          {showForm ? (
            <button 
              type="submit" 
              form="applyForm" 
              disabled={isSubmitting || applied} 
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-all active:scale-95 min-h-[48px] ${applied ? 'bg-brand-soft text-brand dark:bg-brand-soft dark:text-brand-hover' : 'bg-brand hover:bg-brand-hover text-on-brand shadow-md shadow-brand/20'}`}
            >
              {applied ? <><CheckCircle2 size={18} /> Application Saved</> : isSubmitting ? "Processing..." : displayJob.applyType === 'external' ? "Proceed to Apply" : "Submit Application"}
            </button>
          ) : (
            <button 
              onClick={() => setShowForm(true)} 
              className="w-full py-3.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 bg-brand hover:bg-brand-hover text-on-brand transition-all active:scale-95 shadow-md shadow-brand/20 min-h-[48px]"
            >
              Apply Now <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPanel;

