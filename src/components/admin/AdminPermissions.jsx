import React from 'react';
import { 
  Plus, Edit3, Trash2, CheckCircle, XCircle, Search, Settings, FileText, 
  Users, Briefcase, Calendar, MessageSquare, ArrowRight, Activity, Handshake, 
  Mail, X, Image as ImageIcon, MapPin, DollarSign, Building, AlertCircle, RefreshCw, Eye, MoveUp, MoveDown, Info, Shield, ShieldAlert, Key, Loader, Unlock, Lock, Crown, Sliders, UploadCloud, PlayCircle, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inputCls, selectCls, textareaCls, ROLE_CONFIG, getRoleConfig } from './adminConstants';
import axios from 'axios';
import { compressImage } from '../../utils/imageCompression';

const AdminPermissions = React.memo(({ 
  data, formState, handlers, API, userProfile, getConfig, toast, safeGet, isManager
}) => {
  const { ROLE_CONFIG, permissions } = data || {};
  const { permForm, setPermForm, permSaving, setPermSaving, permSeeded, setPermSeeded } = formState || {};
  const { fetchData, showMsg, refreshPermissions } = handlers || {};
  return (
    <>
            <div className="animate-in fade-in slide-in-from-bottom-5 space-y-8">
              <div>
                <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900 dark:text-white">
                  <Sliders className="text-amber-400" size={30} /> Role Permissions
                </h2>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mt-1 pl-12">Configure what each role can do in the system</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {['operational_manager', 'operational_executive'].map(role => {
                  const rc = getRoleConfig(role);
                  const RoleIcon = rc.icon;
                  // Get the authoritative server row for this role
                  const serverRow = (Array.isArray(permissions) ? permissions : []).find(p => p.role === role) || {};

                  // ── CRITICAL FIX: Seed permForm from server data the first time we see it ──
                  // This ensures ALL keys are defined before any toggle is clicked,
                  // preventing the "undefined spread" bug.
                  if (!permSeeded[role] && serverRow && Object.keys(serverRow).length > 0) {
                    setPermSeeded(s => ({ ...s, [role]: true }));
                    setPermForm(prev => ({
                      ...prev,
                      [role]: {
                        can_post_job:        serverRow.can_post_job        !== undefined ? !!serverRow.can_post_job        : true,
                        can_edit_job:        serverRow.can_edit_job        !== undefined ? !!serverRow.can_edit_job        : true,
                        can_delete_job:      serverRow.can_delete_job      !== undefined ? !!serverRow.can_delete_job      : false,
                        can_view_applicants: serverRow.can_view_applicants !== undefined ? !!serverRow.can_view_applicants : true,
                        can_manage_companies:serverRow.can_manage_companies!== undefined ? !!serverRow.can_manage_companies: true,
                        can_manage_mela:     serverRow.can_manage_mela     !== undefined ? !!serverRow.can_manage_mela     : true,
                        can_manage_prep:     serverRow.can_manage_prep     !== undefined ? !!serverRow.can_manage_prep     : true,
                      }
                    }));
                  }

                  // Use local form state (fully seeded) or fall back to server row
                  const local = permForm[role] || {
                    can_post_job:        serverRow.can_post_job        !== undefined ? !!serverRow.can_post_job        : true,
                    can_edit_job:        serverRow.can_edit_job        !== undefined ? !!serverRow.can_edit_job        : true,
                    can_delete_job:      serverRow.can_delete_job      !== undefined ? !!serverRow.can_delete_job      : false,
                    can_view_applicants: serverRow.can_view_applicants !== undefined ? !!serverRow.can_view_applicants : true,
                    can_manage_companies:serverRow.can_manage_companies!== undefined ? !!serverRow.can_manage_companies: true,
                    can_manage_mela:     serverRow.can_manage_mela     !== undefined ? !!serverRow.can_manage_mela     : true,
                    can_manage_prep:     serverRow.can_manage_prep     !== undefined ? !!serverRow.can_manage_prep     : true,
                  };

                  const PERMS = [
                    { key: 'can_post_job',           label: 'Post Jobs',           desc: 'Create new job listings' },
                    { key: 'can_edit_job',            label: 'Edit Jobs',           desc: 'Modify existing job listings' },
                    { key: 'can_delete_job',          label: 'Delete Jobs',         desc: 'Permanently remove job listings' },
                    { key: 'can_view_applicants',     label: 'View Applicants',     desc: 'Access applications dashboard' },
                    { key: 'can_manage_companies',    label: 'Manage Companies',    desc: 'Add / edit / delete companies' },
                    { key: 'can_manage_mela',         label: 'Manage Job Mela',     desc: 'Create and manage job fairs' },
                    { key: 'can_manage_prep',         label: 'Manage Prep Content', desc: 'Add preparation materials' },
                  ];

                  return (
                    <div key={role} className={`bg-white dark:bg-slate-900/40 border rounded-[2.5rem] shadow-xl overflow-hidden ${rc.border}`}>
                      {/* Card header */}
                      <div className={`p-7 border-b ${rc.border} ${rc.bg} flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl ${rc.bg} border ${rc.border} flex items-center justify-center`}><RoleIcon size={22} className={rc.color} /></div>
                          <div>
                            <h3 className={`text-lg font-black ${rc.color}`}>{rc.label}</h3>
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
                              // Reset seed flag so next load re-syncs from server
                              setPermSeeded(s => ({ ...s, [role]: false }));
                              setPermForm(prev => { const n = { ...prev }; delete n[role]; return n; });
                              refreshPermissions();
                              toast.success(`${rc.label === 'Exec.' ? 'Executive' : 'Op. Manager'} permissions saved!`);
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
                          // isOn always reads from fully-seeded local object - guaranteed boolean
                          const isOn = local[key] === true;
                          return (
                            <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-[#0b0f14]/30 border border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
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
                                onClick={() => setPermForm(prev => ({
                                  ...prev,
                                  [role]: { ...local, [key]: !isOn }
                                }))}
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
                  <p className="text-sm font-black text-purple-400 mb-1">Manager Role - Always Full Access</p>
                  <p className="text-xs font-bold text-slate-500">Managers bypass all permission restrictions and have full system control. This cannot be modified for security reasons.</p>
                </div>
              </div>
            </div>
          
    </>
  );
});

export default AdminPermissions;
