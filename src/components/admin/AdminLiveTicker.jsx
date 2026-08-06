import React from 'react';
import { 
  Plus, Edit3, Trash2, CheckCircle, XCircle, Search, Settings, FileText, 
  Users, Briefcase, Calendar, MessageSquare, ArrowRight, Activity, Handshake, 
  Mail, X, Image as ImageIcon, MapPin, DollarSign, Building, AlertCircle, RefreshCw, Eye, MoveUp, MoveDown, Info, Shield, ShieldAlert, Key, Loader, Unlock, UploadCloud, PlayCircle, BarChart2, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inputCls, selectCls, textareaCls, ROLE_CONFIG } from './adminConstants';
import axios from 'axios';
import { compressImage } from '../../utils/imageCompression';

const AdminLiveTicker = React.memo(({ 
  data, formState, handlers, API, userProfile, getConfig, toast, safeGet, isManager
}) => {
  const { liveTickerItems } = data || {};
  const { tickerForm, setTickerForm } = formState || {};
  const { fetchData, confirmAction, showMsg } = handlers || {};
  return (
    <>
            <div className="animate-in fade-in slide-in-from-bottom-5 max-w-4xl mx-auto space-y-8">
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-[2.5rem] p-8 shadow-2xl">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-emerald-500"><Zap size={24} /> Add Live Ticker Entry</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Ticker Message</label>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="e.g. 🚀 Urgent IT Hiring Drive in Bangalore..."
                      value={tickerForm.text}
                      onChange={(e) => setTickerForm({...tickerForm, text: e.target.value})}
                    />
                  </div>
                  
                  <button 
                    onClick={async () => {
                      if(!tickerForm.text) return toast.error('Message required');
                      try {
                        await axios.post(`${API}/live-ticker`, tickerForm, getConfig());
                        setTickerForm({text: ''});
                        fetchData();
                        toast.success('Ticker entry added!');
                      } catch (err) { toast.error('Error adding ticker'); }
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-full transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95"
                  >
                    Publish to Ticker
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {liveTickerItems.length > 0 ? liveTickerItems.map(item => (
                  <div key={item.id} className="bg-white dark:bg-[#0b0f14]/50 border border-slate-200 dark:border-slate-800/50 p-6 rounded-3xl flex justify-between items-center group">
                    <div className="flex-1">
                      <p className="text-slate-800 dark:text-slate-200 font-bold">{item.text}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{new Date(Number(item.createdAt)).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => confirmAction('Delete this entry?', async () => {
                        await axios.delete(`${API}/live-ticker/${item.id}`, getConfig());
                        fetchData();
                        toast.success('Deleted');
                      })}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )) : (
                  <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800/50 border-dashed rounded-3xl">
                    <Zap size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Active Ticker Entries</p>
                  </div>
                )}
              </div>
            </div>
          
    </>
  );
});

export default AdminLiveTicker;
