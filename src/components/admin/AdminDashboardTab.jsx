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
          { label: 'Active Jobs', val: dashboardSummary ? dashboardSummary.totalJobs : jobs.length, icon: Briefcase, col: 'text-[#001F8E] dark:text-[#1A62FE]', bg: 'bg-[#EFF3FF] dark:bg-[#1A62FE]/10' },
          { label: 'Total Applicants', val: dashboardSummary ? dashboardSummary.totalApplications : applications.length, icon: Users, col: 'text-[#1A62FE] dark:text-[#1A62FE]', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Partner Network', val: dashboardSummary ? dashboardSummary.totalCompanies : companies.length, icon: Building2, col: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
          { label: 'Job Melas', val: dashboardSummary ? dashboardSummary.totalMelas : melas.length, icon: Megaphone, col: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 p-6 rounded-2xl shadow-sm hover:border-[#1A62FE]/40 transition-all group overflow-hidden relative">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                <h4 className="text-3xl font-black">{stat.val}</h4>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.col} border border-[#1A62FE]/10`}>
                <stat.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role-aware second row */}
      {isManager() ? (
        /* Manager view: Activity logs + admin health */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 p-8 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2.5">
                  <Activity className="text-[#1A62FE] animate-pulse" size={22} /> Operational Pulse
                </h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Live Intelligence & Contribution highlights</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#0b0f14]/40 p-2 rounded-xl border border-slate-200 dark:border-slate-800/60">
                 <div className="px-4 py-1.5 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Today's Total</p>
                    <p className="text-base font-bold text-[#001F8E] dark:text-[#1A62FE]">{globalStats?.totalToday || 0}</p>
                 </div>
                 <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                 <div className="px-4 py-1.5 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Global Jobs</p>
                    <p className="text-base font-bold text-blue-600 dark:text-blue-400">{globalStats?.totalJobs || 0}</p>
                 </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {(Array.isArray(logs) ? logs : []).slice(0, 4).map((log, i) => {
                const actionIcon = log.action === 'login' ? '🔑' : log.action === 'logout' ? '👋' : log.action === 'create' ? '✨' : log.action === 'update' ? '✏️' : log.action === 'delete' ? '🗑️' : '📌';
                return (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/40 hover:border-[#1A62FE]/30 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center text-sm shadow-sm border border-slate-100 dark:border-slate-800">{actionIcon}</div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          <span className="text-[#001F8E] dark:text-[#1A62FE] font-bold">{log.adminname || log.adminName}</span> {log.details}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">{new Date(parseInt(log.timestamp || log.createdat)).toLocaleString()}</p>
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
          <div className="lg:col-span-1 bg-white dark:bg-slate-900/40 p-8 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm relative overflow-hidden">
            <h3 className="text-lg font-bold flex items-center gap-2.5 mb-6">
              <Users className="text-purple-500" size={20} /> Active Team Roster
            </h3>
            <div className="space-y-3">
              {(Array.isArray(admins) ? admins : []).filter(a => a.isactive).map(admin => {
                const rc = getRoleConfig(admin.role);
                const RoleIcon = rc.icon;
                return (
                  <div key={admin.id} className={`flex items-center gap-3.5 p-3 rounded-xl border ${rc.border} ${rc.bg} transition-colors`}>
                     <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${rc.color} border ${rc.border} bg-white/50 dark:bg-[#0b0f14]/50 shadow-sm`}><RoleIcon size={16} /></div>
                     <div className="flex-1 min-w-0">
                       <p className={`text-xs font-bold truncate ${rc.color}`}>{admin.name}</p>
                       <p className="text-[9px] font-bold uppercase text-slate-500 tracking-wider mt-0.5">{rc.label}</p>
                     </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Executive view: Just simple quick actions or stats */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 bg-gradient-to-br from-slate-900 via-slate-900 to-[#001F8E]/40 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#1A62FE]/10 rounded-full blur-[80px] pointer-events-none" />
            <h3 className="text-2xl font-black mb-1.5 relative z-10">Welcome to your Workspace</h3>
            <p className="text-slate-300 text-xs font-normal max-w-xl relative z-10 mb-7">Use the sidebar to navigate through your authorized modules. Here is your impact for today.</p>
            
            {(() => {
              const startOfDay = new Date();
              startOfDay.setHours(0, 0, 0, 0);
              const startOfDayTime = startOfDay.getTime();

              const myJobsToday = jobs.filter(j => Number(j.createdAt || j.createdat) >= startOfDayTime).length;
              const myMelasToday = melas.filter(m => Number(m.createdAt || m.createdat) >= startOfDayTime).length;
              const myCompaniesToday = companies.filter(c => Number(c.createdAt || c.createdat) >= startOfDayTime).length;

              return (
                <div className="grid grid-cols-3 gap-4 relative z-10">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Jobs Posted Today</p>
                    <p className="text-2xl font-black text-[#1A62FE]">{myJobsToday}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Melas Created Today</p>
                    <p className="text-2xl font-black text-amber-400">{myMelasToday}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">Partners Added Today</p>
                    <p className="text-2xl font-black text-purple-400">{myCompaniesToday}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(AdminDashboardTab);
