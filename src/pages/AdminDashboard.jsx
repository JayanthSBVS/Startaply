import React, { useState } from 'react';
import {
  LayoutDashboard, PlusCircle, Briefcase, Trash2, Edit2,
  Check, X, ChevronLeft, LogOut, Upload, MessageSquare
} from 'lucide-react';
import { useJobs } from '../context/JobsContext';

const INITIAL_FORM = {
  title: '',
  company: '',
  companyColor: '#16a34a',
  companyLogo: null,
  location: '',
  salary: '',
  jobCategory: '',
  type: '',
  mode: '',
  experience: '',
  qualification: '',
  expiryDays: '30',
  description: '',
  fullDescription: '',
  requiredSkills: '',
  techStack: '',
  aboutCompany: '',
  benefits: '',
};

const INITIAL_QNA_FORM = {
  question: '',
  answer: '',
  category: '',
};

const Field = ({ label, children, required }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition";
const textareaCls = `${inputCls} resize-none`;
const selectCls = `${inputCls} cursor-pointer`;

const AdminDashboard = () => {
  const { jobs, addJob, deleteJob, updateJob, qnas, addQna, deleteQna, updateQna } = useJobs();
  const [activeTab, setActiveTab] = useState('add');
  const [form, setForm] = useState(INITIAL_FORM);
  const [qnaForm, setQnaForm] = useState(INITIAL_QNA_FORM);
  const [successMsg, setSuccessMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingQnaId, setEditingQnaId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteQnaConfirm, setDeleteQnaConfirm] = useState(null);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleChange('companyLogo', ev.target.result);
    reader.readAsDataURL(file);
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSubmit = () => {
    if (!form.title || !form.company || !form.jobCategory) {
      alert('Please fill in required fields: Job Title, Company, and Job Category');
      return;
    }

    if (editingId) {
      updateJob(editingId, form);
      setSuccessMsg('Job updated successfully!');
      setEditingId(null);
    } else {
      addJob(form);
      setSuccessMsg('Job added successfully!');
    }

    setForm(INITIAL_FORM);
    setTimeout(() => setSuccessMsg(''), 3000);
    setActiveTab('manage');
  };

  const handleEdit = (job) => {
    setForm({
      title: job.title || '',
      company: job.company || '',
      companyColor: job.companyColor || '#16a34a',
      companyLogo: job.companyLogo || null,
      location: job.location || '',
      salary: job.salary || '',
      jobCategory: job.jobCategory || '',
      type: job.type || '',
      mode: job.mode || '',
      experience: job.experience || '',
      qualification: job.qualification || '',
      expiryDays: job.expiryDays?.toString() || '30',
      description: job.description || '',
      fullDescription: job.fullDescription || '',
      requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : (job.requiredSkills || ''),
      techStack: Array.isArray(job.techStack) ? job.techStack.join(', ') : (job.techStack || ''),
      aboutCompany: job.aboutCompany || '',
      benefits: Array.isArray(job.benefits) ? job.benefits.join(', ') : (job.benefits || ''),
    });
    setEditingId(job.id);
    setActiveTab('add');
    setIsMobileMenuOpen(false);
  };

  const handleDelete = (id) => {
    deleteJob(id);
    setDeleteConfirm(null);
    setSuccessMsg('Job deleted.');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleQnaChange = (key, value) => {
    setQnaForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleQnaSubmit = () => {
    if (!qnaForm.question || !qnaForm.answer || !qnaForm.category) {
      alert('Please fill in required fields: Question, Answer, and Category');
      return;
    }
    if (editingQnaId) {
      updateQna(editingQnaId, qnaForm);
      setSuccessMsg('Q&A updated successfully!');
      setEditingQnaId(null);
    } else {
      addQna(qnaForm);
      setSuccessMsg('Q&A added successfully!');
    }
    setQnaForm(INITIAL_QNA_FORM);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleQnaEdit = (qna) => {
    setQnaForm({
      question: qna.question,
      answer: qna.answer,
      category: qna.category,
    });
    setEditingQnaId(qna.id);
    setIsMobileMenuOpen(false);
  };

  const handleQnaDelete = (id) => {
    deleteQna(id);
    setDeleteQnaConfirm(null);
    setSuccessMsg('Q&A deleted.');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add', label: 'Add Job', icon: PlusCircle },
    { id: 'manage', label: 'Manage Jobs', icon: Briefcase },
    { id: 'qna', label: 'Manage Q&A', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex text-white relative">

      {/* ── MOBILE OVERLAY ── */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <div className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-800 border-r border-slate-700 flex flex-col flex-shrink-0 z-[150] transition-transform duration-300 md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>

        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-lg font-black tracking-tight">
              STRATA<span className="text-green-400">PLY</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Admin Panel</p>
          </div>
          <button className="md:hidden text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-green-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-700">
          <a
            href="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={14} />
            Back to Website
          </a>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Top bar (Desktop & Mobile) */}
        <div className="bg-slate-800 border-b border-slate-700 px-4 md:px-8 py-3.5 md:py-4 flex justify-between items-center sticky top-0 z-[130]">
          <div className="flex items-center gap-3">
            {/* Hamburger Toggle */}
            <button 
              className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <LayoutDashboard size={20} />
            </button>
            <div>
              <h1 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                {activeTab === 'add' ? (editingId ? 'Edit Job' : 'Add New Job') : activeTab === 'manage' ? 'Manage Jobs' : activeTab === 'qna' ? 'Manage Q&A' : 'Dashboard'}
              </h1>
              <p className="hidden md:block text-xs text-slate-400 mt-0.5">
                {jobs.length} active job{jobs.length !== 1 ? 's' : ''} in system
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {successMsg && (
              <div className="flex items-center gap-2 bg-green-900/50 text-green-400 text-[10px] md:text-xs font-medium px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-green-800">
                <Check size={14} className="hidden xs:block" />
                {successMsg}
              </div>
            )}
            <button className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-300 hover:text-white" onClick={() => window.location.href = '/'}>
              <LogOut size={16} className="text-red-400" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8">

          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 md:p-5">
                  <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider mb-2">Total Active Jobs</p>
                  <p className="text-2xl md:text-3xl font-black text-green-400">{jobs.length}</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 md:p-5">
                  <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider mb-2">IT Jobs</p>
                  <p className="text-2xl md:text-3xl font-black text-blue-400">{jobs.filter(j => j.jobCategory === 'IT Job').length}</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 md:p-5">
                  <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider mb-2">Govt Jobs</p>
                  <p className="text-2xl md:text-3xl font-black text-yellow-400">{jobs.filter(j => j.jobCategory === 'Government Job').length}</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 md:p-5">
                  <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider mb-2">Internships</p>
                  <p className="text-2xl md:text-3xl font-black text-orange-400">{jobs.filter(j => j.jobCategory === 'Internship').length}</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 md:p-5">
                  <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider mb-2">Non-IT Jobs</p>
                  <p className="text-2xl md:text-3xl font-black text-purple-400">{jobs.filter(j => j.jobCategory === 'Non-IT Job').length}</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 md:p-5">
                  <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider mb-2">Remote Jobs</p>
                  <p className="text-2xl md:text-3xl font-black text-cyan-400">{jobs.filter(j => j.mode === 'Remote').length}</p>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Recent Jobs</h3>
                <div className="space-y-2">
                  {jobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex justify-between items-center py-2 border-b border-slate-700">
                      <div>
                        <p className="text-sm font-medium text-white">{job.title}</p>
                        <p className="text-xs text-slate-400">{job.company} · {job.jobCategory}</p>
                      </div>
                      <span className="text-xs text-slate-500">{job.postedTime}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ADD / EDIT JOB FORM ── */}
          {activeTab === 'add' && (
            <div className="max-w-4xl">
              {editingId && (
                <div className="mb-4 flex items-center gap-3 bg-blue-900/30 border border-blue-800 rounded-lg px-4 py-3">
                  <Edit2 size={14} className="text-blue-400" />
                  <p className="text-sm text-blue-300">Editing job — make your changes and click Update Job</p>
                  <button
                    onClick={() => { setEditingId(null); setForm(INITIAL_FORM); }}
                    className="ml-auto text-xs text-slate-400 hover:text-white"
                  >
                    Cancel Edit
                  </button>
                </div>
              )}

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 md:p-8 space-y-8">

                {/* Section: Basic Info */}
                <div>
                  <h2 className="text-[10px] md:text-xs text-green-400 font-semibold uppercase tracking-widest mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 bg-green-600 text-white rounded flex items-center justify-center text-[10px] font-bold">1</span>
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Job Title" required>
                      <input className={inputCls} placeholder="e.g. Senior Software Engineer" value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
                    </Field>
                    <Field label="Company Name" required>
                      <input className={inputCls} placeholder="e.g. Google" value={form.company} onChange={(e) => handleChange('company', e.target.value)} />
                    </Field>
                    <Field label="Salary / Stipend">
                      <input className={inputCls} placeholder="e.g. ₹12L – ₹18L or ₹25k/month" value={form.salary} onChange={(e) => handleChange('salary', e.target.value)} />
                    </Field>
                    <Field label="Location">
                      <input className={inputCls} placeholder="e.g. Bangalore, India or Remote" value={form.location} onChange={(e) => handleChange('location', e.target.value)} />
                    </Field>
                    <Field label="Experience Required">
                      <input className={inputCls} placeholder="e.g. 2-5 years or Fresher" value={form.experience} onChange={(e) => handleChange('experience', e.target.value)} />
                    </Field>
                    <Field label="Qualification">
                      <input className={inputCls} placeholder="e.g. Bachelor's / Master's" value={form.qualification} onChange={(e) => handleChange('qualification', e.target.value)} />
                    </Field>
                  </div>
                </div>

                {/* Section: Job Classification */}
                <div>
                  <h2 className="text-[10px] md:text-xs text-green-400 font-semibold uppercase tracking-widest mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 bg-green-600 text-white rounded flex items-center justify-center text-[10px] font-bold">2</span>
                    Job Classification
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <Field label="Job Category" required>
                      <select className={selectCls} value={form.jobCategory} onChange={(e) => handleChange('jobCategory', e.target.value)}>
                        <option value="">Select Category</option>
                        <option>IT Job</option>
                        <option>Non-IT Job</option>
                        <option>Government Job</option>
                        <option>Internship</option>
                      </select>
                    </Field>
                    <Field label="Employment Type">
                      <select className={selectCls} value={form.type} onChange={(e) => handleChange('type', e.target.value)}>
                        <option value="">Select Type</option>
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Internship</option>
                        <option>Contract</option>
                        <option>Freelance</option>
                      </select>
                    </Field>
                    <Field label="Work Mode">
                      <select className={selectCls} value={form.mode} onChange={(e) => handleChange('mode', e.target.value)}>
                        <option value="">Select Mode</option>
                        <option>Remote</option>
                        <option>Hybrid</option>
                        <option>On-site</option>
                      </select>
                    </Field>
                  </div>
                </div>

                {/* Section: Company Branding */}
                <div>
                  <h2 className="text-[10px] md:text-xs text-green-400 font-semibold uppercase tracking-widest mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 bg-green-600 text-white rounded flex items-center justify-center text-[10px] font-bold">3</span>
                    Company Branding
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Company Brand Color">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={form.companyColor}
                          onChange={(e) => handleChange('companyColor', e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <input
                          className={inputCls}
                          value={form.companyColor}
                          onChange={(e) => handleChange('companyColor', e.target.value)}
                          placeholder="#16a34a"
                        />
                      </div>
                    </Field>
                    <Field label="Company Logo">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="flex items-center gap-2 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-xs text-slate-300 hover:border-green-500 transition">
                          <Upload size={14} />
                          {form.companyLogo ? 'Logo uploaded ✓' : 'Upload logo'}
                        </div>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        {form.companyLogo && (
                          <img src={form.companyLogo} alt="logo" className="w-10 h-10 rounded object-contain border border-slate-600" />
                        )}
                      </label>
                    </Field>
                  </div>
                </div>

                {/* Section: Job Description */}
                <div>
                  <h2 className="text-[10px] md:text-xs text-green-400 font-semibold uppercase tracking-widest mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 bg-green-600 text-white rounded flex items-center justify-center text-[10px] font-bold">4</span>
                    Job Description
                  </h2>
                  <div className="space-y-5">
                    <Field label="Short Description (shown on card)">
                      <textarea className={textareaCls} rows={2} placeholder="Brief 1-2 sentence summary for the job card..." value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
                    </Field>
                    <Field label="Full Job Description">
                      <textarea className={textareaCls} rows={5} placeholder="Detailed job description — role, responsibilities, day-to-day work..." value={form.fullDescription} onChange={(e) => handleChange('fullDescription', e.target.value)} />
                    </Field>
                  </div>
                </div>

                {/* Section: Skills & Stack */}
                <div>
                  <h2 className="text-[10px] md:text-xs text-green-400 font-semibold uppercase tracking-widest mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 bg-green-600 text-white rounded flex items-center justify-center text-[10px] font-bold">5</span>
                    Skills & Technology
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Required Skills (comma-separated)">
                      <textarea className={textareaCls} rows={3} placeholder="React, Node.js, SQL, Communication..." value={form.requiredSkills} onChange={(e) => handleChange('requiredSkills', e.target.value)} />
                    </Field>
                    <Field label="Tech Stack (comma-separated)">
                      <textarea className={textareaCls} rows={3} placeholder="React, TypeScript, AWS, Docker..." value={form.techStack} onChange={(e) => handleChange('techStack', e.target.value)} />
                    </Field>
                  </div>
                </div>

                {/* Section: Company & Benefits */}
                <div>
                  <h2 className="text-[10px] md:text-xs text-green-400 font-semibold uppercase tracking-widest mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 bg-green-600 text-white rounded flex items-center justify-center text-[10px] font-bold">6</span>
                    Company Info & Benefits
                  </h2>
                  <div className="space-y-5">
                    <Field label="About Company">
                      <textarea className={textareaCls} rows={3} placeholder="Tell candidates about the company — mission, scale, culture..." value={form.aboutCompany} onChange={(e) => handleChange('aboutCompany', e.target.value)} />
                    </Field>
                    <Field label="Benefits & Perks (comma-separated)">
                      <textarea className={textareaCls} rows={3} placeholder="Health insurance, RSUs, Remote work, Gym reimbursement..." value={form.benefits} onChange={(e) => handleChange('benefits', e.target.value)} />
                    </Field>
                  </div>
                </div>

                {/* Section: Expiry */}
                <div>
                  <h2 className="text-[10px] md:text-xs text-green-400 font-semibold uppercase tracking-widest mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 bg-green-600 text-white rounded flex items-center justify-center text-[10px] font-bold">7</span>
                    Listing Settings
                  </h2>
                  <div className="max-w-xs">
                    <Field label="Job Expiry (days)">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        className={inputCls}
                        placeholder="e.g. 30"
                        value={form.expiryDays}
                        onChange={(e) => handleChange('expiryDays', e.target.value)}
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Job will be automatically removed after this many days
                      </p>
                    </Field>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleSubmit}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg text-sm font-semibold transition-colors w-full sm:w-auto"
                  >
                    <Check size={16} />
                    {editingId ? 'Update Job' : 'Add Job'}
                  </button>
                  {editingId && (
                    <button
                      onClick={() => { setEditingId(null); setForm(INITIAL_FORM); }}
                      className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 px-5 py-3 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ── MANAGE JOBS ── */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
                <p className="text-xs md:text-sm text-slate-400">
                  <span className="text-white font-bold">{jobs.length}</span> jobs in the system
                </p>
                <button
                  onClick={() => { setForm(INITIAL_FORM); setEditingId(null); setActiveTab('add'); }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors"
                >
                  <PlusCircle size={14} />
                  Add New Job
                </button>
              </div>

              <div className="space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Color dot */}
                      <div
                        className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-lg"
                        style={{ background: job.companyColor || '#16a34a' }}
                      >
                        {job.company?.[0] || '?'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{job.title}</p>
                        <p className="text-[10px] md:text-xs text-slate-400 truncate">{job.company} · {job.jobCategory}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-700/50 pt-3 sm:pt-0">
                      {/* Expiry */}
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Expires</p>
                        <p className="text-[10px] md:text-xs text-slate-300 font-medium whitespace-nowrap">
                          {job.expiryDate ? new Date(job.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(job)}
                          className="flex items-center gap-1.5 text-[10px] md:text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg transition-colors border border-slate-600"
                        >
                          <Edit2 size={12} />
                          <span className="hidden xs:inline">Edit</span>
                        </button>

                        {deleteConfirm === job.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(job.id)}
                              className="text-[10px] md:text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg transition-colors font-bold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-slate-400 hover:text-white px-1"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(job.id)}
                            className="flex items-center gap-1.5 text-[10px] md:text-xs bg-red-900/30 hover:bg-red-800/40 text-red-400 px-3 py-2 rounded-lg transition-colors border border-red-900/50"
                          >
                            <Trash2 size={12} />
                            <span className="hidden xs:inline">Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MANAGE Q&A ── */}
          {activeTab === 'qna' && (
            <div className="space-y-6 pb-12">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 md:p-8 shadow-sm">
                <div className="mb-6 border-b border-slate-700 pb-4">
                  <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="text-green-500" size={20} />
                    {editingQnaId ? 'Edit Q&A' : 'Add New Q&A'}
                  </h2>
                </div>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Category" required>
                      <select
                        value={qnaForm.category}
                        onChange={(e) => handleQnaChange('category', e.target.value)}
                        className={selectCls}
                      >
                        <option value="">Select a category</option>
                        <option value="IT Job">IT Job</option>
                        <option value="Government Job">Government Job</option>
                        <option value="Non-IT Job">Non-IT Job</option>
                        <option value="HR">HR</option>
                        <option value="Aptitude">Aptitude</option>
                      </select>
                    </Field>
                    <Field label="Question" required>
                      <input
                        type="text"
                        placeholder="e.g. What is React?"
                        value={qnaForm.question}
                        onChange={(e) => handleQnaChange('question', e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="Answer" required>
                    <textarea
                      rows={3}
                      placeholder="e.g. React is a JavaScript library..."
                      value={qnaForm.answer}
                      onChange={(e) => handleQnaChange('answer', e.target.value)}
                      className={textareaCls}
                    />
                  </Field>
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={handleQnaSubmit}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={16} />
                      {editingQnaId ? 'Update' : 'Save Q&A'}
                    </button>
                    {editingQnaId && (
                      <button
                        onClick={() => { setEditingQnaId(null); setQnaForm(INITIAL_QNA_FORM); }}
                        className="w-full sm:w-auto text-slate-400 hover:text-white px-4 py-2"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                  <h3 className="text-sm font-bold text-white">All Questions & Answers</h3>
                </div>
                <div className="divide-y divide-slate-700/50">
                  {qnas.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">No Q&As added yet.</div>
                  ) : (
                    qnas.map((q) => (
                      <div key={q.id} className="p-4 md:p-5 hover:bg-slate-700/30 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="bg-green-900/30 text-green-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-green-800/50">
                              {q.category}
                            </span>
                          </div>
                          <h4 className="text-white font-bold text-sm mb-1 line-clamp-1">{q.question}</h4>
                          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{q.answer}</p>
                        </div>
                        <div className="flex items-center gap-2 sm:flex-col sm:items-stretch sm:w-24">
                          <button
                            onClick={() => handleQnaEdit(q)}
                            className="flex-1 flex items-center justify-center gap-1.5 text-[10px] md:text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition-colors border border-slate-600"
                          >
                            <Edit2 size={12} />
                            Edit
                          </button>

                          {deleteQnaConfirm === q.id ? (
                            <div className="flex-1 flex items-center gap-1">
                              <button
                                onClick={() => handleQnaDelete(q.id)}
                                className="w-full text-[10px] md:text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-2 rounded-lg transition-colors font-bold"
                              >
                                OK
                              </button>
                              <button
                                onClick={() => setDeleteQnaConfirm(null)}
                                className="text-slate-400 hover:text-white"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteQnaConfirm(q.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 text-[10px] md:text-xs bg-red-900/20 hover:bg-red-800/40 text-red-400 px-3 py-2 rounded-lg transition-colors border border-red-900/40"
                            >
                              <Trash2 size={12} />
                              Del
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;