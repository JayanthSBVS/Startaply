import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, PlusCircle, Briefcase, Trash2, Edit2,
  X, LogOut, Upload, MessageSquare, Users, Building2,
  Megaphone, Calendar, MapPin, Download, Star, Zap,
  MessageSquareQuote, BookOpen, Search, Eye, Image as ImageIcon,
  BarChart3, ShieldCheck, Activity, TrendingUp, PieChart, Users2,
  Bell, History, Settings, CheckCircle2, AlertCircle, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ThemeToggle from '../components/common/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';

const API = '/api';

const inputCls = "w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-full px-5 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-sm dark:shadow-inner";
const selectCls = "w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-full px-5 py-3.5 text-sm text-slate-900 dark:text-white cursor-pointer focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-sm dark:shadow-inner appearance-none";
const textareaCls = "w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-[1.5rem] px-5 py-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none shadow-sm dark:shadow-inner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isManager } = useAuth();
  
  const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('strataply_token')}` }
  });
  const showMsg = (msg) => { toast.success(msg); };
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Real-time synchronization
  useSocket(() => {
    fetchData();
  });

  const confirmAction = (message, onConfirm) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-2">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">Cancel</button>
          <button onClick={() => { toast.dismiss(t.id); onConfirm(); }} className="px-3 py-1.5 text-xs font-bold bg-rose-500 text-white rounded-md shadow-md">Confirm</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [melas, setMelas] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [prepData, setPrepData] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);

  const [jobForm, setJobForm] = useState({ applyType: 'external', expiryDays: 30, jobCategory: '' });
  const [editingJobId, setEditingJobId] = useState(null);
  const [companyForm, setCompanyForm] = useState({ name: '', industry: '', logo: '' });
  const [melaForm, setMelaForm] = useState({ title: '', date: '', venue: '', time: '', isActive: true, showPopup: true, company: '', registrationLink: '', bannerImage: '', googleMapLink: '' });
  const [testimonialForm, setTestimonialForm] = useState({ name: '', tagline: '', description: '', photo: '' });
  const [prepForm, setPrepForm] = useState({ heading: '', jobType: 'IT Jobs', content: '', contentType: 'article', fileUrl: '', question: '', answer: '' });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('strataply_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [jobsRes, appsRes, compRes, melaRes, fbRes, testRes, prepRes, heroBannersRes, statsRes, logsRes, adminsRes] = await Promise.all([
        axios.get(`${API}/jobs/admin/list`, config).catch(() => ({ data: [] })),
        axios.get(`${API}/jobs/applications/all`, config).catch(() => ({ data: [] })),
        axios.get(`${API}/companies/admin/list`, config).catch(() => ({ data: [] })),
        axios.get(`${API}/job-mela/admin/list`, config).catch(() => ({ data: [] })),
        axios.get(`${API}/feedback`, config).catch(() => ({ data: [] })),
        axios.get(`${API}/testimonials`).catch(() => ({ data: [] })),
        axios.get(`${API}/prep-data/admin/list`, config).catch(() => ({ data: [] })),
        axios.get(`${API}/hero-banners`).catch(() => ({ data: [] })),
        isManager() ? axios.get(`${API}/auth/stats`, config).catch(err => { console.error("Stats Fetch Failed:", err.message); return { data: null }; }) : Promise.resolve({ data: null }),
        isManager() ? axios.get(`${API}/auth/logs`, config).catch(err => { console.error("Logs Fetch Failed:", err.message); return { data: [] }; }) : Promise.resolve({ data: [] }),
        isManager() ? axios.get(`${API}/auth/users`, config).catch(err => { console.error("Admins Fetch Failed:", err.message); return { data: [] }; }) : Promise.resolve({ data: [] })
      ]);

      setJobs(jobsRes.data || []);
      setApplications(appsRes.data || []);
      setCompanies(compRes.data || []);
      setMelas(melaRes.data || []);
      setFeedbacks(fbRes.data || []);
      setPrepData(prepRes.data || []);
      setHeroBanners(heroBannersRes?.data || []);
      
      if (isManager()) {
        console.log("MANAGER SYNC DEBUG:", {
          stats: statsRes.data,
          logs: logsRes.data,
          admins: adminsRes.data
        });
        if (statsRes.data) setGlobalStats(statsRes.data);
        if (logsRes.data) setLogs(logsRes.data);
        if (adminsRes.data) setAdmins(adminsRes.data);
      } else {
        console.log("STANDARD ADMIN SYNC: Manager-only data skipped.");
      }

    } catch (err) {
      console.error("Critical Synchronization Error:", err.response?.status, err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Session Expired or Unauthorized. Please log in again.");
        logout();
        navigate('/admin-login');
      } else {
        toast.error(`Service Unavailable: ${err.message}`);
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('strataply_token');
    if (!token) {
      navigate('/admin-login');
    } else {
      fetchData();
    }
  }, [navigate, user]);

  const handleToggle = (job, field) => {
    const updatedJob = { ...job, [field]: !job[field] };
    setJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j));
    axios.put(`${API}/jobs/${job.id}`, updatedJob, getConfig()).catch(() => {
      setJobs(prev => prev.map(j => j.id === job.id ? job : j));
      toast.error("Database sync failed.");
    });
  };

  const handleJobSubmit = async () => {
    try {
      // Ensure category maps perfectly to DB schema
      const payload = { ...jobForm, category: jobForm.jobCategory };
      if (editingJobId) {
        await axios.put(`${API}/jobs/${editingJobId}`, payload, getConfig());
        showMsg('Job Updated');
      } else {
        await axios.post(`${API}/jobs`, payload, getConfig());
        showMsg('Job Published');
      }
      setJobForm({ applyType: 'external', expiryDays: 30, jobCategory: '' }); setEditingJobId(null); setActiveTab('manage'); fetchData();
    } catch (err) { toast.error('Error saving job data'); }
  };

  const handleJobDelete = async (id) => {
    confirmAction('Permanently delete this job?', async () => {
      await axios.delete(`${API}/jobs/${id}`, getConfig());
      fetchData(); showMsg('Job Removed');
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(isManager() ? [
      { id: 'admins', label: 'Admin Management', icon: ShieldCheck },
      { id: 'logs', label: 'Activity Logs', icon: History },
      { id: 'global_stats', label: 'Global Intelligence', icon: BarChart3 },
    ] : []),
    { id: 'add', label: 'Post Job', icon: PlusCircle },
    { id: 'manage', label: 'Jobs List', icon: Briefcase },
    { id: 'applications', label: 'Applicants', icon: Users },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'jobmela', label: 'Job Mela', icon: Megaphone },
    { id: 'prep', label: 'Preparation', icon: BookOpen },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { id: 'herobanners', label: 'Hero Banners', icon: ImageIcon },
    { id: 'feedback', label: 'Feedbacks', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex text-slate-900 dark:text-white font-sans selection:bg-emerald-500/30 transition-colors duration-300">
      {/* Sidebar */}
      <div className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/50 flex flex-col z-[100] transition-all duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/50 flex justify-between items-center">
          <h2 className="text-xl font-black tracking-tighter">STRATA<span className="text-emerald-500">ADMIN</span></h2>
          <button className="md:hidden text-slate-500 dark:text-slate-500 dark:text-slate-400" onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === item.id ? 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/50 flex flex-col gap-2">
          <ThemeToggle className="w-full flex" />
          <button onClick={() => { logout(); navigate('/admin-login'); }} className="flex items-center gap-3 text-rose-500 dark:text-rose-400 text-sm font-bold w-full p-4 hover:bg-rose-500/10 rounded-2xl transition-colors border border-transparent hover:border-rose-500/20"><LogOut size={18} /> Sign Out</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <header className="bg-white/80 dark:bg-slate-950/50 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50 p-4 md:px-8 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500" onClick={() => setIsMobileMenuOpen(true)}><LayoutDashboard size={24} /></button>
            <h1 className="text-xl font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-emerald-600 uppercase tracking-tighter">{user?.role === 'manager' ? 'Operational Manager' : 'System Admin'}</p>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{user?.name || 'Authorized User'}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-black shadow-inner">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8">

          {activeTab === 'add' && (
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200 dark:border-slate-200 dark:border-slate-800/60 rounded-[2.5rem] p-6 md:p-10 shadow-2xl max-w-5xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

              <h2 className="text-3xl font-black mb-10 border-b border-slate-200 dark:border-slate-800/60 pb-6 text-slate-900 dark:text-white flex items-center gap-4 relative z-10">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400"><PlusCircle size={28} /></div>
                {editingJobId ? 'Edit Performance Listing' : 'Publish New Opportunity'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Job Title *</label><input className={inputCls} value={jobForm.title || ''} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} placeholder="Software Engineer" /></div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">
                    Company {jobForm.jobCategory === 'Government Jobs' ? '(Optional)' : '*'}
                  </label>
                  <input className={inputCls} value={jobForm.company || ''} onChange={e => setJobForm({ ...jobForm, company: e.target.value })} placeholder="Amazon" />
                </div>

                {/* CRITICAL: EXACT CATEGORY MAPPING */}
                <div className="space-y-4 md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Category *</label>
                      <select className={selectCls} value={jobForm.jobCategory || ''} onChange={e => setJobForm({ ...jobForm, jobCategory: e.target.value, govtJobType: '', stateName: '', jobCategoryType: '' })}>
                        <option value="">Select Category</option>
                        <option value="IT & Non-IT Jobs">IT & Non-IT Jobs</option>
                        <option value="Government Jobs">Government Jobs</option>
                        <option value="Private Jobs">Private Jobs</option>
                        <option value="Gig & Services">Gig & Services</option>
                      </select>
                      <div className="absolute right-5 top-[38px] pointer-events-none text-slate-500">▼</div>
                    </div>

                    {jobForm.jobCategory === 'Government Jobs' && (
                      <div className="space-y-2 relative">
                        <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Govt Job Type *</label>
                        <select className={selectCls} value={jobForm.govtJobType || ''} onChange={e => setJobForm({ ...jobForm, govtJobType: e.target.value, stateName: '' })}>
                          <option value="">Select Type</option>
                          <option value="Central">Central Govt Job</option>
                          <option value="State">State Govt Job</option>
                        </select>
                        <div className="absolute right-5 top-[38px] pointer-events-none text-slate-500">▼</div>
                      </div>
                    )}

                    {jobForm.jobCategory === 'Government Jobs' && jobForm.govtJobType === 'State' && (
                      <div className="space-y-2 relative">
                        <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">State Name *</label>
                        <select className={selectCls} value={jobForm.stateName || ''} onChange={e => setJobForm({ ...jobForm, stateName: e.target.value })}>
                          <option value="">Select State</option>
                          {['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="absolute right-5 top-[38px] pointer-events-none text-slate-500">▼</div>
                      </div>
                    )}

                    {jobForm.jobCategory === 'IT & Non-IT Jobs' && (
                      <div className="space-y-2 relative">
                        <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Job Specialization *</label>
                        <select className={selectCls} value={jobForm.jobCategoryType || ''} onChange={e => setJobForm({ ...jobForm, jobCategoryType: e.target.value })}>
                          <option value="">Select Specialization</option>
                          <option value="IT Job">IT Job</option>
                          <option value="Non-IT Job">Non-IT Job</option>
                        </select>
                        <div className="absolute right-5 top-[38px] pointer-events-none text-slate-500">▼</div>
                      </div>
                    )}
                  </div>
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

                {/* FIX: Handle empty string properly for Last Date */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-rose-400 tracking-widest">Last Date (Days to Auto-Hide)</label>
                  <input
                    type="number"
                    min="1"
                    className={inputCls}
                    value={jobForm.expiryDays === null || jobForm.expiryDays === undefined ? '' : jobForm.expiryDays}
                    onChange={e => {
                      const val = e.target.value;
                      setJobForm({ ...jobForm, expiryDays: val === '' ? '' : parseInt(val) });
                    }}
                    placeholder="e.g. 30 (Leave blank for no auto-hide)"
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
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
              {/* Intelligent Overview for Managers */}
              {isManager() && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Primary Activity Heatmap */}
                  <div className="lg:col-span-2 bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group border border-slate-800">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform"><TrendingUp size={120} /></div>
                    <div className="flex justify-between items-center mb-10 relative z-10">
                      <div>
                        <h3 className="text-xl font-black uppercase tracking-widest text-emerald-500">Operational Pulse</h3>
                        <p className="text-xs text-slate-400 font-bold mt-1">Cross-platform contribution summary</p>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl flex items-center gap-3">
                        <Activity size={16} className="text-emerald-500" />
                        <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Live Syncing</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                      {[
                        { label: 'Today Jobs', val: globalStats?.todayJobs || 0, color: 'text-white' },
                        { label: 'Today Prep', val: globalStats?.todayPrep || 0, color: 'text-blue-400' },
                        { label: 'Today Mela', val: globalStats?.todayMela || 0, color: 'text-amber-400' },
                        { label: 'Total Syncs', val: globalStats?.totalToday || 0, color: 'text-emerald-400' }
                      ].map((s, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                          <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Admin Health */}
                  <div className="bg-white dark:bg-slate-900/40 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800/60 shadow-2xl">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2"><Users size={16} /> Team Status</h3>
                    <div className="space-y-4">
                      {admins.slice(0, 4).map(admin => (
                        <div key={admin.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/40">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${admin.isactive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>{admin.name?.charAt(0)}</div>
                            <div>
                               <p className="text-xs font-black truncate max-w-[100px]">{admin.name}</p>
                               <p className="text-[10px] font-bold text-slate-500">{(globalStats?.adminProductivity?.find(p => p.id === admin.id)?.today_total || 0)} posts today</p>
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${admin.isactive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Standard Admin Stats or Secondary Manager Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Active Jobs', val: jobs.length, icon: Briefcase, col: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Total Applicants', val: applications.length, icon: Users, col: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'Partner Network', val: companies.length, icon: Building2, col: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { label: 'Job Melas', val: melas.length, icon: Megaphone, col: 'text-amber-400', bg: 'bg-amber-500/10' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 p-6 rounded-[2rem] shadow-xl hover:border-slate-300 dark:hover:border-slate-700/80 transition-all group overflow-hidden relative">
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                        <h4 className="text-4xl font-black">{stat.val}</h4>
                      </div>
                      <div className={`p-3 rounded-2xl ${stat.bg} ${stat.col} border border-white/5`}>
                        <stat.icon size={24} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* OperationalPulse removed generic shortcuts/insights as per request */}
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black tracking-tight">Active Listings <span className="text-slate-500 text-base font-medium ml-2">{jobs.length} total</span></h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-full pl-10 pr-5 py-2.5 text-xs font-bold outline-none focus:border-emerald-500 transition-all w-64 text-slate-900 dark:text-white" placeholder="Search jobs name or company..." />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {jobs.map(job => (
                  <div key={job.id} className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 p-5 rounded-3xl shadow-sm dark:shadow-lg hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-xl font-black text-emerald-500 group-hover:scale-110 transition-transform">{job.company?.charAt(0)}</div>
                      <div>
                        <h4 className="font-black text-lg leading-tight">{job.title}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2 mt-1">
                          <Building2 size={14} /> {job.company} • <MapPin size={14} /> {job.location}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${job.createdbyadminid === 'manager_principal' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                            {job.createdbyadminid === 'manager_principal' ? 'MASTER ACCOUNT' : `ADMIN: ${job.createdbyadminid?.split('_')[1] || 'IDENTITY'}`}
                          </span>
                          {job.isToday && <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">NEW TODAY</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <div className="hidden lg:flex gap-4 border-r border-slate-200 dark:border-slate-800/80 pr-6 mr-4">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Views</span>
                          <div className="flex items-center gap-1.5 font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                            <Eye size={12} /> {job.views || 0}
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Applied</span>
                          <div className="flex items-center gap-1.5 font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            <Users size={12} /> {job.applicationCount || 0}
                          </div>
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

                      <div className="flex gap-2 border-l border-slate-200 dark:border-slate-800/80 pl-6">
                        <button onClick={() => { setJobForm({ ...job, jobCategory: job.category }); setEditingJobId(job.id); setActiveTab('add'); }} className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"><Edit2 size={18} /></button>
                        <button onClick={() => handleJobDelete(job.id)} className="p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-colors"><Trash2 size={18} /></button>
                      </div>
                      </div>
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-800">
                    <Briefcase size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-bold">No jobs posted yet. Get started by publishing a new one!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="animate-in fade-in slide-in-from-bottom-5">

              {/* Scalable Applicant Data Manager */}
              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 rounded-[2.5rem] overflow-hidden shadow-sm dark:shadow-2xl">

                {/* Table Header & Controls */}
                <div className="p-8 border-b border-slate-200 dark:border-slate-800/60">
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
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-full pl-12 pr-5 py-3.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-inner"
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
                      <tr className="bg-slate-50 dark:bg-slate-950/50 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black border-b border-slate-800">
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
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-base">{app.name}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="font-bold text-emerald-400">{app.jobTitle || 'General Application'}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-black tracking-widest uppercase mt-1">
                              {app.companyName || 'Strataply Platform'}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{app.email}</div>
                            <div className="text-xs text-slate-500 font-bold mt-1">{app.phone || 'No Phone Provided'}</div>
                          </td>
                          <td className="px-8 py-6 text-center text-sm text-slate-500 dark:text-slate-400 font-bold">
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
                                onClick={() => {
                                  confirmAction('Permanently delete this applicant record?', async () => {
                                    await axios.delete(`${API}/jobs/applications/${app.id}`, getConfig());
                                    fetchData();
                                    showMsg('Application Deleted');
                                  });
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
                <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 p-8 rounded-[2.5rem] sticky top-24">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-3"><Building2 className="text-purple-400" /> New Company</h3>
                  <div className="space-y-4">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Name</label><input className={inputCls} placeholder="Company Name" value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Industry</label><input className={inputCls} placeholder="e.g. Technology" value={companyForm.industry} onChange={e => setCompanyForm({ ...companyForm, industry: e.target.value })} /></div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Company Logo</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="w-full border border-slate-700/50 rounded-xl px-4 py-3 font-medium text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer" 
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setCompanyForm({ ...companyForm, logo: ev.target.result });
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                      {companyForm.logo && <img src={companyForm.logo} alt="Preview" className="w-16 h-16 object-contain mt-2 bg-white/5 rounded-xl border border-slate-700 p-2" />}
                    </div>
                    <button onClick={async () => { await axios.post(`${API}/companies`, companyForm, getConfig()); setCompanyForm({ name: '', industry: '', logo: '' }); fetchData(); showMsg('Company added'); }} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-full mt-4 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">Add Partner</button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map(comp => (
                  <div key={comp.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 p-6 rounded-[2rem] flex items-center justify-between group overflow-hidden relative">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden">{comp.logo ? <img src={comp.logo} alt={comp.name} className="w-full h-full object-contain" /> : <Building2 className="text-slate-600" />}</div>
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-slate-200">{comp.name}</div>
                        <div className="text-[10px] font-black text-slate-500 tracking-widest uppercase">{comp.industry}</div>
                      </div>
                    </div>
                    <button onClick={() => confirmAction('Delete company?', async () => { await axios.delete(`${API}/companies/${comp.id}`, getConfig()); fetchData(); showMsg('Removed'); })} className="p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl text-rose-500 transition-colors opacity-0 group-hover:opacity-100 relative z-10"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'jobmela' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 max-w-4xl mx-auto space-y-8">
              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 rounded-[2.5rem] p-10">
                <h3 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-900 dark:text-white"><Megaphone className="text-amber-400" /> Job Mela Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Mela Title</label><input className={inputCls} value={melaForm.title} onChange={e => setMelaForm({ ...melaForm, title: e.target.value })} placeholder="Career Mega Fair 2024" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Target Date</label><input type="date" className={inputCls} value={melaForm.date} onChange={e => setMelaForm({ ...melaForm, date: e.target.value })} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Organising Company</label><input className={inputCls} value={melaForm.company || ''} onChange={e => setMelaForm({ ...melaForm, company: e.target.value })} placeholder="e.g. TCS, Infosys" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Timing</label><input className={inputCls} value={melaForm.time} onChange={e => setMelaForm({ ...melaForm, time: e.target.value })} placeholder="10:00 AM - 4:00 PM" /></div>
                  <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Venue / Location (Text)</label><input className={inputCls} value={melaForm.venue} onChange={e => setMelaForm({ ...melaForm, venue: e.target.value })} placeholder="Online / Hyderabad Convention Centre" /></div>

                  {/* Banner Image */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">🖼️ Banner Image Upload</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 font-medium text-slate-900 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-500/10 file:text-emerald-500 dark:file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer" 
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setMelaForm({ ...melaForm, bannerImage: ev.target.result });
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                    {melaForm.bannerImage && (
                      <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-200 dark:border-slate-700/50 h-40 w-fit">
                        <img src={melaForm.bannerImage} alt="Banner Preview" className="h-full object-contain" onError={e => e.target.style.display='none'} />
                      </div>
                    )}
                  </div>

                  {/* Google Map Link */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest">📍 Google Maps Embed Link</label>
                    <input className={inputCls} value={melaForm.googleMapLink || ''} onChange={e => setMelaForm({ ...melaForm, googleMapLink: e.target.value })} placeholder="https://www.google.com/maps/embed?pb=..." />
                    <p className="text-[10px] text-slate-500 font-bold pl-2">Go to Google Maps → Share → Embed a map → Copy the src URL from the iframe code</p>
                  </div>

                  <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">External Registration Link</label><input className={inputCls} value={melaForm.registrationLink} onChange={e => setMelaForm({ ...melaForm, registrationLink: e.target.value })} placeholder="https://forms.gle/..." /></div>

                  <div className="flex gap-10 bg-slate-950/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 md:col-span-2">
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
                <button onClick={async () => { await axios.post(`${API}/job-mela`, melaForm, getConfig()); setMelaForm({ title: '', date: '', venue: '', time: '', isActive: true, showPopup: true, company: '', registrationLink: '', bannerImage: '', googleMapLink: '' }); fetchData(); showMsg('Mela Created Successfully'); }} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-5 rounded-full mt-10 transition-all shadow-xl shadow-amber-500/10">🚀 Publish Job Mela</button>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-black flex items-center gap-2 px-4 text-slate-900 dark:text-white"><Zap size={20} className="text-amber-400" /> All Job Melas</h4>
                {melas.map(m => (
                  <div key={m.id} className="bg-white dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {(m.bannerimage || m.bannerImage) && (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 flex-shrink-0">
                          <img src={m.bannerimage || m.bannerImage} alt={m.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 dark:text-slate-200 truncate">{m.title}</div>
                        <div className="text-xs text-slate-500 font-bold mt-1">{m.date} • {m.venue}</div>
                        {(m.googlemaplink || m.googleMapLink) && <div className="text-[10px] text-blue-400 font-bold mt-0.5">📍 Map link added</div>}
                      </div>
                    </div>
                    <button onClick={() => confirmAction('Delete mela?', async () => { await axios.delete(`${API}/job-mela/${m.id}`, getConfig()); fetchData(); showMsg('Removed'); })} className="p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl text-rose-500 transition-colors flex-shrink-0"><Trash2 size={18} /></button>
                  </div>
                ))}
                {melas.length === 0 && (
                  <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-800">
                    <Megaphone size={40} className="mx-auto text-slate-700 mb-3" />
                    <p className="text-slate-500 font-bold text-sm">No Job Melas yet. Create one above!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'prep' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 max-w-3xl mx-auto space-y-8">

              {/* Add Form */}
              <div className="bg-white dark:bg-slate-900/40 p-6 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/60 shadow-2xl">
                <h3 className="text-xl md:text-2xl font-black mb-8 flex items-center gap-4 text-emerald-400"><BookOpen size={28} /> New Preparation Content</h3>
                <div className="space-y-5">

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Target Category</label>
                    <div className="relative">
                      <select className={selectCls} value={prepForm.jobType} onChange={e => setPrepForm({ ...prepForm, jobType: e.target.value })}>
                        <option>IT Jobs</option><option>Non-IT Jobs</option><option>Government Jobs</option>
                      </select>
                      <div className="absolute right-5 top-[14px] pointer-events-none text-slate-500">▼</div>
                    </div>
                  </div>

                  {/* Content Type */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Content Type</label>
                    <div className="flex flex-wrap gap-2">
                      {[{ val: 'article', label: '📝 Article / Tips' }, { val: 'qna', label: '❓ Q&A' }, { val: 'paper', label: '📄 Previous Year Paper' }].map(opt => (
                        <button key={opt.val} onClick={() => setPrepForm({ ...prepForm, contentType: opt.val })}
                          className={`px-4 py-2 rounded-full text-xs font-black border transition-all ${
                            prepForm.contentType === opt.val
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                              : 'bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-slate-500'
                          }`}>{opt.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Article Fields */}
                  {prepForm.contentType === 'article' && (
                    <>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Title / Topic</label><input className={inputCls} placeholder="e.g. React Interview Basics" value={prepForm.heading} onChange={e => setPrepForm({ ...prepForm, heading: e.target.value })} /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Content / Body</label><textarea rows="8" className={textareaCls} placeholder="Write tips, guides, key points..." value={prepForm.content} onChange={e => setPrepForm({ ...prepForm, content: e.target.value })}></textarea></div>
                    </>
                  )}

                  {/* Q&A Fields */}
                  {prepForm.contentType === 'qna' && (
                    <>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest pl-1">Question</label><input className={inputCls} placeholder="e.g. What is polymorphism?" value={prepForm.question} onChange={e => setPrepForm({ ...prepForm, question: e.target.value, heading: e.target.value })} /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Answer</label><textarea rows="6" className={textareaCls} placeholder="Detailed answer..." value={prepForm.answer} onChange={e => setPrepForm({ ...prepForm, answer: e.target.value, content: e.target.value })}></textarea></div>
                    </>
                  )}

                  {/* Paper Fields */}
                  {prepForm.contentType === 'paper' && (
                    <>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-amber-500 tracking-widest pl-1">Paper Title</label><input className={inputCls} placeholder="e.g. UPSC Prelims 2023 GS Paper" value={prepForm.heading} onChange={e => setPrepForm({ ...prepForm, heading: e.target.value })} /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-amber-500 tracking-widest pl-1">PDF / Download URL</label><input className={inputCls} placeholder="https://drive.google.com/..." value={prepForm.fileUrl} onChange={e => setPrepForm({ ...prepForm, fileUrl: e.target.value })} /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Description (optional)</label><textarea rows="3" className={textareaCls} placeholder="e.g. 100 questions, 2 hours, GS Paper I" value={prepForm.content} onChange={e => setPrepForm({ ...prepForm, content: e.target.value })}></textarea></div>
                    </>
                  )}

                   <button
                    onClick={async () => {
                      await axios.post(`${API}/prep-data`, prepForm, getConfig());
                      setPrepForm({ heading: '', jobType: 'IT Jobs', content: '', contentType: 'article', fileUrl: '', question: '', answer: '' });
                      fetchData();
                      showMsg('Prep Material Published');
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-5 rounded-full shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >Publish to Prep Page</button>
                </div>
              </div>

              {/* Existing Items List */}
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase text-slate-500 tracking-[0.2em] px-2 flex items-center justify-between">
                  Existing Materials
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-lg text-[10px]">{prepData.length} Items</span>
                </h4>
                {prepData.map(item => (
                  <div key={item.id} className="bg-white dark:bg-slate-900/40 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800/80">
                    <div className="flex justify-between items-start mb-3 gap-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700/50">{item.jobtype || item.jobType}</span>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                          (item.contenttype || item.contentType) === 'qna' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          (item.contenttype || item.contentType) === 'paper' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                        }`}>{(item.contenttype || item.contentType) === 'qna' ? '❓ Q&A' : (item.contenttype || item.contentType) === 'paper' ? '📄 Paper' : '📝 Article'}</span>
                      </div>
                      <button
                        onClick={() => confirmAction('Delete material?', async () => { await axios.delete(`${API}/prep-data/${item.id}`, getConfig()); fetchData(); showMsg('Removed'); })}
                        className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-colors flex-shrink-0"
                      ><Trash2 size={16} /></button>
                    </div>
                    <h5 className="font-extrabold text-slate-900 dark:text-slate-100 mb-1 text-sm md:text-base">{item.heading}</h5>
                    {(item.contenttype || item.contentType) === 'paper' && (item.fileurl || item.fileUrl) && (
                      <a href={item.fileurl || item.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-amber-400 font-bold mt-1 hover:text-amber-300">📥 Download Link</a>
                    )}
                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 font-medium mt-1">{item.content}</p>
                  </div>
                ))}
                {prepData.length === 0 && (
                  <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-800">
                    <BookOpen size={40} className="mx-auto text-slate-400 dark:text-slate-700 mb-3" />
                    <p className="text-slate-500 font-bold text-sm">No prep materials yet. Add your first one above!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/60 sticky top-24 shadow-2xl">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-purple-400"><Star size={24} /> Add Testimonial</h3>
                  <div className="space-y-4">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Full Name</label><input className={inputCls} value={testimonialForm.name} onChange={e => setTestimonialForm({ ...testimonialForm, name: e.target.value })} placeholder="John Doe" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Tagline / Role</label><input className={inputCls} value={testimonialForm.tagline} onChange={e => setTestimonialForm({ ...testimonialForm, tagline: e.target.value })} placeholder="Senior Developer" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Review</label><textarea rows="4" className={textareaCls} value={testimonialForm.description} onChange={e => setTestimonialForm({ ...testimonialForm, description: e.target.value })} placeholder="Their success story..."></textarea></div>
                    <button onClick={async () => { await axios.post(`${API}/testimonials`, testimonialForm, getConfig()); setTestimonialForm({ name: '', tagline: '', description: '', photo: '' }); fetchData(); showMsg('Testimonial added'); }} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-full mt-4 transition-all shadow-lg shadow-emerald-500/20">Publish Review</button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 flex flex-col gap-3">
                {testimonials.map(t => (
                  <div key={t.id} className="bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 group relative overflow-hidden flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center font-black text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 shrink-0">{t.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-200">{t.name}</span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.tagline}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs font-medium truncate mt-0.5">"{t.description}"</p>
                      </div>
                    </div>
                    <button onClick={() => confirmAction('Delete testimonial?', async () => { await axios.delete(`${API}/testimonials/${t.id}`, getConfig()); fetchData(); showMsg('Removed'); })} className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-4"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="animate-in fade-in slide-in-from-bottom-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbacks.map(fb => (
                  <div key={fb.id} className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 p-8 rounded-[2.5rem] relative group hover:border-blue-500/50 transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20"><MessageSquare size={24} /></div>
                      <button onClick={async () => { if (window.confirm('Delete feedback?')) { await axios.delete(`${API}/feedback/${fb.id}`, getConfig()); fetchData(); showMsg('Feedback Removed'); } }} className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                    </div>
                    <p className="text-slate-900 dark:text-slate-200 font-medium leading-relaxed mb-6">"{fb.message}"</p>
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
          {activeTab === 'herobanners' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 max-w-4xl mx-auto space-y-8">
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-[2.5rem] p-8 shadow-2xl">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-blue-500"><ImageIcon size={24} /> Upload Hero Banner</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Select Image File</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 font-medium text-slate-900 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-500/10 file:text-blue-500 dark:file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer shadow-inner" 
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = async (ev) => {
                            try {
                              showMsg('Uploading banner...');
                              await axios.post(`${API}/hero-banners`, { image: ev.target.result }, getConfig());
                              fetchData();
                              showMsg('Banner Published Successfully');
                            } catch (err) {
                              toast.error('Failed to upload banner');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Supported formats: JPG, PNG, WEBP (Max 50MB). Best resolution: 1920x1080.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-sm font-black uppercase text-slate-500 tracking-[0.2em] px-2 flex items-center justify-between">
                  Active Banners
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500 dark:text-slate-400 px-3 py-1 rounded-lg text-[10px]">{heroBanners.length} Items</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {heroBanners.map((banner, index) => (
                    <div key={banner.id} className="relative group rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/60 shadow-sm aspect-video bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                       <img src={banner.image} alt={`Hero ${index}`} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                         <button onClick={() => confirmAction('Delete this banner?', async () => { await axios.delete(`${API}/hero-banners/${banner.id}`, getConfig()); fetchData(); showMsg('Banner Removed'); })} className="px-6 py-3 bg-rose-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                           <Trash2 size={18} /> Delete Banner
                         </button>
                       </div>
                    </div>
                  ))}
                  {heroBanners.length === 0 && (
                    <div className="md:col-span-2 text-center py-16 bg-slate-50 dark:bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                      <ImageIcon size={40} className="mx-auto text-slate-500 dark:text-slate-400 mb-3" />
                      <p className="text-slate-500 font-bold text-sm">No banners uploaded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          {isManager() && activeTab === 'logs' && (
            <div className="animate-in fade-in slide-in-from-bottom-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight flex items-center gap-4 text-slate-900 dark:text-white">
                      <Activity className="text-cyan-500 animate-pulse" /> Operational Pulse
                    </h2>
                    <p className="text-slate-500 font-extrabold uppercase text-[10px] tracking-widest mt-1 pl-11">Real-time administrative audit trail</p>
                  </div>
                  <button onClick={fetchData} className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full font-black text-xs hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
                    <History size={16} /> Sync Trail
                  </button>
                </div>
                
                <div className="p-8">
                  <div className="space-y-6">
                    {logs.map((log, idx) => {
                      const moduleColors = {
                        'Jobs': 'bg-sky-500/10 text-sky-500 border-sky-500/20',
                        'Companies': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
                        'Auth': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                        'Feedback': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
                        'Preparation': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                        'Job Mela': 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      };
                      const colorClass = moduleColors[log.module] || 'bg-slate-500/10 text-slate-500 border-slate-500/20';
                      
                      return (
                        <div key={idx} className="flex gap-6 group">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${colorClass} font-black text-sm shadow-sm group-hover:scale-110 transition-transform`}>
                              {log.module?.charAt(0)}
                            </div>
                            <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mt-2" />
                          </div>
                          <div className="flex-1 pb-10">
                            <div className="bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800/60 p-6 rounded-[2rem] hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${colorClass}`}>
                                    {log.module}
                                  </span>
                                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">
                                    • {new Date(parseInt(log.timestamp)).toLocaleString()}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">#IDX-{log.id}</span>
                              </div>
                              
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
                                {log.action}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${log.role === 'manager' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
                                    {log.username?.charAt(0)}
                                  </div>
                                  <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tight">
                                    {log.username} <span className="text-slate-400 dark:text-slate-600 font-bold lowercase">({log.role})</span>
                                  </span>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                                  ID: <span className="font-mono">{log.targetid || 'N/A'}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {logs.length === 0 && (
                      <div className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs italic">
                        No activity logs recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isManager() && activeTab === 'admins' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 p-8 rounded-[2.5rem] sticky top-24 shadow-2xl">
                  <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-emerald-400"><Users2 size={28} /> Deploy Admin</h2>
                  <div className="space-y-4">
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Full Name</label><input id="newAdminName" className={inputCls} placeholder="Admin Name" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Email Address</label><input id="newAdminEmail" className={inputCls} placeholder="admin@strataply.com" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Temporary Password</label><input id="newAdminPassword" type="password" className={inputCls} placeholder="••••••••" /></div>
                     <button onClick={async () => {
                       const name = document.getElementById('newAdminName').value;
                       const email = document.getElementById('newAdminEmail').value;
                       const password = document.getElementById('newAdminPassword').value;
                       if(!name || !email || !password) return toast.error("All fields required");
                       try {
                         await axios.post(`${API}/auth/register`, { name, email, password }, getConfig());
                         toast.success("Admin Authorized");
                         fetchData();
                       } catch(e) { toast.error(e.response?.data?.error || "Creation failed"); }
                     }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-full mt-6 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">Authorize Access</button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-sm font-black uppercase text-slate-500 tracking-widest px-4">Administrative Team</h2>
                <div className="grid grid-cols-1 gap-4">
                  {admins.map(admin => (
                    <div key={admin.id} className="bg-white dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800/80 flex items-center justify-between group">
                       <div className="flex items-center gap-5">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border ${admin.isactive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-500/10 border-slate-500/20 text-slate-500'}`}>
                           {admin.name?.charAt(0) || '?'}
                         </div>
                         <div>
                            <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              {admin.name} {admin.role === 'manager' && <ShieldCheck size={14} className="text-emerald-500" />}
                            </div>
                            <div className="text-xs text-slate-500 font-bold">{admin.email} • {admin.role?.toUpperCase() || 'ADMIN'}</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-4">
                          {admin.role !== 'manager' && (
                            <>
                              <button onClick={async () => {
                                await axios.put(`${API}/auth/users/${admin.id}/toggle`, { isActive: !admin.isactive }, getConfig());
                                fetchData();
                                toast.success("Status Updated");
                              }} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${admin.isactive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-rose-500/10 text-rose-500 border-rose-500/30'}`}>
                                {admin.isactive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button onClick={() => confirmAction('Revoke access?', async () => {
                                await axios.delete(`${API}/auth/users/${admin.id}`, getConfig());
                                fetchData();
                                toast.success("Access Revoked");
                              })} className="p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                            </>
                          )}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isManager() && activeTab === 'global_stats' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Jobs', value: globalStats?.totalJobs || 0, icon: Briefcase, color: 'text-emerald-400' },
                  { label: 'Applicants', value: globalStats?.totalApplications || 0, icon: Users2, color: 'text-blue-400' },
                  { label: 'Partners', value: globalStats?.totalCompanies || 0, icon: Building2, color: 'text-purple-400' },
                  { label: 'Admins', value: globalStats?.totalAdmins || 0, icon: ShieldCheck, color: 'text-amber-400' },
                ].map((s, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform ${s.color}`}><s.icon size={80} /></div>
                    <div className="flex flex-col gap-1 relative z-10">
                      <p className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em]">{s.label}</p>
                      <div className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-[3rem] shadow-2xl overflow-hidden">
                <div className="p-10 border-b border-slate-200 dark:border-slate-800/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h3 className="text-2xl font-black flex items-center gap-4">
                      <TrendingUp className="text-emerald-400" /> Admin Performance Ledger
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Real-time contribution audit</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex gap-10">
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase text-slate-500">Team Today</p>
                      <p className="text-lg font-black text-emerald-500">
                        {(globalStats?.adminProductivity?.reduce((acc, p) => acc + (parseInt(p.job_count_today) || 0) + (parseInt(p.prep_count_today) || 0), 0)) || 0}
                      </p>
                    </div>
                    <div className="text-center border-l dark:border-slate-800 pl-10">
                      <p className="text-[10px] font-black uppercase text-slate-500">Team Lifetime</p>
                      <p className="text-lg font-black text-blue-500">
                        {globalStats?.adminProductivity?.reduce((acc, p) => acc + (parseInt(p.lifetime_total) || 0), 0) || 0}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800/80">
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Admin Entity</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Today's Session</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Daily Output</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Lifetime Power</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Join Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                      {globalStats?.adminProductivity?.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center font-black text-emerald-500 border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform">
                                {p.adminname?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-slate-100">{p.adminname}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{p.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                <span className="text-emerald-400">IN:</span> {p.lastlogin ? new Date(parseInt(p.lastlogin)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                              </div>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <span className="text-rose-400">OUT:</span> {p.lastlogout ? new Date(parseInt(p.lastlogout)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-3">
                               <div className="text-2xl font-black text-emerald-500">{p.today_total || 0}</div>
                               <div className="text-[10px] font-black text-slate-500 uppercase leading-none border-l border-slate-700/50 pl-2">
                                 {p.job_count_today || 0} Jobs<br />
                                 {p.prep_count_today || 0} Prep
                               </div>
                             </div>
                          </td>
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-4">
                               <div className="flex-1 max-w-[120px]">
                                 <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-1">
                                   <span>{p.lifetime_total || 0} Total</span>
                                   <span>{Math.round((parseInt(p.lifetime_total) / Math.max(1, ...globalStats.adminProductivity.map(x=>parseInt(x.lifetime_total)))) * 100)}%</span>
                                 </div>
                                 <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                                   <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${(p.lifetime_total / Math.max(1, ...globalStats.adminProductivity.map(x=>x.lifetime_total))) * 100}%` }} />
                                 </div>
                               </div>
                             </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <p className="text-xs font-bold text-slate-500">{p.createdat ? new Date(parseInt(p.createdat)).toLocaleDateString() : 'Original'}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!globalStats?.adminProductivity?.length) && <div className="py-20 text-center text-slate-500 font-black uppercase text-xs tracking-[0.3em]">No operational data available</div>}
                </div>

                {/* 14-Day Historical Performance Audit */}
                <div className="mt-10 p-10 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                      <History size={20} className="text-blue-500" />
                      14-Day Performance Audit
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      {globalStats?.adminProductivity?.map(admin => (
                        <div key={admin.id} className="bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem]">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">{admin.adminname}'s Daily Output (Jobs)</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {admin.historical_jobs ? admin.historical_jobs.map((h, i) => (
                               <div key={i} className="flex flex-col items-center bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-xl min-w-[60px]">
                                 <span className="text-[9px] font-black text-slate-500">{h.date.split('-').slice(1).join('/')}</span>
                                 <span className="text-sm font-black text-blue-500">{h.count}</span>
                               </div>
                             )) : (
                               <span className="text-xs font-bold text-slate-600 italic">No historical data available for the last 14 days.</span>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;