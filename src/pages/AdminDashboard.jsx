import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, PlusCircle, Briefcase, Trash2, Edit2,
  Check, X, ChevronLeft, LogOut, Upload, MessageSquare, Users, Building2,
  Megaphone, Calendar, MapPin, Download, Star, Zap, Clock, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = '/api';

const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none transition";
const selectCls = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white cursor-pointer focus:ring-2 focus:ring-emerald-500 outline-none transition";
const textareaCls = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Core Data States
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [melas, setMelas] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  // Form States
  const [jobForm, setJobForm] = useState({ applyType: 'external', expiryDays: 30 });
  const [editingJobId, setEditingJobId] = useState(null);
  const [companyForm, setCompanyForm] = useState({ name: '', industry: '', logo: '' });
  const [melaForm, setMelaForm] = useState({ title: '', date: '', venue: '', time: '', isActive: true, showPopup: true, company: '', registrationLink: '' });
  const [appSearch, setAppSearch] = useState('');

  const fetchData = async () => {
    try {
      const [jobsRes, appsRes, compRes, melaRes, fbRes] = await Promise.all([
        axios.get(`${API}/jobs`),
        axios.get(`${API}/jobs/applications/all`),
        axios.get(`${API}/companies`),
        axios.get(`${API}/job-mela`),
        axios.get(`${API}/feedback`)
      ]);
      setJobs(jobsRes.data);
      setApplications(appsRes.data);
      setCompanies(compRes.data);
      setMelas(melaRes.data);
      setFeedbacks(fbRes.data);
    } catch (err) { console.error("Sync Error:", err); }
  };

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) navigate('/admin-login');
    fetchData();
  }, [navigate]);

  const showMsg = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  // --- OPTIMISTIC TOGGLE LOGIC ---
  const handleToggle = (job, field) => {
    const updatedJob = { ...job, [field]: !job[field] };
    setJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j));
    axios.put(`${API}/jobs/${job.id}`, updatedJob).catch(() => {
      setJobs(prev => prev.map(j => j.id === job.id ? job : j));
      alert("Database sync failed.");
    });
  };

  // --- JOB MANAGEMENT ---
  const handleJobSubmit = async () => {
    try {
      if (editingJobId) {
        await axios.put(`${API}/jobs/${editingJobId}`, jobForm);
        showMsg('Job Updated');
      } else {
        await axios.post(`${API}/jobs`, jobForm);
        showMsg('Job Published');
      }
      setJobForm({ applyType: 'external', expiryDays: 30 }); setEditingJobId(null); setActiveTab('manage'); fetchData();
    } catch (err) { alert('Error saving job data'); }
  };

  const handleJobDelete = async (id) => {
    if (!window.confirm('Permanently delete this job?')) return;
    await axios.delete(`${API}/jobs/${id}`);
    fetchData(); showMsg('Job Removed');
  };

  // --- MEDIA HANDLERS ---
  const handleFileUpload = (e, formType, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (formType === 'job') setJobForm({ ...jobForm, [field]: ev.target.result });
      if (formType === 'company') setCompanyForm({ ...companyForm, [field]: ev.target.result });
      if (formType === 'mela') setMelaForm({ ...melaForm, [field]: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const navItems = [
    { id: 'dashboard', label: 'Analytics', icon: LayoutDashboard },
    { id: 'add', label: 'Post Job', icon: PlusCircle },
    { id: 'manage', label: 'Jobs List', icon: Briefcase },
    { id: 'applications', label: 'Applicants', icon: Users },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'jobmela', label: 'Job Mela', icon: Megaphone },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex text-white font-sans">
      {/* SIDEBAR */}
      <div className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-[100] transition-transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-black tracking-tighter">STRATA<span className="text-emerald-500">ADMIN</span></h2>
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => { localStorage.removeItem('adminToken'); navigate('/admin-login'); }} className="flex items-center gap-2 text-red-400 text-sm font-bold w-full p-3 hover:bg-red-950/20 rounded-xl transition-colors"><LogOut size={16} /> Sign Out</button>
        </div>
      </div>

      {/* MAIN VIEW */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent)]">
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 md:px-8 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-400" onClick={() => setIsMobileMenuOpen(true)}><LayoutDashboard size={24} /></button>
            <h1 className="text-xl font-black uppercase tracking-tight">{activeTab}</h1>
          </div>
          {successMsg && <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-black animate-bounce shadow-lg shadow-emerald-500/40">{successMsg}</span>}
        </header>

        <main className="p-4 md:p-8">

          {/* 1. ANALYTICS DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl"><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Live Jobs</p><p className="text-4xl font-black text-emerald-400">{jobs.length}</p></div>
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl"><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Applies</p><p className="text-4xl font-black text-blue-400">{applications.length}</p></div>
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl"><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Global Views</p><p className="text-4xl font-black text-amber-400">{jobs.reduce((s, j) => s + (j.views || 0), 0)}</p></div>
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl"><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Feedbacks</p><p className="text-4xl font-black text-purple-400">{feedbacks.length}</p></div>
              </div>

              <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800 bg-slate-800/30 font-black text-sm uppercase tracking-widest text-slate-400">User Analysis & Job Performance</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950 text-slate-500 font-bold border-b border-slate-800">
                      <tr><th className="p-5">Job Title</th><th className="p-5">Category</th><th className="p-5 text-center">Views</th><th className="p-5 text-center">Applies</th><th className="p-5 text-center">CTR</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {jobs.map(job => (
                        <tr key={job.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-5 font-bold text-white">{job.title}<br /><span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{job.company}</span></td>
                          <td className="p-5 text-slate-400 font-medium">{job.jobCategory}</td>
                          <td className="p-5 text-center font-black text-amber-400">{job.views || 0}</td>
                          <td className="p-5 text-center font-black text-blue-400">{job.applicationCount || 0}</td>
                          <td className="p-5 text-center text-emerald-400 font-black">
                            {job.views ? Math.round(((job.applicationCount || 0) / job.views) * 100) : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. ADD/EDIT JOB FORM */}
          {activeTab === 'add' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl max-w-5xl mx-auto">
              <h2 className="text-2xl font-black mb-10 border-b border-slate-800 pb-6 text-emerald-400 flex items-center gap-3">
                <PlusCircle /> {editingJobId ? 'Edit Performance Listing' : 'Publish Comprehensive Job'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Job Title *</label><input className={inputCls} value={jobForm.title || ''} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} placeholder="Software Engineer" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Company *</label><input className={inputCls} value={jobForm.company || ''} onChange={e => setJobForm({ ...jobForm, company: e.target.value })} placeholder="Amazon" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Category *</label>
                  <select className={selectCls} value={jobForm.jobCategory || ''} onChange={e => setJobForm({ ...jobForm, jobCategory: e.target.value })}>
                    <option value="">Select Category</option>
                    <option>IT & Software Jobs</option><option>Government Jobs</option><option>Non-IT Jobs</option><option>Gig Works</option>
                  </select>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Application Flow</label>
                  <select className={selectCls} value={jobForm.applyType || 'external'} onChange={e => setJobForm({ ...jobForm, applyType: e.target.value })}>
                    <option value="external">Third Party (Redirect)</option><option value="easy">Internal (Easy Apply)</option>
                  </select>
                </div>
                {jobForm.applyType === 'external' && <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Third Party URL</label><input className={inputCls} value={jobForm.applyUrl || ''} onChange={e => setJobForm({ ...jobForm, applyUrl: e.target.value })} placeholder="https://careers.google.com/..." /></div>}
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Salary Package</label><input className={inputCls} value={jobForm.salary || ''} onChange={e => setJobForm({ ...jobForm, salary: e.target.value })} placeholder="12 LPA - 15 LPA" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Work Location</label><input className={inputCls} value={jobForm.location || ''} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} placeholder="Bangalore / Remote" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Experience</label><input className={inputCls} value={jobForm.experience || ''} onChange={e => setJobForm({ ...jobForm, experience: e.target.value })} placeholder="2+ Years" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Qualification</label><input className={inputCls} value={jobForm.qualification || ''} onChange={e => setJobForm({ ...jobForm, qualification: e.target.value })} placeholder="B.Tech / MCA" /></div>
                <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Short Description (Card preview)</label><textarea rows="2" className={textareaCls} value={jobForm.description || ''} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} placeholder="Brief summary of the job..."></textarea></div>
                <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Benefits & Perks</label><textarea rows="3" className={textareaCls} value={jobForm.benefits || ''} onChange={e => setJobForm({ ...jobForm, benefits: e.target.value })} placeholder="Provide details about health insurance, PTO, bonuses..."></textarea></div>
                <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Detailed Description</label><textarea rows="5" className={textareaCls} value={jobForm.fullDescription || ''} onChange={e => setJobForm({ ...jobForm, fullDescription: e.target.value })} placeholder="Full job scope..."></textarea></div>
                <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Required Skills (Comma separated)</label><input className={inputCls} value={jobForm.requiredSkills || ''} onChange={e => setJobForm({ ...jobForm, requiredSkills: e.target.value })} placeholder="React, Python, SQL" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Detail Fields</label>
                  <div className="grid grid-cols-2 gap-4">
                    <select className={selectCls} value={jobForm.workMode || ''} onChange={e => setJobForm({ ...jobForm, workMode: e.target.value })}>
                      <option value="">Work Mode</option>
                      <option>On-site</option><option>Remote</option><option>Hybrid</option>
                    </select>
                    <select className={selectCls} value={jobForm.type || ''} onChange={e => setJobForm({ ...jobForm, type: e.target.value })}>
                      <option value="">Job Type</option>
                      <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                    </select>
                  </div>
                </div>
              </div>
              <button onClick={handleJobSubmit} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-900/20 mt-10 transition-all active:scale-95">{editingJobId ? 'Update & Sync Job' : 'Publish to Live Portal'}</button>
            </div>
          )}

          {/* 3. MANAGE JOBS LIST */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              {jobs.map(job => (
                <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-emerald-900/50 transition-all shadow-lg">
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-white">{job.title}</h3>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-tighter">{job.company} • {job.jobCategory}</p>
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => handleToggle(job, 'isFeatured')} className={`px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 border transition-all ${job.isFeatured ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}><Star size={12} /> Featured</button>
                      <button onClick={() => handleToggle(job, 'isFresh')} className={`px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 border transition-all ${job.isFresh ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}><Zap size={12} /> Today's Job</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center px-5 border-r border-slate-800"><p className="text-2xl font-black text-amber-400">{job.views || 0}</p><p className="text-[10px] text-slate-500 uppercase font-black">Views</p></div>
                    <div className="text-center px-5 border-r border-slate-800"><p className="text-2xl font-black text-blue-400">{job.applicationCount || 0}</p><p className="text-[10px] text-slate-500 uppercase font-black">Applies</p></div>
                    <button onClick={() => { setJobForm(job); setEditingJobId(job.id); setActiveTab('add'); }} className="p-4 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-2xl transition"><Edit2 size={20} /></button>
                    <button onClick={() => handleJobDelete(job.id)} className="p-4 bg-red-950/30 hover:bg-red-900/50 text-red-400 rounded-2xl transition"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4. APPLICATIONS TRACKER */}
          {activeTab === 'applications' && (
            <div className="space-y-8">
              {Object.entries(
                applications.reduce((acc, app) => {
                  const job = jobs.find(j => String(j.id) === String(app.jobId));
                  const key = job ? `${job.title} — ${job.company}` : 'Unknown Listing';
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(app);
                  return acc;
                }, {})
              ).map(([group, apps]) => (
                <div key={group} className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                  <div className="bg-slate-800/50 p-5 px-8 font-black text-sm text-emerald-400 flex justify-between items-center border-b border-slate-800 uppercase tracking-widest">
                    <span>{group}</span>
                    <span className="bg-emerald-950 text-emerald-400 px-3 py-1 rounded-full text-[10px]">{apps.length} Leads</span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {apps.map(app => (
                      <div key={app.id} className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-6 hover:bg-slate-800/20">
                        <div>
                          <p className="font-black text-lg text-white">{app.name}</p>
                          <p className="text-sm text-slate-500 font-bold">{app.email} • {app.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          {app.resume && (
                            <a href={app.resume} download={`Resume_${app.name}`} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all"><Download size={16} /> Download CV</a>
                          )}
                          <button onClick={() => { if (window.confirm('Delete applicant?')) axios.delete(`${API}/jobs/applications/${app.id}`).then(fetchData); }} className="bg-red-950/40 hover:bg-red-900/50 text-red-400 px-4 py-3 rounded-2xl transition" title="Delete Applicant"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. MANAGE COMPANIES */}
          {activeTab === 'companies' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 lg:col-span-1 h-fit shadow-2xl">
                <h3 className="font-black text-xl mb-6 text-emerald-400">Onboard Company</h3>
                <div className="space-y-5">
                  <input className={inputCls} placeholder="Official Name" value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} />
                  <input className={inputCls} placeholder="Industry (Tech, Finance...)" value={companyForm.industry} onChange={e => setCompanyForm({ ...companyForm, industry: e.target.value })} />
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-3">Company Logo</label>
                    <label className="flex items-center gap-4 cursor-pointer bg-slate-800 border-2 border-dashed border-slate-700 p-4 rounded-2xl hover:border-emerald-500 transition-all group">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all"><Upload size={20} /></div>
                      <span className="text-xs text-slate-400 font-bold">{companyForm.logo ? 'Logo Loaded ✓' : 'Select Image'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'company', 'logo')} />
                    </label>
                    {companyForm.logo && <img src={companyForm.logo} alt="p" className="mt-4 w-full h-24 object-contain rounded-xl bg-white p-2" />}
                  </div>
                  <button onClick={() => { axios.post(`${API}/companies`, companyForm).then(() => { setCompanyForm({ name: '', industry: '', logo: '' }); fetchData(); showMsg('Company Onboarded'); }); }} className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95">Save Company</button>
                </div>
              </div>
              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-6">
                {companies.map(c => (
                  <div key={c.id} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center relative group shadow-xl hover:border-emerald-900/40 transition-all">
                    <div className="w-20 h-20 bg-slate-800 border border-slate-700 mx-auto rounded-3xl flex items-center justify-center mb-6 overflow-hidden">
                      {c.logo ? <img src={c.logo} className="w-full h-full object-contain p-2 bg-white" alt="c" /> : <span className="text-3xl font-black text-emerald-500">{c.name[0]}</span>}
                    </div>
                    <p className="font-black text-lg text-white line-clamp-1">{c.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black">{c.industry}</p>
                    <button onClick={() => { if (window.confirm('Delete company?')) axios.delete(`${API}/companies/${c.id}`).then(fetchData); }} className="absolute top-4 right-4 p-2.5 bg-red-950/40 text-red-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-900/50"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. JOB MELA EVENTS */}
          {activeTab === 'jobmela' && (
            <div className="space-y-10">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl max-w-4xl mx-auto">
                <h3 className="font-black text-2xl mb-8 text-emerald-400 flex items-center gap-3"><Megaphone /> Host Recruiting Drive</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2"><input className={inputCls} placeholder="Mega Drive Name" value={melaForm.title} onChange={e => setMelaForm({ ...melaForm, title: e.target.value })} /></div>
                  <input className={inputCls} placeholder="Organizing Company" value={melaForm.company} onChange={e => setMelaForm({ ...melaForm, company: e.target.value })} />
                  <input className={inputCls} placeholder="Registration Link (Optional)" value={melaForm.registrationLink} onChange={e => setMelaForm({ ...melaForm, registrationLink: e.target.value })} />
                  <input className={inputCls} type="date" value={melaForm.date} onChange={e => setMelaForm({ ...melaForm, date: e.target.value })} />
                  <input className={inputCls} placeholder="Venue Details" value={melaForm.venue} onChange={e => setMelaForm({ ...melaForm, venue: e.target.value })} />
                  <input className={inputCls} placeholder="Reporting Time" value={melaForm.time} onChange={e => setMelaForm({ ...melaForm, time: e.target.value })} />
                  <div className="md:col-span-2"><textarea rows="3" className={textareaCls} placeholder="Event Description / Eligibility" value={melaForm.description} onChange={e => setMelaForm({ ...melaForm, description: e.target.value })}></textarea></div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-3">Event Banner / Ad Image</label>
                    <label className="flex items-center gap-4 cursor-pointer bg-slate-800 border-2 border-dashed border-slate-700 p-6 rounded-2xl hover:border-emerald-500 transition-all group">
                      <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all"><Upload size={24} /></div>
                      <span className="text-sm text-slate-400 font-bold">{melaForm.image ? 'Banner Loaded ✓' : 'Click to Upload Flyer'}</span>
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'mela', 'image')} />
                    </label>
                  </div>
                  <div className="md:col-span-2"><button onClick={() => { axios.post(`${API}/job-mela`, melaForm).then(() => { setMelaForm({ title: '', date: '', venue: '', time: '', isActive: true, showPopup: true, company: '', registrationLink: '' }); fetchData(); showMsg('Mela Published'); }); }} className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-95 mt-4">Broadcast Event</button></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {melas.map(m => (
                  <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative group shadow-2xl">
                    {m.image && <img src={m.image} alt="m" className="w-full h-48 object-cover brightness-50 group-hover:brightness-75 transition-all" />}
                    <div className="p-8">
                      <h4 className="font-black text-xl mb-4 text-white uppercase tracking-tight">{m.title}</h4>
                      <div className="space-y-2 mb-6">
                        <p className="flex items-center gap-3 text-xs font-bold text-slate-400"><Calendar size={14} className="text-emerald-500" /> {m.date}</p>
                        <p className="flex items-center gap-3 text-xs font-bold text-slate-400"><MapPin size={14} className="text-emerald-500" /> {m.venue}</p>
                      </div>
                      <button onClick={() => { if (window.confirm('Cancel event?')) axios.delete(`${API}/job-mela/${m.id}`).then(fetchData); }} className="absolute top-4 right-4 bg-red-950/80 text-red-400 p-3 rounded-2xl hover:bg-red-900 transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. FEEDBACK VIEWER */}
          {activeTab === 'feedback' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedbacks.map(fb => (
                <div key={fb.id} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative shadow-xl hover:border-emerald-900/40 transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-emerald-900/30 text-emerald-500 rounded-2xl flex items-center justify-center font-black text-xl">{fb.name[0]}</div>
                    <div><p className="font-black text-white">{fb.name}</p><p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{fb.email}</p></div>
                  </div>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed italic border-l-2 border-emerald-900/50 pl-4">"{fb.message}"</p>
                  <button onClick={() => { axios.delete(`${API}/feedback/${fb.id}`).then(fetchData); }} className="absolute top-6 right-6 text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;