import React from 'react';
import { 
  Plus, Edit3, Trash2, CheckCircle, XCircle, Search, Settings, FileText, 
  Users, Briefcase, Calendar, MessageSquare, ArrowRight, Activity, Handshake, 
  Mail, X, Image as ImageIcon, MapPin, DollarSign, Building, AlertCircle, RefreshCw, Eye, MoveUp, MoveDown, Info, Shield, ShieldAlert, Key, Loader, Unlock, UploadCloud, PlayCircle, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inputCls, selectCls, textareaCls, ROLE_CONFIG } from './adminConstants';
import axios from 'axios';
import { compressImage } from '../../utils/imageCompression';

const AdminActivityLogs = React.memo(({ 
  data, formState, handlers, API, userProfile, getConfig, toast, safeGet, isManager
}) => {
  const { logs } = data || {};
  const { fetchData, confirmAction } = handlers || {};
  return (
    <>
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
                            <div className="bg-slate-50/50 dark:bg-[#0b0f14]/30 border border-slate-200 dark:border-slate-800/60 p-6 rounded-[2rem] hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
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
          
    </>
  );
});

export default AdminActivityLogs;
