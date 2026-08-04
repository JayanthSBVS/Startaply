import React from 'react';
import { Briefcase, Building2, MapPin, Eye, Users, Edit2, Trash2 } from 'lucide-react';

const AdminManageJobs = ({
  jobs,
  handleToggle,
  setJobForm,
  setCompanySearch,
  setEditingJobId,
  setActiveTab,
  handleJobDelete
}) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
      <div className="space-y-4">
        {jobs.map(job => (
          <div key={job.id} className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 p-5 rounded-3xl shadow-sm dark:shadow-lg hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-slate-50 dark:bg-[#0b0f14] rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-xl font-black text-emerald-500 group-hover:scale-110 transition-transform">{job.company?.charAt(0)}</div>
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
                  <span className="text-[10px] font-black uppercase text-slate-500">Fresher</span>
                  <button onClick={() => handleToggle(job, 'isFresh')} className={`w-10 h-5 rounded-full transition-colors relative ${job.isFresh ? 'bg-teal-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${job.isFresh ? 'left-6' : 'left-1'}`} />
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
                  <button onClick={() => { 
                    setJobForm({ ...job, jobCategory: job.category, govtDept: job.govtDept || '', companyId: job.companyid || job.companyId, companyLogo: job.companylogo || job.companyLogo }); 
                    setCompanySearch(job.company || '');
                    setEditingJobId(job.id); 
                    setActiveTab('add'); 
                  }} className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"><Edit2 size={18} /></button>
                )}
                {job.canDelete !== false && (
                  <button onClick={() => handleJobDelete(job.id)} className="p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-colors"><Trash2 size={18} /></button>
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
  );
};

export default React.memo(AdminManageJobs);
