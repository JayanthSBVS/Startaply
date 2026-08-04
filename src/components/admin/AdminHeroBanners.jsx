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

const AdminHeroBanners = React.memo(({ 
  data, formState, handlers, API, userProfile, getConfig, toast, safeGet, isManager
}) => {
  return (
    <>
            <div className="animate-in fade-in slide-in-from-bottom-5 max-w-4xl mx-auto space-y-8">
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-[2.5rem] p-8 shadow-2xl">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-blue-500"><ImageIcon size={24} /> Upload Hero Banner</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Select Image File</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 font-medium text-slate-900 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-500/10 file:text-blue-500 dark:file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer shadow-inner" 
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            showMsg('Compressing banner...');
                            // Client-side compression
                            const compressedBase64 = await compressImage(file, 1920, 0.8);

                            showMsg('Uploading banner...');
                            await axios.post(`${API}/hero-banners`, { image: compressedBase64 }, getConfig());
                            fetchData();
                            showMsg('Banner Published Successfully');
                          } catch (err) {
                            toast.error('Failed to upload banner');
                          }
                        }
                      }} 
                    />
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Supported formats: JPG, PNG, WEBP (Max 50MB). Best resolution: 1920x1080.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-sm font-black uppercase text-slate-500 tracking-[0.2em] px-2 flex items-center justify-between">
                  Active Banners
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500 dark:text-slate-400 px-3 py-1 rounded-lg text-[10px]">{heroBanners.length} Items</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {heroBanners.map((banner, index) => (
                    <div key={banner.id} className="relative group rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/60 shadow-sm aspect-video bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                       <img src={banner.image} alt={`Hero ${index}`} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                         <button onClick={() => confirmAction('Delete this banner?', async () => { await axios.delete(`${API}/hero-banners/${banner.id}`, getConfig()); fetchData(); showMsg('Banner Removed'); })} className="px-6 py-3 bg-rose-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                           <Trash2 size={18} /> Delete Banner
                         </button>
                       </div>
                    </div>
                  ))}
                  {heroBanners.length === 0 && (
                    <div className="md:col-span-2 text-center py-16 bg-slate-50 dark:bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                      <ImageIcon size={40} className="mx-auto text-slate-500 dark:text-slate-400 mb-3" />
                      <p className="text-slate-500 font-bold text-sm">No banners uploaded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          
    </>
  );
});

export default AdminHeroBanners;
