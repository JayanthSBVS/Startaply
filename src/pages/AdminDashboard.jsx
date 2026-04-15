import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, PlusCircle, Briefcase, Trash2, Edit2,
  X, LogOut, Upload, MessageSquare, Users, Building2,
  Megaphone, Calendar, MapPin, Download, Star, Zap,
  MessageSquareQuote, BookOpen, Search // <-- Added Search here
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = '/api';

const inputCls = "w-full bg-slate-900/50 border border-slate-700/50 rounded-full px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:bg-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-inner";
const selectCls = "w-full bg-slate-900/50 border border-slate-700/50 rounded-full px-5 py-3.5 text-sm text-white cursor-pointer focus:bg-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-inner appearance-none";
const textareaCls = "w-full bg-slate-900/50 border border-slate-700/50 rounded-[1.5rem] px-5 py-4 text-sm text-white placeholder-slate-500 focus:bg-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none shadow-inner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [melas, setMelas] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [prepData, setPrepData] = useState([]);

  const [jobForm, setJobForm] = useState({ applyType: 'external', expiryDays: 30, jobCategory: '' });
  const [editingJobId, setEditingJobId] = useState(null);
  const [companyForm, setCompanyForm] = useState({ name: '', industry: '', logo: '' });
  const [melaForm, setMelaForm] = useState({ title: '', date: '', venue: '', time: '', isActive: true, showPopup: true, company: '', registrationLink: '' });
  const [testimonialForm, setTestimonialForm] = useState({ name: '', tagline: '', description: '', photo: '' });
  const [prepForm, setPrepForm] = useState({ heading: '', jobType: 'IT & Non-IT Jobs', content: '' });

  const fetchData = async () => {
    try {
      console.log("Starting data fetch...");

      const [jobsRes, appsRes, compRes, melaRes, fbRes, testRes, prepRes] = await Promise.all([
        axios.get(`${API}/jobs`).catch((err) => { console.error('Jobs Error:', err.message); return { data: [] }; }),
        axios.get(`${API}/jobs/applications/all`).catch((err) => { console.error('Apps Error:', err.message); return { data: [] }; }),
        axios.get(`${API}/companies`).catch((err) => { console.error('Companies Error:', err.message); return { data: [] }; }),
        axios.get(`${API}/job-mela`).catch((err) => { console.error('Mela Error:', err.message); return { data: [] }; }),
        axios.get(`${API}/feedback`).catch((err) => { console.error('Feedback Error:', err.message); return { data: [] }; }),
        axios.get(`${API}/testimonials`).catch((err) => { console.error('Testimonials Error:', err.message); return { data: [] }; }),
        axios.get(`${API}/prep-data`).catch((err) => { console.error('Prep Data Error:', err.message); return { data: [] }; })
      ]);

      console.log("Fetch complete. Loading data into state...");

      const toArr = (d) => (Array.isArray(d) ? d : []);

      setJobs(toArr(jobsRes.data));
      setApplications(toArr(appsRes.data));
      setCompanies(toArr(compRes.data));
      setMelas(toArr(melaRes.data));
      setFeedbacks(toArr(fbRes.data));
      setTestimonials(toArr(testRes.data));
      setPrepData(toArr(prepRes.data));

    } catch (err) {
      console.error("Critical Sync Error:", err);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) navigate('/admin-login');
    fetchData();
  }, [navigate]);

  const showMsg = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const handleToggle = (job, field) => {
    const updatedJob = { ...job, [field]: !job[field] };
    setJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j));
    axios.put(`${API}/jobs/${job.id}`, updatedJob).catch(() => {
      setJobs(prev => prev.map(j => j.id === job.id ? job : j));
      alert("Database sync failed.");
    });
  };

  const handleJobSubmit = async () => {
    try {
      // Ensure category maps perfectly to DB schema
      const payload = { ...jobForm, category: jobForm.jobCategory };
      if (editingJobId) {
        await axios.put(`${API}/jobs/${editingJobId}`, payload);
        showMsg('Job Updated');
      } else {
        await axios.post(`${API}/jobs`, payload);
        showMsg('Job Published');
      }
      setJobForm({ applyType: 'external', expiryDays: 30, jobCategory: '' }); setEditingJobId(null); setActiveTab('manage'); fetchData();
    } catch (err) { alert('Error saving job data'); }
  };

  const handleJobDelete = async (id) => {
    if (!window.confirm('Permanently delete this job?')) return;
    await axios.delete(`${API}/jobs/${id}`);
    fetchData(); showMsg('Job Removed');
  };

  const navItems = [
    { id: 'dashboard', label: 'Analytics', icon: LayoutDashboard },
    { id: 'add', label: 'Post Job', icon: PlusCircle },
    { id: 'manage', label: 'Jobs List', icon: Briefcase },
    { id: 'applications', label: 'Applicants', icon: Users },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'jobmela', label: 'Job Mela', icon: Megaphone },
    { id: 'prep', label: 'Preparation', icon: BookOpen },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex text-white font-sans selection:bg-emerald-500/30">
      {/* Sidebar */}
      <div className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/50 flex flex-col z-[100] transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-800/50 flex justify-between items-center">
          <h2 className="text-xl font-black tracking-tighter">STRATA<span className="text-emerald-500">ADMIN</span></h2>
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === item.id ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800/50">
          <button onClick={() => { localStorage.removeItem('adminToken'); navigate('/admin-login'); }} className="flex items-center gap-3 text-rose-400 text-sm font-bold w-full p-4 hover:bg-rose-500/10 rounded-2xl transition-colors border border-transparent hover:border-rose-500/20"><LogOut size={18} /> Sign Out</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <header className="bg-slate-950/50 backdrop-blur-xl border-b border-slate-800/50 p-4 md:px-8 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-400" onClick={() => setIsMobileMenuOpen(true)}><LayoutDashboard size={24} /></button>
            <h1 className="text-xl font-black uppercase tracking-widest text-slate-200">{activeTab}</h1>
          </div>
          {successMsg && <span className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-5 py-2 rounded-full text-xs font-black animate-in fade-in slide-in-from-top-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">{successMsg}</span>}
        </header>

        <main className="p-4 md:p-8">

          {activeTab === 'add' && (
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-[2.5rem] p-6 md:p-10 shadow-2xl max-w-5xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

              <h2 className="text-3xl font-black mb-10 border-b border-slate-800/60 pb-6 text-white flex items-center gap-4 relative z-10">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400"><PlusCircle size={28} /></div>
                {editingJobId ? 'Edit Performance Listing' : 'Publish New Opportunity'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Job Title *</label><input className={inputCls} value={jobForm.title || ''} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} placeholder="Software Engineer" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Company *</label><input className={inputCls} value={jobForm.company || ''} onChange={e => setJobForm({ ...jobForm, company: e.target.value })} placeholder="Amazon" /></div>

                {/* CRITICAL: EXACT CATEGORY MAPPING */}
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Category *</label>
                  <select className={selectCls} value={jobForm.jobCategory || ''} onChange={e => setJobForm({ ...jobForm, jobCategory: e.target.value })}>
                    <option value="">Select Category</option>
                    <option value="IT & Non-IT Jobs">IT & Non-IT Jobs</option>
                    <option value="Government Jobs">Government Jobs</option>
                    <option value="Private Jobs">Private Jobs</option>
                    <option value="Gig & Services">Gig & Services</option>
                  </select>
                  <div className="absolute right-5 top-[38px] pointer-events-none text-slate-500">▼</div>
                </div>

                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Process Type</label>
                  <select className={selectCls} value={jobForm.processType || 'Standard'} onChange={e => setJobForm({ ...jobForm, processType: e.target.value })}>
                    <option value="Standard">Standard / Normal Role</option>
                    <option value="Voice Process">Voice Process</option>
                    <option value="Non-Voice Process">Non-Voice Process</option>
                  </select>
                  <div className="absolute right-5 top-[38px] pointer-events-none text-slate-500">▼</div>
                </div>

                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Application Flow</label>
                  <select className={selectCls} value={jobForm.applyType || 'external'} onChange={e => setJobForm({ ...jobForm, applyType: e.target.value })}>
                    <option value="external">Third Party (Redirect)</option>
                    <option value="easy">Internal (Easy Apply)</option>
                  </select>
                  <div className="absolute right-5 top-[38px] pointer-events-none text-slate-500">▼</div>
                </div>

                {/* FIX: Handle empty string properly for Expiry Days */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-rose-400 tracking-widest">Expiry Days (Auto-Hide)</label>
                  <input
                    type="number"
                    min="1"
                    className={inputCls}
                    value={jobForm.expiryDays === null || jobForm.expiryDays === undefined ? '' : jobForm.expiryDays}
                    onChange={e => {
                      const val = e.target.value;
                      setJobForm({ ...jobForm, expiryDays: val === '' ? '' : parseInt(val) });
                    }}
                    placeholder="e.g. 30 (Leave blank for no expiry)"
                  />
                </div>

                {jobForm.applyType === 'external' && <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Third Party URL</label><input className={inputCls} value={jobForm.applyUrl || ''} onChange={e => setJobForm({ ...jobForm, applyUrl: e.target.value })} placeholder="https://careers.google.com/..." /></div>}

                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Salary Package</label><input className={inputCls} value={jobForm.salary || ''} onChange={e => setJobForm({ ...jobForm, salary: e.target.value })} placeholder="12 LPA - 15 LPA" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Work Location</label><input className={inputCls} value={jobForm.location || ''} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} placeholder="Bangalore / Remote" /></div>

                {(jobForm.processType === 'Voice Process' || jobForm.processType === 'Non-Voice Process') && (
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Google Maps Embed URL (For Walk-ins)</label>
                    <input className={inputCls} value={jobForm.mapLocationUrl || ''} onChange={e => setJobForm({ ...jobForm, mapLocationUrl: e.target.value })} placeholder="https://www.google.com/maps/embed?..." />
                  </div>
                )}

                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Experience</label><input className={inputCls} value={jobForm.experience || ''} onChange={e => setJobForm({ ...jobForm, experience: e.target.value })} placeholder="2+ Years" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Qualification</label><input className={inputCls} value={jobForm.qualification || ''} onChange={e => setJobForm({ ...jobForm, qualification: e.target.value })} placeholder="B.Tech / MCA" /></div>

                <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Short Description (Card preview)</label><textarea rows="2" className={textareaCls} value={jobForm.description || ''} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} placeholder="Brief summary of the job..."></textarea></div>
                <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Benefits & Perks</label><textarea rows="3" className={textareaCls} value={jobForm.benefits || ''} onChange={e => setJobForm({ ...jobForm, benefits: e.target.value })} placeholder="Provide details about health insurance, PTO, bonuses..."></textarea></div>
                <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Detailed Description</label><textarea rows="5" className={textareaCls} value={jobForm.fullDescription || ''} onChange={e => setJobForm({ ...jobForm, fullDescription: e.target.value })} placeholder="Full job scope..."></textarea></div>
                <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Required Skills (Comma separated)</label><input className={inputCls} value={jobForm.requiredSkills || ''} onChange={e => setJobForm({ ...jobForm, requiredSkills: e.target.value })} placeholder="React, Python, SQL" /></div>

                <div className="space-y-2 md:col-span-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Detail Fields</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <select className={selectCls} value={jobForm.workMode || ''} onChange={e => setJobForm({ ...jobForm, workMode: e.target.value })}>
                        <option value="">Work Mode</option>
                        <option>On-site</option><option>Remote</option><option>Hybrid</option>
                      </select>
                      <div className="absolute right-5 top-[14px] pointer-events-none text-slate-500">▼</div>
                    </div>
                    <div className="relative">
                      <select className={selectCls} value={jobForm.type || ''} onChange={e => setJobForm({ ...jobForm, type: e.target.value })}>
                        <option value="">Job Type</option>
                        <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                      </select>
                      <div className="absolute right-5 top-[14px] pointer-events-none text-slate-500">▼</div>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={handleJobSubmit} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg py-5 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] mt-10 transition-all active:scale-[0.98] relative z-10">{editingJobId ? 'Update & Sync Job' : 'Publish to Live Portal'}</button>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Jobs', val: jobs.length, icon: Briefcase, col: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Applicants', val: applications.length, icon: Users, col: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'Companies', val: companies.length, icon: Building2, col: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { label: 'Job Mela', val: melas.length, icon: Megaphone, col: 'text-amber-400', bg: 'bg-amber-500/10' }
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem] shadow-xl hover:border-slate-700/80 transition-all group overflow-hidden relative">
                    <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity`} />
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                        <h4 className="text-4xl font-black">{stat.val}</h4>
                      </div>
                      <div className={`p-3 rounded-2xl ${stat.bg} ${stat.col} border border-white/5`}>
                        <stat.icon size={24} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-8 rounded-[2.5rem] shadow-2xl">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3"><Zap className="text-emerald-400" size={20} /> Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setActiveTab('add')} className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group">
                      <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform"><PlusCircle size={24} /></div>
                      <span className="text-sm font-bold">New Job</span>
                    </button>
                    <button onClick={() => setActiveTab('jobmela')} className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all group">
                      <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform"><Megaphone size={24} /></div>
                      <span className="text-sm font-bold">Mela Settings</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-8 rounded-[2.5rem] shadow-2xl">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3"><MessageSquare className="text-blue-400" size={20} /> Recent Feedback</h3>
                  <div className="space-y-4">
                    {feedbacks.slice(0, 3).map((fb, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                        <p className="text-xs text-slate-400 mb-1 font-bold">{fb.name} • {new Date(parseInt(fb.createdAt || Date.now())).toLocaleDateString()}</p>
                        <p className="text-sm line-clamp-2">{fb.message}</p>
                      </div>
                    ))}
                    {feedbacks.length === 0 && <p className="text-center py-6 text-slate-500 text-sm font-medium">No feedback received yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black tracking-tight">Active Listings <span className="text-slate-500 text-base font-medium ml-2">{jobs.length} total</span></h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input className="bg-slate-900/50 border border-slate-800 rounded-full pl-10 pr-5 py-2.5 text-xs font-bold outline-none focus:border-emerald-500 transition-all w-64" placeholder="Search jobs name or company..." />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {jobs.map(job => (
                  <div key={job.id} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-5 rounded-3xl shadow-lg hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center text-xl font-black text-emerald-500 group-hover:scale-110 transition-transform">{job.company?.charAt(0)}</div>
                      <div>
                        <h4 className="font-black text-lg leading-tight">{job.title}</h4>
                        <p className="text-slate-400 text-sm font-medium flex items-center gap-2 mt-1">
                          <Building2 size={14} /> {job.company} • <MapPin size={14} /> {job.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase text-slate-500">Featured</span>
                          <button onClick={() => handleToggle(job, 'isFeatured')} className={`w-10 h-5 rounded-full transition-colors relative ${job.isFeatured ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${job.isFeatured ? 'left-6' : 'left-1'}`} />
                          </button>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase text-slate-500">Today</span>
                          <button onClick={() => handleToggle(job, 'isToday')} className={`w-10 h-5 rounded-full transition-colors relative ${job.isToday ? 'bg-blue-500' : 'bg-slate-700'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${job.isToday ? 'left-6' : 'left-1'}`} />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 border-l border-slate-800/80 pl-6">
                        <button onClick={() => { setJobForm({ ...job, jobCategory: job.category }); setEditingJobId(job.id); setActiveTab('add'); }} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"><Edit2 size={18} /></button>
                        <button onClick={() => handleJobDelete(job.id)} className="p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <div className="text-center py-20 bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-800">
                    <Briefcase size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-400 font-bold">No jobs posted yet. Get started by publishing a new one!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="animate-in fade-in slide-in-from-bottom-5">

              {/* Scalable Applicant Data Manager */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[2.5rem] overflow-hidden shadow-2xl">

                {/* Table Header & Controls */}
                <div className="p-8 border-b border-slate-800/60">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-4">
                      <Users className="text-emerald-400" /> Applicant Tracking
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-black tracking-widest ml-2">
                        {applications.length} TOTAL
                      </span>
                    </h2>
                  </div>

                  {/* Global Search & Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        type="text"
                        placeholder="Search by applicant name, email, or job title..."
                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-full pl-12 pr-5 py-3.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-inner"
                        onChange={(e) => {
                          const term = e.target.value.toLowerCase();
                          const rows = document.querySelectorAll('.applicant-row');
                          rows.forEach(row => {
                            const text = row.innerText.toLowerCase();
                            row.style.display = text.includes(term) ? '' : 'none';
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Unified Scalable Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-950/50 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black border-b border-slate-800">
                        <th className="px-8 py-5">Applicant</th>
                        <th className="px-8 py-5">Position Applied</th>
                        <th className="px-8 py-5">Contact Info</th>
                        <th className="px-8 py-5 text-center">Applied On</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {applications.map(app => (
                        <tr key={app.id} className="applicant-row hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="font-bold text-slate-100 text-base">{app.name}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="font-bold text-emerald-400">{app.jobTitle || 'General Application'}</div>
                            <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">
                              {app.companyName || 'Strataply Platform'}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-sm font-medium text-slate-300">{app.email}</div>
                            <div className="text-xs text-slate-500 font-bold mt-1">{app.phone || 'No Phone Provided'}</div>
                          </td>
                          <td className="px-8 py-6 text-center text-sm text-slate-400 font-bold">
                            {new Date(parseInt(app.createdAt || app.appliedAt || Date.now())).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-3">
                              {app.resume && (
                                <a href={app.resume} download={`Resume_${app.name}`} className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-emerald-500 transition-colors border border-emerald-500/20" title="Download Resume">
                                  <Download size={18} />
                                </a>
                              )}
                              <button
                                onClick={async () => {
                                  if (window.confirm('Permanently delete this applicant record?')) {
                                    await axios.delete(`${API}/jobs/applications/${app.id}`);
                                    fetchData();
                                    showMsg('Application Deleted');
                                  }
                                }}
                                className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-colors border border-rose-500/20"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {applications.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center py-32 text-slate-500">
                            <Users size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="font-bold uppercase tracking-widest text-xs">No applications found in database</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-8 rounded-[2.5rem] sticky top-24">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-3"><Building2 className="text-purple-400" /> New Company</h3>
                  <div className="space-y-4">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Name</label><input className={inputCls} placeholder="Company Name" value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Industry</label><input className={inputCls} placeholder="e.g. Technology" value={companyForm.industry} onChange={e => setCompanyForm({ ...companyForm, industry: e.target.value })} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Logo URL</label><input className={inputCls} placeholder="https://..." value={companyForm.logo} onChange={e => setCompanyForm({ ...companyForm, logo: e.target.value })} /></div>
                    <button onClick={async () => { await axios.post(`${API}/companies`, companyForm); setCompanyForm({ name: '', industry: '', logo: '' }); fetchData(); showMsg('Company added'); }} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-full mt-4 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">Add Partner</button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map(comp => (
                  <div key={comp.id} className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-[2rem] flex items-center justify-between group overflow-hidden relative">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden">{comp.logo ? <img src={comp.logo} alt={comp.name} className="w-full h-full object-contain" /> : <Building2 className="text-slate-600" />}</div>
                      <div>
                        <div className="font-extrabold text-slate-200">{comp.name}</div>
                        <div className="text-[10px] font-black text-slate-500 tracking-widest uppercase">{comp.industry}</div>
                      </div>
                    </div>
                    <button onClick={async () => { if (window.confirm('Delete company?')) { await axios.delete(`${API}/companies/${comp.id}`); fetchData(); showMsg('Removed'); } }} className="p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl text-rose-500 transition-colors opacity-0 group-hover:opacity-100 relative z-10"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'jobmela' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 max-w-4xl mx-auto space-y-8">
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-[2.5rem] p-10">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-4"><Megaphone className="text-amber-400" /> Job Mela Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Mela Title</label><input className={inputCls} value={melaForm.title} onChange={e => setMelaForm({ ...melaForm, title: e.target.value })} placeholder="Career Mega Fair 2024" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Target Date</label><input type="date" className={inputCls} value={melaForm.date} onChange={e => setMelaForm({ ...melaForm, date: e.target.value })} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Venue / Location</label><input className={inputCls} value={melaForm.venue} onChange={e => setMelaForm({ ...melaForm, venue: e.target.value })} placeholder="Online / Hyderabad" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Timing</label><input className={inputCls} value={melaForm.time} onChange={e => setMelaForm({ ...melaForm, time: e.target.value })} placeholder="10:00 AM - 4:00 PM" /></div>
                  <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">External Registration Link</label><input className={inputCls} value={melaForm.registrationLink} onChange={e => setMelaForm({ ...melaForm, registrationLink: e.target.value })} placeholder="https://forms.gle/..." /></div>
                  <div className="flex gap-10 bg-slate-950/50 p-6 rounded-3xl border border-slate-800 md:col-span-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black uppercase text-slate-500">Live Ticker</span>
                      <button onClick={() => setMelaForm({ ...melaForm, isActive: !melaForm.isActive })} className={`w-12 h-6 rounded-full transition-colors relative ${melaForm.isActive ? 'bg-amber-500' : 'bg-slate-700'}`}><div className={`absolute top-1.5 w-3 h-3 bg-white rounded-full transition-all ${melaForm.isActive ? 'left-7' : 'left-2'}`} /></button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black uppercase text-slate-500">Auto-Popup</span>
                      <button onClick={() => setMelaForm({ ...melaForm, showPopup: !melaForm.showPopup })} className={`w-12 h-6 rounded-full transition-colors relative ${melaForm.showPopup ? 'bg-emerald-500' : 'bg-slate-700'}`}><div className={`absolute top-1.5 w-3 h-3 bg-white rounded-full transition-all ${melaForm.showPopup ? 'left-7' : 'left-2'}`} /></button>
                    </div>
                  </div>
                </div>
                <button onClick={async () => { await axios.post(`${API}/job-mela`, melaForm); fetchData(); showMsg('Mela Settings Updated'); }} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-5 rounded-full mt-10 transition-all shadow-xl shadow-amber-500/10">Broadcast Configuration</button>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-black flex items-center gap-2 px-4"><Zap size={20} className="text-amber-400" /> Active Melas</h4>
                {melas.map(m => (
                  <div key={m.id} className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 flex justify-between items-center group">
                    <div>
                      <div className="font-extrabold text-slate-200">{m.title}</div>
                      <div className="text-xs text-slate-500 font-bold mt-1">{m.date} • {m.venue}</div>
                    </div>
                    <button onClick={async () => { if (window.confirm('Delete mela?')) { await axios.delete(`${API}/job-mela/${m.id}`); fetchData(); showMsg('Removed'); } }} className="p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'prep' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/60 h-fit sticky top-24 shadow-2xl">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-4 text-emerald-400"><BookOpen size={28} /> New Preparation Content</h3>
                <div className="space-y-6">
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Title / Topic</label><input className={inputCls} placeholder="e.g. React Interview Basics" value={prepForm.heading} onChange={e => setPrepForm({ ...prepForm, heading: e.target.value })} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Target Category</label>
                    <div className="relative">
                      <select className={selectCls} value={prepForm.jobType} onChange={e => setPrepForm({ ...prepForm, jobType: e.target.value })}>
                        <option>IT Jobs</option><option>Non-IT Jobs</option><option>Government Jobs</option>
                      </select>
                      <div className="absolute right-5 top-[14px] pointer-events-none text-slate-500">▼</div>
                    </div>
                  </div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Content / Body</label><textarea rows="8" className={textareaCls} placeholder="Write detailed tips, links, or instructions..." value={prepForm.content} onChange={e => setPrepForm({ ...prepForm, content: e.target.value })}></textarea></div>
                  <button onClick={async () => { await axios.post(`${API}/prep-data`, prepForm); setPrepForm({ heading: '', jobType: 'IT Jobs', content: '' }); fetchData(); showMsg('Prep Material Published'); }} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-5 rounded-full mt-4 shadow-lg shadow-emerald-500/20 transition-all active:scale-95">Publish to Prep Page</button>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="text-sm font-black uppercase text-slate-500 tracking-[0.2em] px-4 flex items-center justify-between">Existing Materials <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-lg text-[10px]">{prepData.length} Items</span></h4>
                <div className="space-y-4">
                  {prepData.map(item => (
                    <div key={item.id} className="bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800/80 group">
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-slate-800 text-emerald-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-700/50">{item.jobType}</span>
                        <button onClick={async () => { if (window.confirm('Delete material?')) { await axios.delete(`${API}/prep-data/${item.id}`); fetchData(); showMsg('Removed'); } }} className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                      </div>
                      <h5 className="font-extrabold text-slate-100 mb-2">{item.heading}</h5>
                      <p className="text-slate-400 text-sm line-clamp-3 font-medium">{item.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/60 sticky top-24 shadow-2xl">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-purple-400"><Star size={24} /> Add Testimonial</h3>
                  <div className="space-y-4">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Full Name</label><input className={inputCls} value={testimonialForm.name} onChange={e => setTestimonialForm({ ...testimonialForm, name: e.target.value })} placeholder="John Doe" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Tagline / Role</label><input className={inputCls} value={testimonialForm.tagline} onChange={e => setTestimonialForm({ ...testimonialForm, tagline: e.target.value })} placeholder="Senior Developer" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Review</label><textarea rows="4" className={textareaCls} value={testimonialForm.description} onChange={e => setTestimonialForm({ ...testimonialForm, description: e.target.value })} placeholder="Their success story..."></textarea></div>
                    <button onClick={async () => { await axios.post(`${API}/testimonials`, testimonialForm); setTestimonialForm({ name: '', tagline: '', description: '', photo: '' }); fetchData(); showMsg('Testimonial added'); }} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-full mt-4 transition-all shadow-lg shadow-emerald-500/20">Publish Review</button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map(t => (
                  <div key={t.id} className="bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800/60 group relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center font-black text-emerald-400 border border-emerald-500/20">{t.name.charAt(0)}</div>
                          <div>
                            <div className="font-bold text-slate-200">{t.name}</div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.tagline}</div>
                          </div>
                        </div>
                        <button onClick={async () => { if (window.confirm('Delete testimonial?')) { await axios.delete(`${API}/testimonials/${t.id}`); fetchData(); showMsg('Removed'); } }} className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                      </div>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed italic">"{t.description}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="animate-in fade-in slide-in-from-bottom-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbacks.map(fb => (
                  <div key={fb.id} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-8 rounded-[2.5rem] relative group hover:border-blue-500/50 transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20"><MessageSquare size={24} /></div>
                      <button onClick={async () => { if (window.confirm('Delete feedback?')) { await axios.delete(`${API}/feedback/${fb.id}`); fetchData(); showMsg('Feedback Removed'); } }} className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                    </div>
                    <p className="text-slate-200 font-medium leading-relaxed mb-6">"{fb.message}"</p>
                    <div className="pt-6 border-t border-slate-800/50 flex justify-between items-end">
                      <div>
                        <div className="font-extrabold text-sm">{fb.name}</div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{new Date(parseInt(fb.createdAt || Date.now())).toDateString()}</div>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={10} className={star <= (fb.rating || 5) ? 'fill-amber-500 text-amber-500' : 'text-slate-700'} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {feedbacks.length === 0 && (
                  <div className="col-span-full py-32 text-center bg-slate-900/10 rounded-[3rem] border border-dashed border-slate-800/50">
                    <MessageSquare size={48} className="mx-auto text-slate-800 mb-6" />
                    <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">Awaiting User Feedback</h3>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;