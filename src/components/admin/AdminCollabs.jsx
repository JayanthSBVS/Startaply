import React from 'react';
import { 
  Plus, Edit3, Trash2, CheckCircle, XCircle, Search, Settings, FileText, 
  Users, Briefcase, Calendar, MessageSquare, ArrowRight, Activity, Handshake, 
  Mail, X, Image as ImageIcon, MapPin, DollarSign, Building, AlertCircle, RefreshCw, Eye, MoveUp, MoveDown, Info, Shield, ShieldAlert, Key, Loader, Unlock, UploadCloud, PlayCircle, BarChart2, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inputCls, selectCls, textareaCls, ROLE_CONFIG } from './adminConstants';
import axios from 'axios';
import { compressImage } from '../../utils/imageCompression';

const AdminCollabs = React.memo(({ 
  data, formState, handlers, API, userProfile, getConfig, toast, safeGet, isManager
}) => {
  return (
    <>
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200">College Collaboration Requests</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.collabRequests && data.collabRequests.map((req) => (
                  <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2">{req.college_name || req.collegeName}</h3>
                        <p className="text-xs font-bold text-slate-500 mt-1">{new Date(req.created_at || req.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                        <Handshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Mail className="w-4 h-4 text-emerald-500" /> <a href={`mailto:${req.email}`} className="hover:underline font-medium break-all">{req.email}</a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Phone className="w-4 h-4 text-emerald-500" /> <a href={`tel:${req.phone}`} className="hover:underline font-medium">{req.phone}</a>
                      </div>
                    </div>
                    {req.message && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mt-2 flex-1">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{req.message}</p>
                      </div>
                    )}
                    <button 
                      onClick={() => handlers.confirmAction('Delete this request?', async () => {
                        await axios.delete(`${API}/collabs/${req.id}`, getConfig());
                        handlers.fetchData(); handlers.showMsg('Request deleted');
                      })}
                      className="mt-2 w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 font-bold text-sm hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Request
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
    </>
  );
});

export default AdminCollabs;
