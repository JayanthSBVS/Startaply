import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Briefcase, Building2, Users, PlusCircle, CheckCircle2,
  AlertCircle, Eye, EyeOff, Lock, Clock, MapPin, Globe, Phone, Mail,
  ArrowRight, ArrowLeft, Search, Filter, Trash2, Edit3, ExternalLink,
  ChevronRight, RefreshCw, Download, FileText, Check, X,
  Sliders, ShieldCheck, Sparkles, LogOut, ArrowUpRight,
  TrendingUp, Award, Layers, User, Share2, Copy, Kanban, Table as TableIcon,
  CheckCheck, MessageSquare, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/common/BrandLogo';
import ThemeToggle from '../../components/common/ThemeToggle';

// ── AVAILABLE WORK MODES & EXPERIENCE BANDS ──────────────────
const WORK_MODES = ['On-site', 'Hybrid', 'Remote'];
const JOB_TYPES = ['Full Time', 'Internship', 'Contract', 'Part Time', 'Gig / Shift'];
const CATEGORIES = ['Tech', 'Design', 'Product', 'Marketing', 'Sales', 'Finance', 'Operations', 'Gig & Delivery'];
const EXP_BANDS = ['Freshers Welcome (0-1 yrs)', '1-3 Years', '3-5 Years', '5-8 Years', '8+ Years (Lead/Director)'];
const STAGES = ['Under Review', 'Shortlisted', 'Interview Scheduled', 'Offer Extended', 'Hired', 'Rejected'];

const POPULAR_HUBS = ['Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Remote'];
const RECRUITER_ROLES = ['Talent Acquisition Lead', 'Technical Recruiter', 'HR Manager', 'Founder / Co-founder', 'Engineering Manager'];

const EmployerPortal = ({ defaultTab = 'overview' }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login, logout } = useAuth();

  // Tab State: 'overview' | 'jobs' | 'post' | 'applicants' | 'profile' | 'auth'
  const [activeTab, setActiveTab] = useState(() => {
    const queryTab = searchParams.get('tab');
    if (queryTab) return queryTab;
    if (defaultTab) return defaultTab;
    return user?.role === 'employer' ? 'overview' : 'auth';
  });

  // Auth toggle: 'login' | 'signup'
  const [authMode, setAuthMode] = useState(() => {
    if (defaultTab === 'login') return 'login';
    if (defaultTab === 'signup') return 'signup';
    return 'login';
  });

  // Recruiter multi-step registration & UI controls
  const [authStep, setAuthStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  // ATS View Mode: 'kanban' | 'table'
  const [applicantViewMode, setApplicantViewMode] = useState('kanban');

  // Selected Candidate Drawer State
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  // Loading states
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [submittingJob, setSubmittingJob] = useState(false);
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Data states
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalViews: 0,
    totalApplicants: 0,
    shortlistedCount: 0,
    interviewingCount: 0,
    applicantsThisWeek: 0
  });
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [editingJobId, setEditingJobId] = useState(null);

  // Filters
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');
  const [applicantSearchTerm, setApplicantSearchTerm] = useState('');
  const [applicantJobFilter, setApplicantJobFilter] = useState('all');
  const [applicantStageFilter, setApplicantStageFilter] = useState('all');

  // Auth Form State
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    designation: 'Talent Acquisition Lead',
    website: '',
    phone: '',
    location: 'Bengaluru'
  });

  // Password Strength Calculation
  const passwordStrength = useMemo(() => {
    const pass = authForm.password;
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  }, [authForm.password]);

  // Job Form State
  const [jobForm, setJobForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    fullDescription: '',
    category: 'Tech',
    jobCategoryType: 'software',
    type: 'Full Time',
    workMode: 'On-site',
    qualification: "Bachelor's Degree",
    experience: '1-3 Years',
    salary: '₹8 - 14 LPA',
    location: 'Bengaluru',
    requiredSkills: 'React, TypeScript, Node.js',
    techStack: 'PostgreSQL, Docker, REST APIs',
    benefits: 'Comprehensive health coverage, PF, Flexible schedule, Annual learning budget',
    aboutCompany: '',
    applyType: 'direct',
    applyUrl: '',
    expiryDays: 30,
    isVisible: true
  });

  // Company Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    website: '',
    logo: '',
    location: '',
    designation: '',
    companyDescription: ''
  });

  const isEmployer = user?.role === 'employer';

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('startaply_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Sync activeTab with auth status
  useEffect(() => {
    if (!isEmployer) {
      if (activeTab !== 'auth') {
        setActiveTab('auth');
      }
    } else {
      if (activeTab === 'auth') {
        setActiveTab('overview');
      }
    }
  }, [isEmployer]);

  // Load Employer Data
  const fetchDashboardData = useCallback(async () => {
    if (!isEmployer) return;
    try {
      setLoadingStats(true);
      setLoadingJobs(true);
      setLoadingApplicants(true);

      const headers = getAuthHeaders();

      // Parallel fetch
      const [statsRes, jobsRes, appsRes, profileRes] = await Promise.allSettled([
        axios.get('/api/employers/stats', { headers }),
        axios.get('/api/employers/jobs', { headers }),
        axios.get('/api/employers/applicants', { headers }),
        axios.get('/api/employers/me', { headers })
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data);
      if (appsRes.status === 'fulfilled') setApplicants(appsRes.value.data);

      if (profileRes.status === 'fulfilled') {
        const p = profileRes.value.data;
        setProfileForm({
          name: p.name || '',
          phone: p.phone || '',
          website: p.website || '',
          logo: p.logo || '',
          location: p.location || '',
          designation: p.designation || '',
          companyDescription: p.companyDescription || ''
        });
      }
    } catch (err) {
      console.error('Failed to load employer dashboard:', err);
    } finally {
      setLoadingStats(false);
      setLoadingJobs(false);
      setLoadingApplicants(false);
    }
  }, [isEmployer, getAuthHeaders]);

  useEffect(() => {
    if (isEmployer) {
      fetchDashboardData();
    }
  }, [isEmployer, fetchDashboardData]);

  // ── AUTH HANDLERS ──────────────────────────────────────────
  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    if (authMode === 'signup' && authStep === 1) {
      if (!authForm.name.trim() || !authForm.email.trim() || !authForm.password) {
        toast.error('Please fill in your name, work email, and password.');
        return;
      }
      if (authForm.password.length < 6) {
        toast.error('Password must be at least 6 characters long.');
        return;
      }
      setAuthStep(2);
      return;
    }

    setSubmittingAuth(true);

    try {
      if (authMode === 'login') {
        const res = await axios.post('/api/employers/login', {
          email: authForm.email,
          password: authForm.password
        });
        login(res.data.token, res.data.user);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        setActiveTab('overview');
      } else {
        if (!authForm.companyName.trim()) {
          toast.error('Please enter your company or organization name.');
          setSubmittingAuth(false);
          return;
        }

        const res = await axios.post('/api/employers/signup', {
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
          companyName: authForm.companyName,
          designation: authForm.designation,
          website: authForm.website,
          phone: authForm.phone,
          location: authForm.location || 'Bengaluru'
        });
        login(res.data.token, res.data.user);
        toast.success(`Employer account created for ${res.data.user.companyName}!`);
        setActiveTab('overview');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Authentication failed. Please verify your details.';
      toast.error(msg);
    } finally {
      setSubmittingAuth(false);
    }
  };

  // ── JOB SUBMISSION (POST OR EDIT) ──────────────────────────
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!jobForm.title.trim() || !jobForm.description.trim()) {
      toast.error('Job title and summary description are required.');
      return;
    }

    setSubmittingJob(true);
    try {
      const headers = getAuthHeaders();
      if (editingJobId) {
        await axios.put(`/api/employers/jobs/${editingJobId}`, jobForm, { headers });
        toast.success('Job listing updated successfully!');
      } else {
        await axios.post('/api/employers/jobs', jobForm, { headers });
        toast.success('Job published live to Startaply feed!');
      }

      // Reset form
      setJobForm({
        title: '',
        subtitle: '',
        description: '',
        fullDescription: '',
        category: 'Tech',
        jobCategoryType: 'software',
        type: 'Full Time',
        workMode: 'On-site',
        qualification: "Bachelor's Degree",
        experience: '1-3 Years',
        salary: '₹8 - 14 LPA',
        location: user?.location || 'Bengaluru',
        requiredSkills: 'React, TypeScript, Node.js',
        techStack: 'PostgreSQL, Docker, REST APIs',
        benefits: 'Comprehensive health coverage, PF, Flexible schedule, Annual learning budget',
        aboutCompany: '',
        applyType: 'direct',
        applyUrl: '',
        expiryDays: 30,
        isVisible: true
      });
      setEditingJobId(null);
      fetchDashboardData();
      setActiveTab('jobs');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save job listing.');
    } finally {
      setSubmittingJob(false);
    }
  };

  const handleEditJob = (job) => {
    setEditingJobId(job.id);
    setJobForm({
      title: job.title || '',
      subtitle: job.subtitle || '',
      description: job.description || '',
      fullDescription: job.fullDescription || job.description || '',
      category: job.category || 'Tech',
      jobCategoryType: job.jobCategoryType || 'software',
      type: job.type || 'Full Time',
      workMode: job.workMode || 'On-site',
      qualification: job.qualification || "Bachelor's Degree",
      experience: job.experience || '1-3 Years',
      salary: job.salary || '₹8 - 14 LPA',
      location: job.location || '',
      requiredSkills: job.requiredSkills || '',
      techStack: job.techStack || '',
      benefits: job.benefits || '',
      aboutCompany: job.aboutCompany || '',
      applyType: job.applyType || 'direct',
      applyUrl: job.applyUrl || '',
      expiryDays: job.expiryDays || 30,
      isVisible: job.isVisible
    });
    setActiveTab('post');
  };

  const handleToggleJobVisibility = async (job) => {
    try {
      const headers = getAuthHeaders();
      const updatedStatus = !job.isVisible;
      await axios.put(`/api/employers/jobs/${job.id}`, { isVisible: updatedStatus }, { headers });
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, isVisible: updatedStatus } : j));
      toast.success(updatedStatus ? 'Job activated on candidate feed' : 'Job paused from candidate feed');
    } catch (err) {
      toast.error('Failed to change job status.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing? This action cannot be undone.')) {
      return;
    }
    try {
      const headers = getAuthHeaders();
      await axios.delete(`/api/employers/jobs/${jobId}`, { headers });
      setJobs(prev => prev.filter(j => j.id !== jobId));
      toast.success('Job listing removed.');
    } catch (err) {
      toast.error('Failed to delete job listing.');
    }
  };

  const handleCopyJobLink = (job) => {
    const shareUrl = `${window.location.origin}/jobs?search=${encodeURIComponent(job.title)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Shareable candidate link copied to clipboard!');
    }).catch(() => {
      toast.success(`Job link: ${shareUrl}`);
    });
  };

  // ── APPLICANT STAGE UPDATE ─────────────────────────────────
  const handleUpdateApplicantStage = async (applicantId, newStage) => {
    try {
      const headers = getAuthHeaders();
      await axios.put(`/api/employers/applicants/${applicantId}/stage`, { stage: newStage }, { headers });
      setApplicants(prev => prev.map(a => a.id === applicantId ? { ...a, stage: newStage } : a));
      if (selectedApplicant && selectedApplicant.id === applicantId) {
        setSelectedApplicant(prev => ({ ...prev, stage: newStage }));
      }
      toast.success(`Candidate moved to ${newStage}`);
    } catch (err) {
      toast.error('Failed to update stage.');
    }
  };

  // Export Applicants to CSV
  const handleExportCSV = () => {
    if (applicants.length === 0) {
      toast.error('No applicants to export.');
      return;
    }

    const headers = ['Applicant Name', 'Email', 'Phone', 'Applied Role', 'City', 'Stage', 'Applied Date', 'Resume Link'];
    const rows = applicants.map(a => [
      `"${a.name || ''}"`,
      `"${a.email || ''}"`,
      `"${a.phone || ''}"`,
      `"${a.jobTitle || ''}"`,
      `"${a.city || ''}"`,
      `"${a.stage || 'Under Review'}"`,
      `"${new Date(a.appliedAt).toLocaleDateString()}"`,
      `"${a.resume || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `startaply_applicants_${user?.companyName || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Applicant roster exported to CSV.');
  };

  // ── UPDATE COMPANY PROFILE ─────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = getAuthHeaders();
      await axios.put('/api/employers/profile', profileForm, { headers });
      toast.success('Company & recruiter profile updated!');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to update profile.');
    }
  };

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchesSearch = !jobSearchTerm ||
        j.title?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
        j.location?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
        j.category?.toLowerCase().includes(jobSearchTerm.toLowerCase());

      const matchesStatus =
        jobStatusFilter === 'all' ? true :
        jobStatusFilter === 'active' ? j.isVisible :
        !j.isVisible;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, jobSearchTerm, jobStatusFilter]);

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    return applicants.filter(a => {
      const term = applicantSearchTerm.toLowerCase();
      const matchesSearch = !term ||
        a.name?.toLowerCase().includes(term) ||
        a.email?.toLowerCase().includes(term) ||
        a.phone?.toLowerCase().includes(term) ||
        a.jobTitle?.toLowerCase().includes(term);

      const matchesJob = applicantJobFilter === 'all' || a.jobId === applicantJobFilter;
      const matchesStage = applicantStageFilter === 'all' || (a.stage || 'Under Review') === applicantStageFilter;

      return matchesSearch && matchesJob && matchesStage;
    });
  }, [applicants, applicantSearchTerm, applicantJobFilter, applicantStageFilter]);

  // Distinct jobs for applicant filter
  const distinctJobOptions = useMemo(() => {
    const map = new Map();
    jobs.forEach(j => map.set(j.id, j.title));
    return Array.from(map.entries());
  }, [jobs]);

  // Stage counts for Funnel
  const stageCounts = useMemo(() => {
    const map = {
      'Under Review': 0,
      'Shortlisted': 0,
      'Interview Scheduled': 0,
      'Offer Extended': 0,
      'Hired': 0,
      'Rejected': 0
    };
    applicants.forEach(a => {
      const st = a.stage || 'Under Review';
      if (map[st] !== undefined) map[st]++;
      else map['Under Review']++;
    });
    return map;
  }, [applicants]);

  // ══════════════════════════════════════════════════════════
  // RENDER: PROFESSIONAL RECRUITER & EMPLOYER AUTH VIEW
  // ══════════════════════════════════════════════════════════
  if (!isEmployer) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 selection:bg-brand selection:text-white transition-colors duration-200">

        {/* Clean Enterprise Header */}
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#070B14]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2" aria-label="Startaply Home">
                <BrandLogo variant="horizontal" height={28} />
              </Link>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Recruiter Workspace
              </span>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                Candidate Sign In →
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Layout */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">

            {/* Left Column: Authentic Recruiter Platform Context */}
            <div className="lg:col-span-6 space-y-6 lg:pr-4">

              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-widest bg-brand/10 text-brand border border-brand/20">
                  <Briefcase size={13} />
                  <span>Direct Hiring Platform</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.12]">
                  Hire pre-verified talent directly. <br />
                  <span className="text-brand">Zero intermediary commission.</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                  Publish requisitions to thousands of candidates across engineering, product, corporate operations, and delivery fleets. Screen applications directly with our built-in applicant tracking pipeline.
                </p>
              </div>

              {/* Realistic Recruiter Requisition Mockup Card */}
              <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Requisition Snapshot</span>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                      Senior Full-Stack Engineer
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">Bengaluru • Hybrid • ₹14 - 22 LPA</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                    Active Sourcing
                  </span>
                </div>

                {/* Candidate Pipeline Rows */}
                <div className="space-y-2.5">
                  {[
                    { name: 'Aditi Rao', sub: 'B.Tech (CSE) • React, Node.js, PostgreSQL', stage: 'Shortlisted', badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
                    { name: 'Karthik Menon', sub: '3.5 yrs Exp • Distributed Systems, Go, Docker', stage: 'Interviewing', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
                    { name: 'Sameer Khan', sub: 'Immediate Joiner • Operations & Logistics Lead', stage: 'Under Review', badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' }
                  ].map((cand, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                          {cand.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{cand.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{cand.sub}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border shrink-0 ${cand.badge}`}>
                        {cand.stage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Real Proof Points */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                {[
                  { title: '< 24 Hours', desc: 'Average time to first verified applicant' },
                  { title: '100% Direct', desc: 'Direct corporate candidate pipeline' },
                  { title: 'Built-in ATS', desc: 'Stage tracking and pipeline management' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-base font-black text-slate-950 dark:text-white">{item.title}</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">{item.desc}</div>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Column: Professional Enterprise Auth Form Card */}
            <div className="lg:col-span-6">
              <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none">

                {/* Segmented Auth Mode Switcher */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthStep(1);
                    }}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                      authMode === 'login'
                        ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Recruiter Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthStep(1);
                    }}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                      authMode === 'signup'
                        ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Register Organization
                  </button>
                </div>

                {/* Form Header */}
                <div className="mb-5">
                  <h3 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                    {authMode === 'login'
                      ? 'Sign in to Recruiter Workspace'
                      : authStep === 1
                        ? 'Recruiter Profile Setup'
                        : 'Organization & Hiring Location'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                    {authMode === 'login'
                      ? 'Access your active requisitions, applicant pipeline, and company profile.'
                      : authStep === 1
                        ? 'Step 1 of 2: Create your official hiring lead credentials.'
                        : 'Step 2 of 2: Set up your company entity for candidate visibility.'}
                  </p>

                  {/* 2-Step Progress Indicator for Signup */}
                  {authMode === 'signup' && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className={`h-1.5 flex-1 rounded-full transition-all ${authStep >= 1 ? 'bg-brand' : 'bg-slate-200 dark:bg-slate-700'}`} />
                      <div className={`h-1.5 flex-1 rounded-full transition-all ${authStep >= 2 ? 'bg-brand' : 'bg-slate-200 dark:bg-slate-700'}`} />
                      <span className="text-[11px] font-bold text-slate-500 ml-1">
                        Step {authStep} of 2
                      </span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">

                  {/* ── MODE: SIGN IN ──────────────────────────────── */}
                  {authMode === 'login' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Official Work Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            required
                            placeholder="name@company.com"
                            value={authForm.email}
                            onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Password <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Enter your password"
                            value={authForm.password}
                            onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                            className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand" />
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Keep me signed in</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingAuth}
                        className="w-full h-11 px-5 mt-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-bold shadow-md shadow-brand/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {submittingAuth ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Sign In to Recruiter Workspace</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </>
                  )}

                  {/* ── MODE: SIGN UP (STEP 1: RECRUITER PROFILE) ──── */}
                  {authMode === 'signup' && authStep === 1 && (
                    <>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Priya Sharma"
                            value={authForm.name}
                            onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Recruiter Designation <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Talent Acquisition Lead"
                          value={authForm.designation}
                          onChange={e => setAuthForm({ ...authForm, designation: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none transition-all"
                        />
                        {/* Quick Designation Chips */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {RECRUITER_ROLES.map(role => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => setAuthForm({ ...authForm, designation: role })}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                                authForm.designation === role
                                  ? 'bg-brand/10 text-brand border-brand/30'
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Official Work Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            required
                            placeholder="priya@company.com"
                            value={authForm.email}
                            onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            placeholder="Minimum 6 characters"
                            value={authForm.password}
                            onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                            className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>

                        {/* Password strength bar */}
                        {authForm.password && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-slate-500">Strength</span>
                              <span className={passwordStrength.score >= 75 ? 'text-emerald-500' : 'text-amber-500'}>
                                {passwordStrength.label}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                style={{ width: `${passwordStrength.score}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full h-11 px-5 mt-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-bold shadow-md shadow-brand/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Continue to Organization Setup</span>
                        <ArrowRight size={16} />
                      </button>
                    </>
                  )}

                  {/* ── MODE: SIGN UP (STEP 2: ORGANIZATION SETUP) ─── */}
                  {authMode === 'signup' && authStep === 2 && (
                    <>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Company / Organization Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Acme Technologies Inc."
                            value={authForm.companyName}
                            onChange={e => setAuthForm({ ...authForm, companyName: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Headquarters / Primary Hiring Location <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Bengaluru, Karnataka"
                            value={authForm.location}
                            onChange={e => setAuthForm({ ...authForm, location: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none transition-all"
                          />
                        </div>
                        {/* Quick City Chips */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {POPULAR_HUBS.map(city => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => setAuthForm({ ...authForm, location: city })}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                                authForm.location === city
                                  ? 'bg-brand/10 text-brand border-brand/30'
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                              }`}
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Company Website
                          </label>
                          <div className="relative">
                            <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="url"
                              placeholder="https://company.com"
                              value={authForm.website}
                              onChange={e => setAuthForm({ ...authForm, website: e.target.value })}
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Contact Phone
                          </label>
                          <div className="relative">
                            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="tel"
                              placeholder="+91 98765 43210"
                              value={authForm.phone}
                              onChange={e => setAuthForm({ ...authForm, phone: e.target.value })}
                              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setAuthStep(1)}
                          className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ArrowLeft size={15} />
                          <span>Back</span>
                        </button>

                        <button
                          type="submit"
                          disabled={submittingAuth}
                          className="flex-1 h-11 px-5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold shadow-md shadow-brand/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {submittingAuth ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <span>Complete Registration & Access Portal</span>
                              <CheckCircle2 size={16} />
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}

                </form>

                {/* Candidate Redirection */}
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-xs text-slate-500 font-medium">
                    Looking for job opportunities or career preparation?{' '}
                    <Link to="/login" className="text-brand hover:underline font-bold">
                      Sign in as Candidate →
                    </Link>
                  </p>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // RENDER: AUTHENTICATED EMPLOYER DASHBOARD
  // ══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#F4F6FB] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 selection:bg-brand selection:text-white transition-colors duration-200 pb-24">

      {/* Top Portal Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#070B14]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5" aria-label="Startaply Home">
              <BrandLogo variant="horizontal" height={26} />
            </Link>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand to-indigo-600 border border-brand/20 flex items-center justify-center text-xs font-black text-white shadow-xs">
                {user?.companyName?.charAt(0) || 'E'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {user?.companyName || 'Recruiter Workspace'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {user?.name} • {user?.designation || 'Talent Acquisition'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setEditingJobId(null);
                setActiveTab('post');
              }}
              className="h-9 px-3.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle size={14} />
              <span className="hidden sm:inline">Post Requisition</span>
              <span className="sm:hidden">Post</span>
            </button>

            <ThemeToggle />

            <button
              onClick={logout}
              title="Sign Out of Recruiter Workspace"
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Portal Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-slate-800/60 py-2">
          {[
            { id: 'overview', label: 'Dashboard & Pipeline', icon: TrendingUp },
            { id: 'jobs', label: `Open Requisitions (${jobs.length})`, icon: Briefcase },
            { id: 'post', label: editingJobId ? 'Edit Requisition' : 'Post Requisition', icon: PlusCircle },
            { id: 'applicants', label: `Applicant Tracking (${applicants.length})`, icon: Users },
            { id: 'profile', label: 'Corporate Profile', icon: Building2 }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">

        {/* ────────────────────────────────────────────────────────
            TAB 1: BESPOKE RECRUITER OVERVIEW & FUNNEL ANALYTICS
        ──────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">

            {/* Recruiter Executive Banner */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 dark:from-slate-900 dark:via-black dark:to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-white text-[11px] font-black uppercase tracking-wider border border-white/10">
                  <Building2 size={12} className="text-brand" />
                  <span>{user?.companyName} • Talent Gateway</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Talent Operations Center
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
                  Active requisitions are matched in real time with pre-verified candidates across web and campus mega drives. All candidate submissions sync directly with Startaply operations.
                </p>
              </div>

              {/* Fast Action Cluster */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => {
                    setEditingJobId(null);
                    setActiveTab('post');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle size={15} />
                  <span>New Requisition</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Active Requisitions', val: stats.activeJobs, sub: `${stats.totalJobs} Total Created`, icon: Briefcase, color: 'text-brand' },
                { label: 'Total Inflow', val: stats.totalApplicants, sub: `${stats.applicantsThisWeek} This Week`, icon: Users, color: 'text-emerald-500' },
                { label: 'Shortlisted & Interviewing', val: (stats.shortlistedCount + stats.interviewingCount), sub: `${stats.shortlistedCount} Shortlisted`, icon: Award, color: 'text-purple-500' },
                { label: 'Job Impressions', val: stats.totalViews, sub: 'Live Candidate Reach', icon: Eye, color: 'text-blue-500' }
              ].map((m, i) => {
                const Icon = m.icon;
                return (
                  <div key={i} className="bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{m.label}</span>
                      <Icon size={16} className={m.color} />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                      {loadingStats ? '...' : m.val}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">{m.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* ATS Visual Pipeline Conversion Funnel */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-brand" />
                    <span>Recruiter Pipeline Funnel</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Candidate progression breakdown across your hiring stages.</p>
                </div>
                <button
                  onClick={() => setActiveTab('applicants')}
                  className="text-xs font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full ATS Pipeline</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Funnel Stage Progress Meter */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
                {[
                  { stage: 'Under Review', count: stageCounts['Under Review'], color: 'bg-slate-500' },
                  { stage: 'Shortlisted', count: stageCounts['Shortlisted'], color: 'bg-indigo-500' },
                  { stage: 'Interview Scheduled', count: stageCounts['Interview Scheduled'], color: 'bg-purple-500' },
                  { stage: 'Offer Extended', count: stageCounts['Offer Extended'], color: 'bg-blue-500' },
                  { stage: 'Hired', count: stageCounts['Hired'], color: 'bg-emerald-500' }
                ].map((st, idx) => {
                  const pct = stats.totalApplicants > 0 ? Math.round((st.count / stats.totalApplicants) * 100) : 0;
                  return (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{st.stage}</span>
                        <span className="font-black text-slate-900 dark:text-white ml-2">{st.count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${st.color} transition-all duration-300`} style={{ width: `${Math.max(pct, st.count > 0 ? 10 : 0)}%` }} />
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium text-right">{pct}% of inflow</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Requisitions & Recent Candidate Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Active Requisitions Snapshot */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                    <Briefcase size={18} className="text-brand" />
                    <span>Top Active Requisitions</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="text-xs font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage All ({jobs.length})</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {jobs.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <Briefcase size={32} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-xs text-slate-500 font-bold">No requisitions published yet.</p>
                    <button
                      onClick={() => setActiveTab('post')}
                      className="mt-3 px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold cursor-pointer"
                    >
                      Post First Requisition
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {jobs.slice(0, 5).map(job => (
                      <div key={job.id} className="py-3.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{job.title}</h4>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {job.location} • {job.workMode} • {job.salary}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setApplicantJobFilter(job.id);
                              setActiveTab('applicants');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-brand transition-colors cursor-pointer"
                          >
                            {job.applicationCount || 0} Applicants →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Applicants Inflow Stream */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                    <Users size={18} className="text-brand" />
                    <span>Recent Submissions</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('applicants')}
                    className="text-xs font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All ({applicants.length})</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {applicants.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <Users size={32} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-xs text-slate-500 font-bold">No candidate submissions yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {applicants.slice(0, 5).map(app => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedApplicant(app)}
                        className="py-3 flex items-center justify-between gap-3 cursor-pointer group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 -mx-2 px-2 rounded-xl transition-colors"
                      >
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-brand transition-colors">
                            {app.name}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">{app.jobTitle} • {app.city || 'India'}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                          {app.stage || 'Under Review'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ────────────────────────────────────────────────────────
            TAB 2: MY JOBS (MANAGE REQUISITIONS)
        ──────────────────────────────────────────────────────── */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                  Corporate Requisitions ({jobs.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Active, paused, and archived openings visible to candidates and internal operational managers.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingJobId(null);
                  setActiveTab('post');
                }}
                className="h-10 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle size={15} />
                <span>Post New Requisition</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by requisition title, location, category..."
                  value={jobSearchTerm}
                  onChange={e => setJobSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={jobStatusFilter}
                  onChange={e => setJobStatusFilter(e.target.value)}
                  className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-brand"
                >
                  <option value="all">All Requisitions ({jobs.length})</option>
                  <option value="active">Active Only</option>
                  <option value="paused">Paused Only</option>
                </select>
              </div>
            </div>

            {/* Requisition Cards */}
            {filteredJobs.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <Briefcase size={40} className="mx-auto text-slate-400 mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No requisitions found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {jobSearchTerm ? 'Try adjusting your search query.' : 'Publish your first requisition to start sourcing candidates.'}
                </p>
                {!jobSearchTerm && (
                  <button
                    onClick={() => setActiveTab('post')}
                    className="mt-4 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold cursor-pointer"
                  >
                    Post Requisition Now
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map(job => (
                  <div
                    key={job.id}
                    className="bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                          job.isVisible
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}>
                          {job.isVisible ? 'Live on Candidate Feed' : 'Paused Listing'}
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {job.category} • {job.type} • {job.workMode}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                        {job.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <MapPin size={13} className="text-slate-400" /> {job.location || 'India'}
                        </span>
                        <span>•</span>
                        <span>{job.experience || 'Experience scaled'}</span>
                        <span>•</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{job.salary || 'Competitive'}</span>
                      </div>
                    </div>

                    {/* Stats & Recruiter Action Cluster */}
                    <div className="flex items-center gap-3 shrink-0 flex-wrap pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold">
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400" title="Job Card Views">
                          <Eye size={13} /> {job.views || 0} views
                        </span>
                        <span className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
                        <span className="flex items-center gap-1 text-brand font-bold" title="Candidate Applicants">
                          <Users size={13} /> {job.applicationCount || 0} applied
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setApplicantJobFilter(job.id);
                            setActiveTab('applicants');
                          }}
                          className="px-3 py-2 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold transition-colors cursor-pointer"
                        >
                          Review Applicants
                        </button>

                        <button
                          onClick={() => handleCopyJobLink(job)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                          title="Copy Shareable Job Link"
                        >
                          <Share2 size={15} />
                        </button>

                        <button
                          onClick={() => handleToggleJobVisibility(job)}
                          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                        >
                          {job.isVisible ? 'Pause' : 'Activate'}
                        </button>

                        <button
                          onClick={() => handleEditJob(job)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                          title="Edit Requisition"
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Requisition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ────────────────────────────────────────────────────────
            TAB 3: POST OR EDIT REQUISITION WITH LIVE FEED PREVIEW
        ──────────────────────────────────────────────────────── */}
        {activeTab === 'post' && (
          <div className="space-y-6">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                  {editingJobId ? 'Edit Requisition' : 'Create & Publish Requisition'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {editingJobId
                    ? 'Update details. Changes sync immediately to the live candidate discovery feed.'
                    : `Sourcing talent under ${user?.companyName}. Candidates apply directly to your ATS pipeline.`}
                </p>
              </div>

              {editingJobId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingJobId(null);
                    setActiveTab('jobs');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Split Grid: Form (Left) & Real-Time Live Job Card Preview (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Form Section */}
              <form onSubmit={handleJobSubmit} className="lg:col-span-7 bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">

                {/* 1. Core Role Information */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand">1. Requisition Core Details</h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Role Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Frontend React Engineer"
                      value={jobForm.title}
                      onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={jobForm.category}
                        onChange={e => setJobForm({ ...jobForm, category: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none cursor-pointer"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Employment Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={jobForm.type}
                        onChange={e => setJobForm({ ...jobForm, type: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none cursor-pointer"
                      >
                        {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Work Mode <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={jobForm.workMode}
                        onChange={e => setJobForm({ ...jobForm, workMode: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none cursor-pointer"
                      >
                        {WORK_MODES.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Location (City) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bengaluru, Karnataka"
                        value={jobForm.location}
                        onChange={e => setJobForm({ ...jobForm, location: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Experience Range <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1-3 Years"
                        value={jobForm.experience}
                        onChange={e => setJobForm({ ...jobForm, experience: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Salary Band / CTC <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₹8 - 14 LPA"
                        value={jobForm.salary}
                        onChange={e => setJobForm({ ...jobForm, salary: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Skills & Candidate Profile */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand">2. Requirements & Job Context</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Required Skills (Comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. React.js, TypeScript, PostgreSQL"
                        value={jobForm.requiredSkills}
                        onChange={e => setJobForm({ ...jobForm, requiredSkills: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Tech Stack / Tools
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Node.js, Docker, Git"
                        value={jobForm.techStack}
                        onChange={e => setJobForm({ ...jobForm, techStack: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Short Role Summary (Card Highlight) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Concise 1-2 sentence overview shown directly on the candidate feed cards..."
                      value={jobForm.description}
                      onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Comprehensive Job Description
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Detailed responsibilities, expectations, day-to-day workflow..."
                      value={jobForm.fullDescription}
                      onChange={e => setJobForm({ ...jobForm, fullDescription: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Corporate Perks & Benefits
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Health insurance, PF, Flexible schedule, Annual learning budget"
                      value={jobForm.benefits}
                      onChange={e => setJobForm({ ...jobForm, benefits: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none"
                    />
                  </div>
                </div>

                {/* 3. Application Gateway */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand">3. Sourcing Gateway & Publishing</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Application Method
                      </label>
                      <select
                        value={jobForm.applyType}
                        onChange={e => setJobForm({ ...jobForm, applyType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none cursor-pointer"
                      >
                        <option value="direct">Direct 1-Click Apply on Startaply (ATS)</option>
                        <option value="external">External Career Portal URL</option>
                      </select>
                    </div>

                    {jobForm.applyType === 'external' ? (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                          External Career URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="url"
                          required
                          placeholder="https://company.com/careers/job-123"
                          value={jobForm.applyUrl}
                          onChange={e => setJobForm({ ...jobForm, applyUrl: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                          Expiry Window (Days)
                        </label>
                        <input
                          type="number"
                          min={7}
                          max={90}
                          value={jobForm.expiryDays}
                          onChange={e => setJobForm({ ...jobForm, expiryDays: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="isVisibleCheckbox"
                      checked={jobForm.isVisible}
                      onChange={e => setJobForm({ ...jobForm, isVisible: e.target.checked })}
                      className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
                    />
                    <label htmlFor="isVisibleCheckbox" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Publish immediately to the active candidate feed
                    </label>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingJobId(null);
                      setActiveTab('jobs');
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingJob}
                    className="h-11 px-6 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-bold shadow-md shadow-brand/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingJob ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{editingJobId ? 'Save Changes' : 'Publish Requisition'}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>

              </form>

              {/* Real-Time Live Feed Card Preview (Unique Recruiter Feature) */}
              <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-brand">
                    <Eye size={14} />
                    <span>Live Candidate Feed Preview</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Real-Time</span>
                </div>

                {/* The Simulated Card as Candidates See It */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-lg shadow-slate-200/40 dark:shadow-none space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-lg font-black text-brand shrink-0">
                        {user?.companyName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                          {jobForm.title || 'Role Title Placeholder'}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {user?.companyName || 'Company Name'} • {jobForm.location || 'Location'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                    {jobForm.description || 'Your concise summary description will highlight key candidate expectations right here.'}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {jobForm.workMode}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {jobForm.type}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {jobForm.experience || '1-3 Yrs'}
                    </span>
                  </div>

                  {jobForm.requiredSkills && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {jobForm.requiredSkills.split(',').slice(0, 4).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-brand/10 text-brand border border-brand/20">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {jobForm.salary || 'Competitive Pay'}
                    </div>

                    <div className="h-9 px-4 rounded-xl bg-brand text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
                      <span>Apply Now</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 font-medium">
                  💡 <strong>Recruiter Tip:</strong> Clear salary bands and specific skill requirements increase qualified candidate applications by over 60%.
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ────────────────────────────────────────────────────────
            TAB 4: APPLICANT TRACKING PIPELINE (KANBAN & TABLE ATS)
        ──────────────────────────────────────────────────────── */}
        {activeTab === 'applicants' && (
          <div className="space-y-6">

            {/* ATS Header & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                  Applicant Tracking Pipeline ({filteredApplicants.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Track candidates across interview stages, inspect resumes, and communicate directly.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* View Switcher: Kanban vs Table */}
                <div className="flex items-center p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setApplicantViewMode('kanban')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      applicantViewMode === 'kanban'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Kanban size={14} />
                    <span>Board View</span>
                  </button>
                  <button
                    onClick={() => setApplicantViewMode('table')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      applicantViewMode === 'table'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <TableIcon size={14} />
                    <span>Table View</span>
                  </button>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search candidates by name, email, phone, applied position..."
                  value={applicantSearchTerm}
                  onChange={e => setApplicantSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={applicantJobFilter}
                  onChange={e => setApplicantJobFilter(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-brand"
                >
                  <option value="all">All Requisitions ({jobs.length})</option>
                  {distinctJobOptions.map(([id, title]) => (
                    <option key={id} value={id}>{title}</option>
                  ))}
                </select>

                <select
                  value={applicantStageFilter}
                  onChange={e => setApplicantStageFilter(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-brand"
                >
                  <option value="all">All Stages</option>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* ── ATS VIEW 1: KANBAN BOARD ──────────────────────── */}
            {applicantViewMode === 'kanban' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
                {STAGES.map(stage => {
                  const stageApps = filteredApplicants.filter(a => (a.stage || 'Under Review') === stage);
                  return (
                    <div key={stage} className="bg-slate-100/70 dark:bg-slate-900/40 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 space-y-3 min-h-[400px]">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{stage}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                          {stageApps.length}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {stageApps.map(app => (
                          <div
                            key={app.id}
                            onClick={() => setSelectedApplicant(app)}
                            className="bg-white dark:bg-slate-800/90 rounded-xl p-3 border border-slate-200/90 dark:border-slate-700 shadow-xs hover:border-brand/40 dark:hover:border-brand/40 transition-all cursor-pointer group space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors line-clamp-1">
                                {app.name}
                              </h4>
                              {app.resume && (
                                <FileText size={13} className="text-brand shrink-0" title="Resume attached" />
                              )}
                            </div>

                            <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                              {app.jobTitle}
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                              <span>{app.city || 'India'}</span>
                              <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}

                        {stageApps.length === 0 && (
                          <div className="py-8 text-center text-[11px] text-slate-400 font-medium">
                            No candidates
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── ATS VIEW 2: DATA TABLE ────────────────────────── */}
            {applicantViewMode === 'table' && (
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="px-5 py-3.5">Candidate</th>
                        <th className="px-5 py-3.5">Applied Position</th>
                        <th className="px-5 py-3.5">Contact Details</th>
                        <th className="px-5 py-3.5">Pipeline Stage</th>
                        <th className="px-5 py-3.5 text-center">Applied On</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                      {filteredApplicants.map(app => (
                        <tr
                          key={app.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => setSelectedApplicant(app)}
                        >
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900 dark:text-white">{app.name}</div>
                            {app.city && (
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin size={11} /> {app.city}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{app.jobTitle}</div>
                            <div className="text-[11px] text-slate-500">{app.jobLocation || 'India'}</div>
                          </td>

                          <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                            <div className="font-medium text-slate-700 dark:text-slate-300">{app.email}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{app.phone || 'No Phone'}</div>
                          </td>

                          <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                            <select
                              value={app.stage || 'Under Review'}
                              onChange={e => handleUpdateApplicantStage(app.id, e.target.value)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer focus:border-brand"
                            >
                              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>

                          <td className="px-5 py-4 text-center text-slate-500 text-xs whitespace-nowrap">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </td>

                          <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              {app.resume && (
                                <a
                                  href={app.resume}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-brand"
                                  title="View Resume / Portfolio"
                                >
                                  <FileText size={15} />
                                </a>
                              )}
                              <a
                                href={`mailto:${app.email}?subject=${encodeURIComponent(`Update on application for ${app.jobTitle} at ${user?.companyName}`)}`}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                                title="Email Candidate"
                              >
                                <Mail size={15} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {filteredApplicants.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <Users size={40} className="mx-auto text-slate-400 mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No candidate submissions found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Active requisitions will collect verified candidate profiles into this pipeline.
                </p>
              </div>
            )}

          </div>
        )}

        {/* ────────────────────────────────────────────────────────
            TAB 5: CORPORATE PROFILE
        ──────────────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto space-y-6">

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                Corporate & Recruiter Profile
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Public organization branding and hiring identity visible to prospective candidates.
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">

              <div className="flex items-center gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-2xl font-black text-brand overflow-hidden">
                  {profileForm.logo ? (
                    <img src={profileForm.logo} alt={user?.companyName} className="w-full h-full object-cover" />
                  ) : (
                    user?.companyName?.charAt(0) || 'C'
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.companyName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{user?.email} • Verified Recruiter Account</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Recruiter Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={profileForm.designation}
                    onChange={e => setProfileForm({ ...profileForm, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Direct Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Headquarters / Office Location
                  </label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Company Website URL
                  </label>
                  <input
                    type="url"
                    value={profileForm.website}
                    onChange={e => setProfileForm({ ...profileForm, website: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Logo Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={profileForm.logo}
                    onChange={e => setProfileForm({ ...profileForm, logo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  About Company & Culture
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your organization, mission, engineering team size, culture..."
                  value={profileForm.companyDescription}
                  onChange={e => setProfileForm({ ...profileForm, companyDescription: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:border-brand outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold shadow-md shadow-brand/20 active:scale-95 transition-all cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>

            </form>

          </div>
        )}

      </main>

      {/* ────────────────────────────────────────────────────────
          CANDIDATE DETAIL DRAWER MODAL (POPUP)
      ──────────────────────────────────────────────────────── */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand to-indigo-600 text-white font-black text-base flex items-center justify-center shrink-0">
                  {selectedApplicant.name?.split(' ').map(n => n[0]).join('') || 'C'}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white leading-tight">
                    {selectedApplicant.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Applied for {selectedApplicant.jobTitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedApplicant(null)}
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Candidate Metadata */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-500">Hiring Stage</span>
                <select
                  value={selectedApplicant.stage || 'Under Review'}
                  onChange={e => handleUpdateApplicantStage(selectedApplicant.id, e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 outline-none cursor-pointer focus:border-brand"
                >
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</span>
                  <div className="font-bold text-slate-900 dark:text-white truncate">{selectedApplicant.email}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</span>
                  <div className="font-bold text-slate-900 dark:text-white truncate">{selectedApplicant.phone || 'N/A'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</span>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedApplicant.city || 'India'}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Applied Date</span>
                  <div className="font-bold text-slate-900 dark:text-white">{new Date(selectedApplicant.appliedAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              {selectedApplicant.resume && (
                <a
                  href={selectedApplicant.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-10 px-3 rounded-xl bg-brand text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileText size={14} />
                  <span>View Resume</span>
                </a>
              )}
              <a
                href={`mailto:${selectedApplicant.email}?subject=${encodeURIComponent(`Interview update for ${selectedApplicant.jobTitle} at ${user?.companyName}`)}`}
                className="flex-1 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
              >
                <Mail size={14} />
                <span>Email</span>
              </a>
              {selectedApplicant.phone && (
                <a
                  href={`tel:${selectedApplicant.phone}`}
                  className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-emerald-600 dark:text-emerald-400"
                  title="Call candidate"
                >
                  <Phone size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployerPortal;
