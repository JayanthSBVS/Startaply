import React from 'react';
import { Briefcase, Users, Building2, Megaphone, Activity, FileText } from 'lucide-react';
import { getRoleConfig } from './adminConstants';

const AdminDashboardTab = ({
  dashboardSummary,
  jobs,
  applications,
  companies,
  melas,
  isManager,
  globalStats,
  logs,
  admins,
  isMobileMenuOpen
}) => {
  return (
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

      {/* Role-aware second row */}
      {isManager() ? (
        /* Manager view: Activity logs + admin health */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800/60 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <Activity className="text-emerald-500 animate-pulse" /> Operational Pulse
                </h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Live Intelligence & Contribution highlights</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#0b0f14]/40 p-2 rounded-3xl border border-slate-200 dark:border-slate-800/60">
                 <div className="px-4 py-2 text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Today's Total</p>
                    <p className="text-lg font-black text-emerald-500">{globalStats?.totalToday || 0}</p>
                 </div>
                 <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                 <div className="px-4 py-2 text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Jobs</p>
                    <p className="text-lg font-black text-blue-500">{globalStats?.totalJobs || 0}</p>
                 </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {(Array.isArray(logs) ? logs : []).slice(0, 4).map((log, i) => {
                const actionIcon = log.action === 'login' ? '🔑' : log.action === 'logout' ? '👋' : log.action === 'create' ? '✨' : log.action === 'update' ? '✏️' : log.action === 'delete' ? '🗑️' : '📌';
                return (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-lg shadow-sm border border-slate-100 dark:border-slate-800">{actionIcon}</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          <span className="text-emerald-500 font-black">{log.adminname || log.adminName}</span> {log.details}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{new Date(parseInt(log.timestamp || log.createdat)).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!logs || logs.length === 0) && (
                <div className="py-10 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">No recent activity</div>
              )}
            </div>
          </div>
          <div className="lg:col-span-1 bg-white dark:bg-slate-900/40 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800/60 shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-black flex items-center gap-3 mb-8">
              <Users className="text-purple-500" /> Active Roster
            </h3>
            <div className="space-y-4">
              {(Array.isArray(admins) ? admins : []).filter(a => a.isactive).map(admin => {
                const rc = getRoleConfig(admin.role);
                const RoleIcon = rc.icon;
                return (
                  <div key={admin.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${rc.border} ${rc.bg} transition-colors`}>
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rc.color} border ${rc.border} bg-white/50 dark:bg-[#0b0f14]/50 shadow-sm`}><RoleIcon size={18} /></div>
                     <div className="flex-1 min-w-0">
                       <p className={`text-sm font-black truncate ${rc.color}`}>{admin.name}</p>
                       <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-0.5">{rc.label}</p>
                     </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Executive view: Just simple quick actions or stats */
        <div className="bg-white dark:bg-slate-900/40 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800/60 shadow-2xl text-center">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={32} />
          </div>
          <h3 className="text-2xl font-black mb-2">Welcome to your Workspace</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">Use the sidebar to navigate through your authorized modules. You can manage jobs, view applications, and handle content based on your permissions.</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(AdminDashboardTab);
