import React from 'react';
import { 
  Plus, Edit3, Trash2, CheckCircle, CheckCircle2, XCircle, Search, Settings, FileText, 
  Users, Users2, Briefcase, Calendar, MessageSquare, ArrowRight, Activity, Handshake, 
  Mail, X, Image as ImageIcon, MapPin, DollarSign, Building, Building2, AlertCircle, RefreshCw, Eye, MoveUp, MoveDown, Info, Shield, ShieldAlert, ShieldCheck, Key, Loader, Unlock, UploadCloud, PlayCircle, BarChart2, TrendingUp, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inputCls, selectCls, textareaCls, ROLE_CONFIG } from './adminConstants';
import axios from 'axios';
import { compressImage } from '../../utils/imageCompression';

const AdminGlobalStats = React.memo(({ 
  data, formState, handlers, API, userProfile, getConfig, toast, safeGet, isManager
}) => {
  const { globalStats, jobs = [], applications = [], companies = [], admins = [] } = data || {};
  return (
    <>
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
                  <div className="bg-slate-50 dark:bg-[#0b0f14]/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex gap-10">
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
                      <tr className="bg-slate-50 dark:bg-[#0b0f14]/50 border-b border-slate-200 dark:border-slate-800/80">
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
                        <div key={admin.id} className="bg-slate-50/50 dark:bg-[#0b0f14]/30 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem]">
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
          
    </>
  );
});

export default AdminGlobalStats;
