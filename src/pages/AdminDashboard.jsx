import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, PlusCircle, Briefcase, Trash2, Edit2,
  X, LogOut, Upload, MessageSquare, Users, Building2,
  Megaphone, Calendar, MapPin, Download, Star, Zap,
  MessageSquareQuote, BookOpen, Search, Eye, Image as ImageIcon,
  BarChart3, ShieldCheck, Activity, TrendingUp, PieChart, Users2,
  Bell, History, Settings, CheckCircle2, AlertCircle, FileText, RefreshCw,
  Lock, Unlock, UserPlus, Phone, Mail, Sliders, Crown, BadgeCheck, UserCheck
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

// Role presentation helpers
const ROLE_CONFIG = {
  manager:              { label: 'Manager',              color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  icon: Crown },
  operational_manager:  { label: 'Op. Manager',          color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: BadgeCheck },
  executive:            { label: 'Exec.',                color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: UserCheck },
  admin:                { label: 'Exec.',                color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: UserCheck },
};
const getRoleConfig  = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.executive;
const getRoleLabel   = (role) => getRoleConfig(role).label;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isManager, isOpManager, isExecutive, canDo, permissions, refreshPermissions } = useAuth();
  
  const getConfig = () => {
    const token = localStorage.getItem('strataply_token');
    // Guard: never send Authorization header with null/undefined token (avoids 401 spam)
    if (!token || token === 'null' || token === 'undefined') return null;
    return { headers: { Authorization: `Bearer ${token}` } };
  };
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
  const [dashboardSummary, setDashboardSummary] = useState(null);

  const [jobForm, setJobForm] = useState({ applyType: 'external', expiryDays: 30, jobCategory: '', govtDept: '' });
  const [editingJobId, setEditingJobId] = useState(null);
  const [companyForm, setCompanyForm] = useState({ name: '', industry: '', logo: '', companyType: '' });
  const [melaForm, setMelaForm] = useState({ title: '', date: '', venue: '', time: '', isActive: true, showPopup: true, company: '', registrationLink: '', bannerImage: '', googleMapLink: '' });
  const [testimonialForm, setTestimonialForm] = useState({ name: '', tagline: '', description: '', photo: '' });
  const [prepForm, setPrepForm] = useState({ heading: '', jobType: 'IT Jobs', content: '', contentType: 'article', fileUrl: '', question: '', answer: '' });

  // Team Management state
  const [teamForm, setTeamForm] = useState({ name: '', email: '', password: '', role: 'executive', department: '', mobile: '', joinedAt: '' });
  const [showTeamModal, setShowTeamModal] = useState(false);

  // Role Permissions state — keyed by role name
  const [permForm, setPermForm] = useState({});
  const [permSaving, setPermSaving] = useState({});

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('strataply_token');
    if (!token || token === 'null' || token === 'undefined') {
      navigate('/admin-login');
      return;
    }
    
    const storedUser = JSON.parse(localStorage.getItem('strataply_user') || '{}');
    const currentIsManager = storedUser?.role === 'manager' || storedUser?.email === 'manager@strataply.com';
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const safeGet = async (url, cfg, fallback = []) => {
      try {
        const res = await axios.get(url, cfg);
        return res;
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          toast.error('Session expired. Please log in again.');
          logout();
          navigate('/admin-login');
          throw err;
        }
        return { data: fallback };
      }
    };
    
    try {
      if (activeTab === 'dashboard') {
        const summaryRes = await safeGet(`${API}/auth/dashboard-summary`, config, null);
        if (summaryRes?.data) setDashboardSummary(summaryRes.data);
        
        if (currentIsManager) {
          const [statsRes, logsRes, adminsRes] = await Promise.all([
            safeGet(`${API}/auth/stats`, config, null),
            safeGet(`${API}/auth/logs`, config),
            safeGet(`${API}/auth/users`, config),
          ]);
          if (statsRes?.data) setGlobalStats(prev => ({...prev, ...statsRes.data, totalToday: statsRes.data.totalToday || (parseInt(statsRes.data.todayJobs || 0) + parseInt(statsRes.data.todayPrep || 0) + parseInt(statsRes.data.todayMela || 0))}));
          if (logsRes?.data) setLogs(prev => JSON.stringify(prev) === JSON.stringify(logsRes.data) ? prev : (Array.isArray(logsRes.data) ? logsRes.data : []));
          if (adminsRes?.data) setAdmins(Array.isArray(adminsRes.data) ? adminsRes.data : []);
        }
      } else if (activeTab === 'manage' || activeTab === 'add') {
        const res = await safeGet(`${API}/jobs/admin/list`, config);
        setJobs(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'applications') {
        const res = await safeGet(`${API}/jobs/applications/all`, config);
        setApplications(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'companies') {
        const res = await safeGet(`${API}/companies/admin/list`, config);
        setCompanies(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'jobmela') {
        const res = await safeGet(`${API}/job-mela/admin/list`, config);
        setMelas(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'prep') {
        const res = await safeGet(`${API}/prep-data/admin/list`, config);
        setPrepData(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'testimonials') {
        const res = await safeGet(`${API}/testimonials/admin/list`, config);
        setTestimonials(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'feedback') {
        const res = await safeGet(`${API}/feedback`, config);
        setFeedbacks(Array.isArray(res.data) ? res.data : []);
      } else if (['team', 'permissions', 'logs', 'global_stats', 'herobanners'].includes(activeTab)) {
        if (currentIsManager) {
          const [statsRes, logsRes, adminsRes, heroRes] = await Promise.all([
            safeGet(`${API}/auth/stats`, config, null),
            safeGet(`${API}/auth/logs`, config),
            safeGet(`${API}/auth/users`, config),
            activeTab === 'herobanners' ? safeGet(`${API}/hero-banners`, config).catch(() => ({ data: [] })) : Promise.resolve(null)
          ]);
          if (statsRes?.data) setGlobalStats(prev => ({...prev, ...statsRes.data, totalToday: statsRes.data.totalToday || (parseInt(statsRes.data.todayJobs || 0) + parseInt(statsRes.data.todayPrep || 0) + parseInt(statsRes.data.todayMela || 0))}));
          if (logsRes?.data) setLogs(prev => JSON.stringify(prev) === JSON.stringify(logsRes.data) ? prev : (Array.isArray(logsRes.data) ? logsRes.data : []));
          if (adminsRes?.data) setAdmins(Array.isArray(adminsRes.data) ? adminsRes.data : []);
          if (heroRes?.data) setHeroBanners(Array.isArray(heroRes.data) ? heroRes.data : []);
        }
      }
    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.error('[Dashboard fetch error]', err.message);
      }
    }
  }, [activeTab, navigate, logout]);

  useEffect(() => {
    const token = localStorage.getItem('strataply_token');
    if (!token || token === 'null' || token === 'undefined') {
      navigate('/admin-login');
      return;
    }
    fetchData();

    // Fallback polling every 45s — optimized for activeTab targeted fetching
    const pollInterval = setInterval(() => {
      fetchData();
    }, 45000);

    return () => clearInterval(pollInterval);
  }, [fetchData, navigate]);

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
      setJobForm({ applyType: 'external', expiryDays: 30, jobCategory: '', govtDept: '' }); setEditingJobId(null); setActiveTab('manage'); fetchData();
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
      { id: 'team',        label: 'Team Management', icon: Users2 },
      { id: 'permissions', label: 'Role Permissions', icon: Sliders },
      { id: 'logs',        label: 'Activity Logs',   icon: History },
      { id: 'global_stats', label: 'Global Intelligence', icon: BarChart3 },
      { id: 'herobanners', label: 'Hero Banners',    icon: ImageIcon },
    ] : []),
    { id: 'add',          label: 'Post Job',     icon: PlusCircle },
    { id: 'manage',       label: 'Jobs List',    icon: Briefcase },
    { id: 'applications', label: 'Applicants',   icon: Users },
    { id: 'companies',    label: 'Companies',    icon: Building2 },
    { id: 'jobmela',      label: 'Job Mela',     icon: Megaphone },
    { id: 'prep',         label: 'Preparation',  icon: BookOpen },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { id: 'feedback',     label: 'Feedbacks',    icon: MessageSquare },
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
              <p className="text-xs font-black text-emerald-600 uppercase tracking-tighter">{getRoleLabel(user?.role)}</p>
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
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Company Logo (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="w-full border border-slate-700/50 rounded-xl px-4 py-3 font-medium text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer" 
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setJobForm({ ...jobForm, companyLogo: ev.target.result });
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                  {jobForm.companyLogo && <img src={jobForm.companyLogo} alt="Preview" className="w-16 h-16 object-contain mt-2 bg-white/5 rounded-xl border border-slate-700 p-2" />}
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

                    {jobForm.jobCategory === 'Government Jobs' && (
                      <div className="space-y-2 relative">
                        <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Govt Department *</label>
                        <select className={selectCls} value={jobForm.govtDept || ''} onChange={e => setJobForm({ ...jobForm, govtDept: e.target.value })}>
                          <option value="">Select Department</option>
                          <option value="Teaching">Teaching / Education</option>
                          <option value="Police">Police / Security</option>
                          <option value="Military">Military / Defence</option>
                          <option value="Railway">Railway</option>
                          <option value="Banking">Banking & Finance</option>
                          <option value="Healthcare">Healthcare / Medical</option>
                          <option value="Judiciary">Judiciary / Law</option>
                          <option value="UPSC / PSC">UPSC / PSC</option>
                          <option value="Others">Others</option>
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
              {/* Primary Performance Multipliers */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Active Jobs', val: dashboardSummary ? dashboardSummary.totalJobs : jobs.length, icon: Briefcase, col: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Total Applicants', val: dashboardSummary ? dashboardSummary.totalApplications : applications.length, icon: Users, col: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'Partner Network', val: dashboardSummary ? dashboardSummary.totalCompanies : companies.length, icon: Building2, col: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { label: 'Job Melas', val: dashboardSummary ? dashboardSummary.totalMelas : melas.length, icon: Megaphone, col: 'text-amber-400', bg: 'bg-amber-500/10' }
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

              {/* Unified Operational Pulse & Intelligence Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800/60 shadow-2xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                      <h3 className="text-2xl font-black flex items-center gap-3">
                        <Activity className="text-emerald-500 animate-pulse" /> Operational Pulse
                      </h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Live Intelligence & Contribution highlights</p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/40 p-2 rounded-3xl border border-slate-200 dark:border-slate-800/60">
                       <div className="px-4 py-2 text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Today</p>
                          <p className="text-xl font-black text-emerald-500">{globalStats?.totalToday || 0}</p>
                       </div>
                       <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                       <div className="px-4 py-2 text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Active Admins</p>
                          <p className="text-xl font-black text-blue-500">{(Array.isArray(admins) ? admins : []).filter(a => a.isactive).length}</p>
                       </div>
                       <button onClick={fetchData} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-emerald-500"><RefreshCw size={14} /></button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(Array.isArray(logs) ? logs : []).slice(0, 6).map((log, i) => {
                       const moduleColors = {
                        'Jobs': 'text-sky-500 bg-sky-500/10 border-sky-500/20',
                        'Auth': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
                        'Companies': 'text-purple-500 bg-purple-500/10 border-purple-500/20',
                        'Feedback': 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
                      };
                      const color = moduleColors[log.module] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';
                      
                      return (
                        <div key={i} className="group flex items-center gap-6 p-5 rounded-[2.5rem] bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border ${color} shadow-sm group-hover:scale-110 transition-transform`}>
                            {log.module?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter border ${color}`}>{log.module}</span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {new Date(parseInt(log.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{log.action}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-tight mt-0.5">
                              By {log.username || 'System Admin'} <span className="opacity-50 lowercase">• {log.role || 'identity'}</span>
                            </p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1">
                             <div className="text-[9px] font-mono text-slate-400">#{log.id}</div>
                             {log.action?.includes('Logged In') && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                          </div>
                        </div>
                      );
                    })}
                    {logs.length === 0 && <p className="text-center py-10 text-slate-500 text-xs font-black uppercase tracking-widest">Generating secure pulse feed...</p>}
                  </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    {/* Admin Status Monitor */}
                    <div className="bg-white dark:bg-slate-900/40 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800/60 shadow-2xl relative overflow-hidden">
                       <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-8 flex items-center gap-2"><Zap size={16} className="text-amber-400" /> Operational Health</h3>
                      <div className="space-y-6">
                        {(Array.isArray(admins) ? admins : []).slice(0, 5).map(admin => {
                          const p = (Array.isArray(globalStats?.adminProductivity) ? globalStats.adminProductivity : []).find(x => x.id === admin.id);
                          const progress = Math.min(((p?.todayTotal || 0) / 10) * 100, 100);
                          return (
                            <div key={admin.id} className="space-y-2.5">
                               <div className="flex justify-between items-end">
                                 <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${admin.isactive ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-200">{admin.name}</p>
                                 </div>
                                 <p className="text-[10px] font-bold text-slate-500">{p?.todayTotal || 0} posts today</p>
                               </div>
                               <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                                  <div className={`h-full rounded-full transition-all duration-1000 ${admin.isactive ? 'bg-emerald-500' : 'bg-slate-700'} ${progress > 0 ? 'shadow-[0_0_8px_rgba(16,185,129,0.3)]' : ''}`} style={{ width: `${progress}%` }} />
                               </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                </div>
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
                        {job.canEdit !== false && (
                          <button onClick={() => { setJobForm({ ...job, jobCategory: job.category, govtDept: job.govtDept || '' }); setEditingJobId(job.id); setActiveTab('add'); }} className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"><Edit2 size={18} /></button>
                        )}
                        {job.canDelete !== false && (
                          <button onClick={() => handleJobDelete(job.id)} className="p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-colors"><Trash2 size={18} /></button>
                        )}
                        {!job.canEdit && !job.canDelete && (
                          <span className="px-3 py-1.5 text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800/50 text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 tracking-widest">VIEW ONLY</span>
                        )}
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
                                    <a href={app.resume} target="_blank" rel="noreferrer" className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-emerald-500 transition-all border border-emerald-500/20" title="View Resume">
                                      <Download size={18} />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => {
                                      confirmAction(`Permanently delete applicant ${app.name}?`, async () => {
                                        try {
                                          await axios.delete(`${API}/jobs/applications/${app.id}`, getConfig());
                                          fetchData();
                                          showMsg('Application Deleted');
                                        } catch (err) {
                                          toast.error('Failed to delete applicant');
                                        }
                                      });
                                    }}
                                    className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-all border border-rose-500/20"
                                    title="Delete Applicant"
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
                    <div className="space-y-2 relative"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Company Type</label><select className={selectCls} value={companyForm.companyType} onChange={e => setCompanyForm({ ...companyForm, companyType: e.target.value })}><option value="">Select Type</option><option>MNC</option><option>Startup</option><option>Product Based</option><option>Service Based</option><option>Govt PSU</option><option>Remote First</option><option>Unicorn</option></select><div className="absolute right-5 top-[38px] pointer-events-none text-slate-500">▼</div></div>
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
                    <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">{comp.logo ? <img src={comp.logo} alt={comp.name} className="w-full h-full object-contain" /> : <Building2 className="text-slate-600" />}</div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 dark:text-slate-200 truncate">{comp.name}</div>
                        <div className="text-[10px] font-black text-slate-500 tracking-widest uppercase">{comp.industry}</div>
                        {comp.companyType && <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">{comp.companyType}</span>}
                      </div>
                    </div>
                    <button onClick={() => confirmAction('Delete company?', async () => { await axios.delete(`${API}/companies/${comp.id}`, getConfig()); fetchData(); showMsg('Removed'); })} className="p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl text-rose-500 transition-colors opacity-0 group-hover:opacity-100 relative z-10 shrink-0"><Trash2 size={18} /></button>
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
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Candidate Photo</label>
                      <div className="flex gap-2">
                        <label className="flex-1 cursor-pointer bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-full px-5 py-3.5 text-sm text-center text-slate-600 dark:text-slate-300 font-bold transition-all shadow-sm">
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setTestimonialForm(f => ({ ...f, photo: reader.result }));
                              reader.readAsDataURL(file);
                            }
                          }} />
                          {testimonialForm.photo ? 'Photo Selected ✓' : 'Upload Image'}
                        </label>
                        {testimonialForm.photo && (
                          <button onClick={() => setTestimonialForm(f => ({ ...f, photo: '' }))} className="px-4 py-3.5 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-black transition-all"><Trash2 size={16}/></button>
                        )}
                      </div>
                    </div>
                    <button onClick={async () => { await axios.post(`${API}/testimonials`, testimonialForm, getConfig()); setTestimonialForm({ name: '', tagline: '', description: '', photo: '' }); fetchData(); showMsg('Testimonial added'); }} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-full mt-4 transition-all shadow-lg shadow-emerald-500/20">Publish Review</button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 flex flex-col gap-3">
                {testimonials.map(t => (
                  <div key={t.id} className="bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 group relative overflow-hidden flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4 flex-1">
                      {t.photo ? (
                        <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden border border-emerald-500/20">
                          <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center font-black text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 shrink-0">{t.name.charAt(0)}</div>
                      )}
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
                    {(Array.isArray(logs) ? logs : []).map((log, idx) => {
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

          {/* ═══════════════════════ TEAM MANAGEMENT TAB ═══════════════════════ */}
          {isManager() && activeTab === 'team' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 space-y-8">

              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900 dark:text-white">
                    <Users2 className="text-purple-400" size={30} /> Team Management
                  </h2>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mt-1 pl-12">Manage your administrative team</p>
                </div>
                <button
                  onClick={() => setShowTeamModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-black rounded-full shadow-xl shadow-purple-500/25 active:scale-95 transition-all text-sm"
                >
                  <UserPlus size={16} /> Add Member
                </button>
              </div>

              {/* Team Table */}
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Member</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Contact & Dept</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Role</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Joined</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {(Array.isArray(admins) ? admins : []).map(member => {
                        const rc = getRoleConfig(member.role);
                        const RoleIcon = rc.icon;
                        return (
                          <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                            {/* Member */}
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border ${rc.bg} ${rc.border} ${rc.color} shadow-inner group-hover:scale-105 transition-transform`}>
                                  {member.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{member.name}</p>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{member.email}</p>
                                </div>
                              </div>
                            </td>
                            {/* Contact & Dept */}
                            <td className="px-8 py-6">
                              <div className="space-y-1">
                                {member.mobile && <p className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><Phone size={10} className="text-slate-400" />{member.mobile}</p>}
                                {member.department && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{member.department}</p>}
                                {!member.mobile && !member.department && <p className="text-[10px] text-slate-400 italic">—</p>}
                              </div>
                            </td>
                            {/* Role badge */}
                            <td className="px-8 py-6">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${rc.bg} ${rc.border} ${rc.color}`}>
                                <RoleIcon size={10} /> {rc.label}
                              </span>
                            </td>
                            {/* Status */}
                            <td className="px-8 py-6">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${member.isactive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${member.isactive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                {member.isactive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            {/* Joined */}
                            <td className="px-8 py-6">
                              <p className="text-xs font-bold text-slate-500">
                                {member.joinedat ? new Date(parseInt(member.joinedat)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : member.createdat ? new Date(parseInt(member.createdat)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                              </p>
                            </td>
                            {/* Actions */}
                            <td className="px-8 py-6">
                              {member.role !== 'manager' && (
                                <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={async () => { await axios.put(`${API}/auth/users/${member.id}/toggle`, { isActive: !member.isactive }, getConfig()); fetchData(); toast.success('Status updated'); }}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${member.isactive ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'}`}
                                  >
                                    {member.isactive ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <button
                                    onClick={() => confirmAction(`Remove ${member.name} from team?`, async () => {
                                      try {
                                        await axios.delete(`${API}/auth/users/${member.id}`, getConfig());
                                        fetchData();
                                        toast.success('Member removed');
                                      } catch (err) {
                                        toast.error(err.response?.data?.error || 'Failed to remove member');
                                      }
                                    })}
                                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-500 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                              {member.role === 'manager' && (
                                <span className="text-[9px] font-black uppercase text-purple-500 tracking-widest flex items-center gap-1 justify-end"><Crown size={10} /> Manager</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {(Array.isArray(admins) ? admins : []).length === 0 && (
                    <div className="py-20 text-center text-slate-500 font-black uppercase text-xs tracking-[0.3em]">No team members yet. Add one above.</div>
                  )}
                </div>
              </div>

              {/* Add Member Modal */}
              {showTeamModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 relative animate-in fade-in zoom-in-95">
                    <button onClick={() => setShowTeamModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"><X size={20} /></button>
                    <h3 className="text-2xl font-black mb-1 flex items-center gap-3 text-slate-900 dark:text-white"><UserPlus className="text-purple-400" size={24} /> Add Team Member</h3>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-8">Onboard a new admin to the system</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Full Name *</label><input className={inputCls} placeholder="Full name" value={teamForm.name} onChange={e => setTeamForm(f => ({ ...f, name: e.target.value }))} /></div>
                      <div className="col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Work Email *</label><input type="email" className={inputCls} placeholder="name@strataply.com" value={teamForm.email} onChange={e => setTeamForm(f => ({ ...f, email: e.target.value }))} /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mobile</label><input type="tel" className={inputCls} placeholder="+91 XXXXX XXXXX" value={teamForm.mobile} onChange={e => setTeamForm(f => ({ ...f, mobile: e.target.value }))} /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Department</label><input className={inputCls} placeholder="e.g. Recruitment" value={teamForm.department} onChange={e => setTeamForm(f => ({ ...f, department: e.target.value }))} /></div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Role *</label>
                        <select className={selectCls} value={teamForm.role} onChange={e => setTeamForm(f => ({ ...f, role: e.target.value }))}>
                          <option value="executive">Executive</option>
                          <option value="operational_manager">Operational Manager</option>
                        </select>
                      </div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Date of Joining</label><input type="date" className={inputCls} value={teamForm.joinedAt} onChange={e => setTeamForm(f => ({ ...f, joinedAt: e.target.value }))} /></div>
                      <div className="col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Temporary Password *</label><input type="password" className={inputCls} placeholder="Min. 8 characters" value={teamForm.password} onChange={e => setTeamForm(f => ({ ...f, password: e.target.value }))} /></div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button onClick={() => setShowTeamModal(false)} className="flex-1 py-3.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 font-black text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                      <button
                        onClick={async () => {
                          const { name, email, password, role, department, mobile, joinedAt } = teamForm;
                          if (!name || !email || !password) return toast.error('Name, email and password are required');
                          try {
                            await axios.post(`${API}/auth/register`, { name, email, password, role, department, mobile, joinedAt }, getConfig());
                            toast.success(`${name} added to team!`);
                            setShowTeamModal(false);
                            setTeamForm({ name: '', email: '', password: '', role: 'executive', department: '', mobile: '', joinedAt: '' });
                            fetchData();
                          } catch(e) { toast.error(e.response?.data?.error || 'Failed to add member'); }
                        }}
                        className="flex-1 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-black text-sm shadow-xl shadow-purple-500/25 active:scale-95 transition-all"
                      >
                        Add to Team
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════ ROLE PERMISSIONS TAB ══════════════════════ */}
          {isManager() && activeTab === 'permissions' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 space-y-8">
              <div>
                <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900 dark:text-white">
                  <Sliders className="text-amber-400" size={30} /> Role Permissions
                </h2>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mt-1 pl-12">Configure what each role can do in the system</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {['operational_manager', 'executive'].map(role => {
                  const rc = getRoleConfig(role);
                  const RoleIcon = rc.icon;
                  const serverRow = (Array.isArray(permissions) ? permissions : []).find(p => p.role === role) || {};
                  const local = permForm[role] || serverRow;

                  const PERMS = [
                    { key: 'can_post_job',          label: 'Post Jobs',          desc: 'Create new job listings' },
                    { key: 'can_edit_job',           label: 'Edit Jobs',          desc: 'Modify existing job listings' },
                    { key: 'can_delete_job',         label: 'Delete Jobs',        desc: 'Permanently remove job listings' },
                    { key: 'can_view_applicants',    label: 'View Applicants',    desc: 'Access applications dashboard' },
                    { key: 'can_manage_companies',   label: 'Manage Companies',   desc: 'Add / edit / delete companies' },
                    { key: 'can_manage_mela',        label: 'Manage Job Mela',    desc: 'Create and manage job fairs' },
                    { key: 'can_manage_prep',        label: 'Manage Prep Content','desc': 'Add preparation materials' },
                  ];

                  return (
                    <div key={role} className={`bg-white dark:bg-slate-900/40 border rounded-[2.5rem] shadow-xl overflow-hidden ${rc.border}`}>
                      {/* Card header */}
                      <div className={`p-7 border-b ${rc.border} ${rc.bg} flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl ${rc.bg} border ${rc.border} flex items-center justify-center`}><RoleIcon size={22} className={rc.color} /></div>
                          <div>
                            <h3 className={`text-lg font-black ${rc.color}`}>{rc.label === 'Exec.' ? 'Executive' : 'Operational Manager'}</h3>
                            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Permission Matrix</p>
                          </div>
                        </div>
                        <button
                          disabled={permSaving[role]}
                          onClick={async () => {
                            const payload = { role, ...local };
                            setPermSaving(s => ({ ...s, [role]: true }));
                            try {
                              await axios.put(`${API}/auth/permissions`, payload, getConfig());
                              refreshPermissions();
                              toast.success(`${rc.label} permissions saved!`);
                            } catch(e) { toast.error(e.response?.data?.error || 'Save failed'); }
                            finally { setPermSaving(s => ({ ...s, [role]: false })); }
                          }}
                          className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${permSaving[role] ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-wait' : `${rc.bg} border ${rc.border} ${rc.color} hover:brightness-110`}`}
                        >
                          {permSaving[role] ? 'Saving…' : 'Save Changes'}
                        </button>
                      </div>

                      {/* Permission toggles */}
                      <div className="p-6 space-y-3">
                        {PERMS.map(({ key, label, desc }) => {
                          const isOn = local[key] !== false && local[key] !== undefined ? (local[key] === true || local[key] === 'true') : key !== 'can_delete_job';
                          return (
                            <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isOn ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                                  {isOn ? <Unlock size={14} /> : <Lock size={14} />}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">{label}</p>
                                  <p className="text-[10px] text-slate-500 font-bold">{desc}</p>
                                </div>
                              </div>
                              {/* Toggle switch */}
                              <button
                                onClick={() => setPermForm(prev => ({ ...prev, [role]: { ...local, [key]: !isOn } }))}
                                className={`relative w-12 h-6 rounded-full transition-colors ${isOn ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                              >
                                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${isOn ? 'left-7' : 'left-1'}`} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Manager note */}
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-[2rem] p-6 flex items-start gap-4">
                <Crown size={20} className="text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-black text-purple-400 mb-1">Manager Role — Always Full Access</p>
                  <p className="text-xs font-bold text-slate-500">Managers bypass all permission restrictions and have full system control. This cannot be modified for security reasons.</p>
                </div>
              </div>
            </div>
          )}

          {isManager() && activeTab === 'global_stats' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 space-y-10">
              {/* ── Top 4 Intelligence Cards ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: 'Total Jobs',
                    value: globalStats?.totalJobs || 0,
                    sub1: `${globalStats?.todayJobs || 0} added today`,
                    sub2: `${(Array.isArray(jobs) ? jobs : []).filter(j => j.isFeatured).length} featured`,
                    icon: Briefcase,
                    iconColor: 'text-emerald-400',
                    bg: 'bg-emerald-500/8',
                    ring: 'border-emerald-500/20',
                    dot: 'bg-emerald-500',
                    subColor: 'text-emerald-500'
                  },
                  {
                    label: 'Total Applicants',
                    value: globalStats?.totalApplications || 0,
                    sub1: `${applications.filter(a => { const d = new Date(parseInt(a.appliedat || a.appliedAt || a.createdat || Date.now())); return d.toDateString() === new Date().toDateString(); }).length} applied today`,
                    sub2: 'All time submissions',
                    icon: Users2,
                    iconColor: 'text-blue-400',
                    bg: 'bg-blue-500/8',
                    ring: 'border-blue-500/20',
                    dot: 'bg-blue-500',
                    subColor: 'text-blue-500'
                  },
                  {
                    label: 'Partner Companies',
                    value: globalStats?.totalCompanies || 0,
                    sub1: `${(Array.isArray(companies) ? companies : []).filter(c => c.companyType).length} typed`,
                    sub2: 'Verified network',
                    icon: Building2,
                    iconColor: 'text-purple-400',
                    bg: 'bg-purple-500/8',
                    ring: 'border-purple-500/20',
                    dot: 'bg-purple-500',
                    subColor: 'text-purple-500'
                  },
                  {
                    label: 'Active Admins',
                    value: globalStats?.totalAdmins || 0,
                    sub1: `${(Array.isArray(admins) ? admins : []).filter(a => a.isactive).length} online`,
                    sub2: `${(globalStats?.totalAdmins || 0) - (Array.isArray(admins) ? admins : []).filter(a => a.isactive).length} inactive`,
                    icon: ShieldCheck,
                    iconColor: 'text-amber-400',
                    bg: 'bg-amber-500/8',
                    ring: 'border-amber-500/20',
                    dot: 'bg-amber-500',
                    subColor: 'text-amber-500'
                  },
                ].map((s, i) => (
                  <div key={i} className={`bg-white dark:bg-slate-900/40 border ${s.ring} p-7 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
                    <div className={`absolute top-0 right-0 p-5 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity ${s.iconColor}`}><s.icon size={90} /></div>
                    <div className="flex items-start justify-between relative z-10 mb-4">
                      <div className={`w-11 h-11 rounded-2xl ${s.bg} border ${s.ring} flex items-center justify-center`}>
                        <s.icon size={20} className={s.iconColor} />
                      </div>
                      <span className="relative flex h-2.5 w-2.5 mt-1">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-50 ${s.dot}`} />
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${s.dot}`} />
                      </span>
                    </div>
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">{s.label}</p>
                      <div className="text-4xl font-black text-slate-900 dark:text-white tabular-nums mb-3">{s.value}</div>
                      <div className="space-y-1">
                        <p className={`text-[11px] font-black ${s.subColor} flex items-center gap-1`}><CheckCircle2 size={11} /> {s.sub1}</p>
                        <p className="text-[10px] font-bold text-slate-400">{s.sub2}</p>
                      </div>
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
                        {((Array.isArray(globalStats?.adminProductivity) ? globalStats.adminProductivity : []).reduce((acc, p) => acc + (parseInt(p.jobCountToday) || 0) + (parseInt(p.prepCountToday) || 0), 0)) || 0}
                      </p>
                    </div>
                    <div className="text-center border-l dark:border-slate-800 pl-10">
                      <p className="text-[10px] font-black uppercase text-slate-500">Team Lifetime</p>
                      <p className="text-lg font-black text-blue-500">
                        {(Array.isArray(globalStats?.adminProductivity) ? globalStats.adminProductivity : []).reduce((acc, p) => acc + (parseInt(p.lifetimeTotal) || 0), 0) || 0}
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
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right pr-15">Join Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                      {(Array.isArray(globalStats?.adminProductivity) ? globalStats.adminProductivity : []).map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center font-black text-emerald-500 border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform">
                                {p.adminName?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-slate-100">{p.adminName}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{p.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                <span className="text-emerald-400">IN:</span> {p.lastLogin ? new Date(parseInt(p.lastLogin)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                              </div>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <span className="text-rose-400">OUT:</span> {p.lastLogout ? new Date(parseInt(p.lastLogout)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-3">
                               <div className="text-2xl font-black text-emerald-500">{p.todayTotal || 0}</div>
                               <div className="text-[10px] font-black text-slate-500 uppercase leading-none border-l border-slate-700/50 pl-2">
                                 {p.jobCountToday || 0} Jobs<br />
                                 {p.prepCountToday || 0} Prep
                               </div>
                             </div>
                          </td>
                          <td className="px-10 py-8 text-right pr-15">
                            <p className="text-xs font-bold text-slate-500">{p.createdAt ? new Date(parseInt(p.createdAt)).toLocaleDateString() : 'Original'}</p>
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
                      {(Array.isArray(globalStats?.adminProductivity) ? globalStats.adminProductivity : []).map(admin => (
                        <div key={admin.id} className="bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem]">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">{admin.adminName}'s Daily Output (Jobs)</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {admin.historicalJobs?.length > 0 ? admin.historicalJobs.map((h, i) => (
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
