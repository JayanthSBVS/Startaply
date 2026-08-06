import React from 'react';
import { 
  Plus, Edit3, Trash2, CheckCircle, XCircle, Search, Settings, FileText, 
  Users, Users2, UserPlus, Phone, Crown, Briefcase, Calendar, MessageSquare, ArrowRight, Activity, Handshake, 
  Mail, X, Image as ImageIcon, MapPin, DollarSign, Building, AlertCircle, RefreshCw, Eye, MoveUp, MoveDown, Info, Shield, ShieldAlert, Key, Loader, Unlock, UploadCloud, PlayCircle, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inputCls, selectCls, textareaCls, ROLE_CONFIG, getRoleConfig } from './adminConstants';
import axios from 'axios';
import { compressImage } from '../../utils/imageCompression';

const AdminTeamManagement = React.memo(({ 
  data, formState, handlers, API, userProfile, getConfig, toast, safeGet, isManager
}) => {
  const { admins } = data || {};
  const { teamForm, setTeamForm, showTeamModal, setShowTeamModal } = formState || {};
  const { fetchData, confirmAction, showMsg } = handlers || {};
  return (
    <>
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
                      <tr className="bg-slate-50/80 dark:bg-[#0b0f14]/50 border-b border-slate-200 dark:border-slate-800">
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
                                {!member.mobile && !member.department && <p className="text-[10px] text-slate-400 italic">-</p>}
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
                                {member.joinedat ? new Date(parseInt(member.joinedat)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : member.createdat ? new Date(parseInt(member.createdat)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                              </p>
                            </td>
                            {/* Actions */}
                            <td className="px-8 py-6">
                              {member.email !== 'admin@startaply.com' && (
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
                              {member.email === 'admin@startaply.com' && (
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
                      <div className="col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Work Email *</label><input type="email" className={inputCls} placeholder="name@startaply.com" value={teamForm.email} onChange={e => setTeamForm(f => ({ ...f, email: e.target.value }))} /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mobile</label><input type="tel" className={inputCls} placeholder="+91 XXXXX XXXXX" value={teamForm.mobile} onChange={e => setTeamForm(f => ({ ...f, mobile: e.target.value }))} /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Department</label><input className={inputCls} placeholder="e.g. Recruitment" value={teamForm.department} onChange={e => setTeamForm(f => ({ ...f, department: e.target.value }))} /></div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Role *</label>
                        <select className={selectCls} value={teamForm.role} onChange={e => setTeamForm(f => ({ ...f, role: e.target.value }))}>
                          <option value="operational_executive">Operational Executive</option>
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
                            setTeamForm({ name: '', email: '', password: '', role: 'operational_executive', department: '', mobile: '', joinedAt: '' });
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
          
    </>
  );
});

export default AdminTeamManagement;
