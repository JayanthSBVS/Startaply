import React from 'react';
import { 
  Plus, Edit3, Trash2, CheckCircle, XCircle, Search, Settings, FileText, 
  Users, Briefcase, Calendar, MessageSquare, ArrowRight, Activity, Handshake, 
  Mail, X, Image as ImageIcon, MapPin, DollarSign, Building, AlertCircle, RefreshCw, Eye, MoveUp, MoveDown, Info, Shield, ShieldAlert, Key, Loader, Unlock, UploadCloud, PlayCircle, BarChart2, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inputCls, selectCls, textareaCls, ROLE_CONFIG } from './adminConstants';
import axios from 'axios';
import { compressImage } from '../../utils/imageCompression';

const AdminFeedback = React.memo(({ 
  data, formState, handlers, API, userProfile, getConfig, toast, safeGet, isManager
}) => {
  const { feedbacks } = data || {};
  const { fetchData, confirmAction, showMsg } = handlers || {};
  return (
    <>
            <div className="animate-in fade-in slide-in-from-bottom-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbacks.map(fb => (
                  <div key={fb.id} className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 p-8 rounded-[2.5rem] relative group hover:border-blue-500/50 transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20"><MessageSquare size={24} /></div>
                      <button onClick={async () => { if (window.confirm('Delete feedback?')) { await axios.delete(`${API}/feedback/${fb.id}`, getConfig()); fetchData(); showMsg('Feedback Removed'); } }} className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                    </div>
                    <p className="text-slate-900 dark:text-slate-200 font-medium leading-relaxed mb-6">"{fb.message}"</p>
                    <div className="pt-6 border-t border-slate-800/50 flex justify-between items-end">
                      <div>
                        <div className="font-extrabold text-sm">{fb.name}</div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{new Date(parseInt(fb.createdAt || Date.now())).toDateString()}</div>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={10} className={star <= (fb.rating || 5) ? 'fill-amber-500 text-amber-500' : 'text-slate-700'} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {feedbacks.length === 0 && (
                  <div className="col-span-full py-32 text-center bg-slate-900/10 rounded-[3rem] border border-dashed border-slate-800/50">
                    <MessageSquare size={48} className="mx-auto text-slate-800 mb-6" />
                    <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">Awaiting User Feedback</h3>
                  </div>
                )}
              </div>
            </div>
    </>
  );
});

export default AdminFeedback;
