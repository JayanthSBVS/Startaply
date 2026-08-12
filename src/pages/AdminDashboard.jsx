import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import AdminCompanyModal from '../components/admin/AdminCompanyModal';
import ConfirmDeleteModal from '../components/common/ConfirmDeleteModal';
import AdminDashboardTab from '../components/admin/AdminDashboardTab';
import AdminJobForm from '../components/admin/AdminJobForm';
import AdminManageJobs from '../components/admin/AdminManageJobs';
import AdminApplications from '../components/admin/AdminApplications';
import AdminCompanies from '../components/admin/AdminCompanies';
import AdminJobMela from '../components/admin/AdminJobMela';
import AdminPrepData from '../components/admin/AdminPrepData';
import AdminTestimonials from '../components/admin/AdminTestimonials';
import AdminCollabs from '../components/admin/AdminCollabs';
import AdminSupportTickets from '../components/admin/AdminSupportTickets';
import AdminLiveTicker from '../components/admin/AdminLiveTicker';
import AdminHeroBanners from '../components/admin/AdminHeroBanners';
import AdminTeamManagement from '../components/admin/AdminTeamManagement';
import AdminPermissions from '../components/admin/AdminPermissions';
import AdminActivityLogs from '../components/admin/AdminActivityLogs';
import AdminGlobalStats from '../components/admin/AdminGlobalStats';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { publishFreshness } from '../utils/dataFreshness';
import axios from 'axios';
import {
  LayoutDashboard, PlusCircle, Briefcase, Trash2, Edit2,
  X, LogOut, Upload, MessageSquare, Users, Building2,
  Megaphone, Calendar, MapPin, Download, Star, Zap,
  MessageSquareQuote, BookOpen, Search, Eye, Image as ImageIcon,
  BarChart3, ShieldCheck, Activity, TrendingUp, PieChart, Users2,
  Bell, History, Settings, CheckCircle2, AlertCircle, FileText, RefreshCw,
  Lock, Unlock, UserPlus, Phone, Mail, Sliders, Crown, BadgeCheck, UserCheck, ChevronRight, Handshake
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ThemeToggle from '../components/common/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { motion } from 'framer-motion';
const API = '/api';
const inputCls = "w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-full px-5 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-sm dark:shadow-inner";
const selectCls = "w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-full px-5 py-3.5 text-sm text-slate-900 dark:text-white cursor-pointer focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-sm dark:shadow-inner appearance-none";
const textareaCls = "w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-[1.5rem] px-5 py-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none shadow-sm dark:shadow-inner";
// Role presentation helpers
const ROLE_CONFIG = {
  manager:               { label: 'Manager',              color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  icon: Crown },
  operational_manager:   { label: 'Op. Manager (Full Access)',          color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: BadgeCheck },
  operational_executive: { label: 'Op. Executive (Restricted)',        color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: UserCheck },
};
const getRoleConfig  = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.operational_executive;
const getRoleLabel   = (role) => getRoleConfig(role).label;
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isManager, isOpManager, isExecutive, canDo, permissions, refreshPermissions: authRefreshPermissions } = useAuth();
  const getConfig = () => {
    const token = localStorage.getItem('startaply_token');
    // Guard: never send Authorization header with null/undefined token (avoids 401 spam)
    if (!token || token === 'null' || token === 'undefined') return null;
    return { headers: { Authorization: `Bearer ${token}` } };
  };
  // Compress and resize image client-side before uploading (prevents 413 Payload Too Large)
  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = (ev) => {
        const img = new Image();
        img.src = ev.target.result;
        img.onerror = () => reject(new Error('Failed to load image'));
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
      };
    });
  };
  const showMsg = (msg) => { toast.success(msg); };
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  // Real-time synchronization
  useSocket(() => {
    fetchData();
  });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, title: 'Confirm Deletion', message: '', onConfirm: null });

  const confirmAction = useCallback((message, onConfirm, title = "Confirm Deletion") => {
    setDeleteModal({
      isOpen: true,
      title,
      message: typeof message === 'string' ? message : 'Are you sure you want to delete this? This action cannot be undone.',
      onConfirm: () => {
        setDeleteModal({ isOpen: false, title: '', message: '', onConfirm: null });
        if (typeof onConfirm === 'function') onConfirm();
      }
    });
  }, []);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [melas, setMelas] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [prepData, setPrepData] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [liveTickerItems, setLiveTickerItems] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [collabRequests, setCollabRequests] = useState([]);
  const [jobForm, setJobForm] = useState({ applyType: 'external', expiryDays: 30, jobCategory: '', govtDept: '', isHeroFeatured: false });
  const [editingJobId, setEditingJobId] = useState(null);
  const [companyForm, setCompanyForm] = useState({ name: '', industry: '', logo: '', companyType: '' });
  const [melaForm, setMelaForm] = useState({ title: '', date: '', venue: '', time: '', isActive: true, showPopup: true, company: '', registrationLink: '', bannerImage: '', googleMapLink: '' });
  const [testimonialForm, setTestimonialForm] = useState({ name: '', tagline: '', description: '', photo: '' });
  const [prepForm, setPrepForm] = useState({ heading: '', jobType: 'IT Jobs', content: '', contentType: 'article', fileUrl: '', question: '', answer: '' });
  const [tickerForm, setTickerForm] = useState({ text: '' });
  // Team Management state
  const [teamForm, setTeamForm] = useState({ name: '', email: '', password: '', role: 'operational_executive', department: '', mobile: '', joinedAt: '' });
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [permForm, setPermForm] = useState({});
  const [permSaving, setPermSaving] = useState({});
  const [permSeeded, setPermSeeded] = useState({});
  const [myPermissions, setMyPermissions] = useState(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyList, setShowCompanyList] = useState(false);

  const fetchMyPermissions = useCallback(async () => {
    const token = localStorage.getItem('startaply_token');
    if (!token || token === 'null' || token === 'undefined') return;
    try {
      const res = await axios.get(`${API}/auth/my-permissions`, { headers: { Authorization: `Bearer ${token}` } });
      if (res?.data) setMyPermissions(res.data);
    } catch (err) {
      console.error('[fetchMyPermissions]', err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('startaply_token');
    if (!token || token === 'null' || token === 'undefined') {
      navigate('/admin-login');
      return;
    }
    fetchMyPermissions();
    const storedUser = JSON.parse(localStorage.getItem('startaply_user') || '{}');
    const currentIsManager = storedUser?.role === 'manager' || storedUser?.email === 'manager@startaply.com';
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
        const [jobsRes, compsRes] = await Promise.all([
          safeGet(`${API}/jobs/admin/list`, config),
          safeGet(`${API}/companies/admin/list`, config)
        ]);
        if (jobsRes?.data) setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
        if (compsRes?.data) setCompanies(Array.isArray(compsRes.data) ? compsRes.data : []);
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
        const res = await safeGet(`${API}/testimonials`, config);
        setTestimonials(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'support') {
        const res = await safeGet(`${API}/support/tickets`, config);
        setSupportTickets(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'liveticker') {
        const tickerRes = await safeGet(`${API}/live-ticker`, config);
        if (tickerRes?.data) setLiveTickerItems(Array.isArray(tickerRes.data) ? tickerRes.data : []);
        if (currentIsManager) {
          const [statsRes, logsRes, adminsRes] = await Promise.all([
            safeGet(`${API}/auth/stats`, config, null),
            safeGet(`${API}/auth/logs`, config),
            safeGet(`${API}/auth/users`, config),
          ]);
          if (statsRes?.data) setGlobalStats(prev => ({...prev, ...statsRes.data}));
          if (logsRes?.data) setLogs(prev => JSON.stringify(prev) === JSON.stringify(logsRes.data) ? prev : (Array.isArray(logsRes.data) ? logsRes.data : []));
          if (adminsRes?.data) setAdmins(Array.isArray(adminsRes.data) ? adminsRes.data : []);
        }
      } else if (['team', 'permissions', 'logs', 'global_stats', 'herobanners'].includes(activeTab)) {
        if (currentIsManager) {
          const [statsRes, logsRes, adminsRes, heroRes] = await Promise.all([
            safeGet(`${API}/auth/stats`, config, null),
            safeGet(`${API}/auth/logs`, config),
            safeGet(`${API}/auth/users`, config),
            activeTab === 'herobanners' ? safeGet(`${API}/hero-banners`, config).catch(() => ({ data: [] })) : Promise.resolve(null),
          ]);
          if (statsRes?.data) setGlobalStats(prev => ({...prev, ...statsRes.data, totalToday: statsRes.data.totalToday || (parseInt(statsRes.data.todayJobs || 0) + parseInt(statsRes.data.todayPrep || 0) + parseInt(statsRes.data.todayMela || 0))}));
          if (logsRes?.data) setLogs(prev => JSON.stringify(prev) === JSON.stringify(logsRes.data) ? prev : (Array.isArray(logsRes.data) ? logsRes.data : []));
          if (adminsRes?.data) setAdmins(Array.isArray(adminsRes.data) ? adminsRes.data : []);
          if (heroRes?.data) setHeroBanners(Array.isArray(heroRes.data) ? heroRes.data : []);
        }
      } else if (activeTab === 'collabs') {
        const res = await safeGet(`${API}/collabs`, config);
        setCollabRequests(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.error('[Dashboard fetch error]', err.message);
      }
    }
  }, [activeTab, navigate, logout, fetchMyPermissions]);

  const refreshPermissions = useCallback(() => {
    fetchData();
    fetchMyPermissions();
  }, [fetchData, fetchMyPermissions]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          toast.error('Session expired or unauthorized. Please log in again.');
          logout();
          navigate('/admin-login');
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout, navigate]);
  useEffect(() => {
    const token = localStorage.getItem('startaply_token');
    if (!token || token === 'null' || token === 'undefined') {
      navigate('/admin-login');
      return;
    }
    fetchData();
    const unSubPerms = subscribeToFreshness('permissions', () => refreshPermissions());
    const pollInterval = setInterval(() => {
      fetchData();
    }, 45000);
    return () => {
      unSubPerms();
      clearInterval(pollInterval);
    };
  }, [fetchData, navigate, refreshPermissions]);
  const handleToggle = (job, field) => {
    const updatedJob = { ...job, [field]: !job[field] };
    setJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j));
    axios.put(`${API}/jobs/${job.id}`, updatedJob, getConfig()).then(() => {
      let mutationType = 'update';
      if (field === 'isFeatured') mutationType = 'feature';
      if (field === 'isToday') mutationType = 'today';
      if (field === 'isVisible') mutationType = 'visibility';
      publishFreshness('jobs', mutationType, job.id);
    }).catch(() => {
      setJobs(prev => prev.map(j => j.id === job.id ? job : j));
      toast.error("Database sync failed.");
    });
  };
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.company) {
      toast.error('Job Title and Company are required');
      return;
    }
    try {
      let newJobId = editingJobId;
      if (editingJobId) {
        await axios.put(`${API}/jobs/${editingJobId}`, jobForm, getConfig());
        showMsg('Job Updated');
      } else {
        const res = await axios.post(`${API}/jobs`, jobForm, getConfig());
        newJobId = res.data?.id || res.data?.job?.id || null;
        showMsg('Job Published');
      }
      setJobForm({ applyType: 'external', expiryDays: 30, jobCategory: '', govtDept: '', companyId: null, isHeroFeatured: false }); 
      setEditingJobId(null); 
      setActiveTab('manage'); 
      publishFreshness('jobs', editingJobId ? 'update' : 'create', newJobId);
      fetchData();
    } catch (err) { toast.error('Error saving job data'); }
  };
  const handleJobDelete = async (id) => {
    confirmAction('Permanently delete this job?', async () => {
      await axios.delete(`${API}/jobs/${id}`, getConfig());
      publishFreshness('jobs', 'delete', id);
      fetchData(); showMsg('Job Removed');
    });
  };
  
  const isMgr = isManager();
  const perms = myPermissions || {};

  const renderAccessDenied = (featureTitle) => (
    <div className="bg-white dark:bg-slate-900/40 border border-amber-500/20 rounded-[2.5rem] p-12 text-center space-y-4 max-w-xl mx-auto mt-10 shadow-2xl">
      <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto text-amber-500">
        <Lock size={32} />
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white">{featureTitle} Access Restricted</h3>
      <p className="text-sm font-bold text-slate-500">
        Your role does not currently have permission to access {featureTitle.toLowerCase()}. Please contact a Manager to grant access in Role Permissions.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f14] flex text-slate-900 dark:text-white font-sans selection:bg-emerald-500/30 transition-colors duration-300">
      <AdminSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} navigate={navigate} isManager={isManager} myPermissions={myPermissions} />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 dark:bg-[#0b0f14]">
        <AdminHeader 
          activeTab={activeTab} setIsMobileMenuOpen={setIsMobileMenuOpen}
          toast={toast} getRoleLabel={getRoleLabel} user={user}
        />
        <main className="p-4 md:p-8">
          {activeTab === 'dashboard' && (
            <AdminDashboardTab 
              dashboardSummary={dashboardSummary} jobs={jobs} applications={applications}
              companies={companies} melas={melas} isManager={isManager} globalStats={globalStats}
              logs={logs} admins={admins} isMobileMenuOpen={isMobileMenuOpen}
            />
          )}
          {activeTab === 'add' && (
            (!isMgr && perms.can_post_job === false) ? renderAccessDenied('Post Job') : (
              <AdminJobForm 
                jobForm={jobForm} setJobForm={setJobForm} editingJobId={editingJobId}
                companySearch={companySearch} setCompanySearch={setCompanySearch}
                showCompanyList={showCompanyList} setShowCompanyList={setShowCompanyList}
                companies={companies} setIsCompanyModalOpen={setIsCompanyModalOpen}
                handleJobSubmit={handleJobSubmit}
              />
            )
          )}
          {activeTab === 'manage' && (
            <AdminManageJobs 
              jobs={jobs} setJobForm={setJobForm} setEditingJobId={setEditingJobId}
              setActiveTab={setActiveTab} handleJobDelete={handleJobDelete}
              handleToggle={handleToggle} setCompanySearch={setCompanySearch}
            />
          )}
          {activeTab === 'applications' && (
            (!isMgr && perms.can_view_applicants === false) ? renderAccessDenied('Applications') : (
              <AdminApplications 
                applications={applications} confirmAction={confirmAction}
                fetchData={fetchData} showMsg={showMsg} getConfig={getConfig}
              />
            )
          )}
          {activeTab === 'companies' && (
            (!isMgr && perms.can_manage_companies === false) ? renderAccessDenied('Companies') : (
              <AdminCompanies 
                companies={companies} companyForm={companyForm} setCompanyForm={setCompanyForm}
                getConfig={getConfig} fetchData={fetchData} showMsg={showMsg}
                confirmAction={confirmAction} handleImageCompression={compressImage} API={API}
                userProfile={user} isManager={isManager}
              />
            )
          )}
          {activeTab === 'jobmela' && (
            (!isMgr && perms.can_manage_mela === false) ? renderAccessDenied('Job Fair') : (
              <AdminJobMela 
                melas={melas} melaForm={melaForm} setMelaForm={setMelaForm}
                getConfig={getConfig} fetchData={fetchData} showMsg={showMsg}
                confirmAction={confirmAction} handleImageCompression={compressImage} API={API}
              />
            )
          )}
          {activeTab === 'prep' && (
            (!isMgr && perms.can_manage_prep === false) ? renderAccessDenied('Preparation Material') : (
              <AdminPrepData 
                prepData={prepData} prepForm={prepForm} setPrepForm={setPrepForm}
                getConfig={getConfig} fetchData={fetchData} showMsg={showMsg}
                confirmAction={confirmAction} API={API}
              />
            )
          )}
          {activeTab === 'testimonials' && (
            <AdminTestimonials 
              testimonials={testimonials} testimonialForm={testimonialForm} setTestimonialForm={setTestimonialForm}
              getConfig={getConfig} fetchData={fetchData} showMsg={showMsg}
              confirmAction={confirmAction} handleImageCompression={compressImage} API={API}
            />
          )}
          {activeTab === 'collabs' && (
            <AdminCollabs 
              data={{ collabRequests }}
              formState={{}}
              handlers={{ fetchData, confirmAction, showMsg }}
              API={API} userProfile={user} getConfig={getConfig} toast={toast} safeGet={null} isManager={isManager}
            />
          )}
          {activeTab === 'support' && (
            <AdminSupportTickets 
              data={{ supportTickets }}
              formState={{}}
              handlers={{ fetchData, confirmAction, showMsg }}
              API={API} userProfile={user} getConfig={getConfig} toast={toast} safeGet={null} isManager={isManager}
            />
          )}
          {activeTab === 'liveticker' && (
            <AdminLiveTicker 
              data={{ liveTickerItems }}
              formState={{ tickerForm, setTickerForm }}
              handlers={{ fetchData, confirmAction, showMsg }}
              API={API} userProfile={user} getConfig={getConfig} toast={toast} safeGet={null} isManager={isManager}
            />
          )}
          {activeTab === 'herobanners' && (
            <AdminHeroBanners 
              data={{ heroBanners }}
              formState={{}}
              handlers={{ fetchData, confirmAction, showMsg, handleImageCompression: compressImage }}
              API={API} userProfile={user} getConfig={getConfig} toast={toast} safeGet={null} isManager={isManager}
            />
          )}
          {activeTab === 'logs' && isManager() && (
            <AdminActivityLogs 
              data={{ logs }}
              formState={{}}
              handlers={{ fetchData, confirmAction, showMsg }}
              API={API} userProfile={user} getConfig={getConfig} toast={toast} safeGet={null} isManager={isManager}
            />
          )}
          {activeTab === 'team' && isManager() && (
            <AdminTeamManagement 
              data={{ admins }}
              formState={{ teamForm, setTeamForm, showTeamModal, setShowTeamModal }}
              handlers={{ fetchData, confirmAction, showMsg }}
              API={API} userProfile={user} getConfig={getConfig} toast={toast} safeGet={null} isManager={isManager}
            />
          )}
          {activeTab === 'permissions' && isManager() && (
            <AdminPermissions 
              data={{ ROLE_CONFIG, permissions }}
              formState={{ permForm, setPermForm, permSaving, setPermSaving, permSeeded, setPermSeeded }}
              handlers={{ fetchData, showMsg, refreshPermissions }}
              API={API} userProfile={user} getConfig={getConfig} toast={toast} safeGet={null} isManager={isManager}
            />
          )}
          {activeTab === 'global_stats' && isManager() && (
            <AdminGlobalStats 
              data={{ globalStats }}
              formState={{}}
              handlers={{ fetchData, confirmAction, showMsg }}
              API={API} userProfile={user} getConfig={getConfig} toast={toast} safeGet={null} isManager={isManager}
            />
          )}
        </main>
      </div>
      {/* Inline Company Creation Modal */}
      {isCompanyModalOpen && (
        <AdminCompanyModal 
          companyForm={companyForm} setCompanyForm={setCompanyForm}
          setIsCompanyModalOpen={setIsCompanyModalOpen} setJobForm={setJobForm}
          jobForm={jobForm} setCompanySearch={setCompanySearch}
          fetchData={fetchData} showMsg={showMsg} getConfig={getConfig} API={API}
        />
      )}
      {/* Global Custom Delete Confirmation Modal */}
      <ConfirmDeleteModal 
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        message={deleteModal.message}
        onConfirm={deleteModal.onConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, title: '', message: '', onConfirm: null })}
      />
    </div>
  );
};
export default AdminDashboard;
