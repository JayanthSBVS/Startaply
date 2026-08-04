import React from 'react';
import { Building2, X, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { inputCls, selectCls } from './adminConstants';
import axios from 'axios';
import { compressImage } from '../../utils/imageCompression';
import { toast } from 'react-hot-toast';

const AdminCompanyModal = ({
  companyForm, setCompanyForm, setIsCompanyModalOpen, setJobForm,
  jobForm, setCompanySearch, fetchData, showMsg, getConfig, API
}) => {
  return (
    
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsCompanyModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 w-full max-w-2xl relative z-10 shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-y-auto max-h-[95vh] custom-scrollbar"
          >
            {/* Background Decorations */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <button onClick={() => setIsCompanyModalOpen(false)} className="absolute top-6 right-6 md:top-10 md:right-10 p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-rose-500 hover:rotate-90 transition-all duration-300 z-20"><X size={20} /></button>
            
            <div className="mb-8 relative z-10">
              <h3 className="text-2xl md:text-4xl font-black mb-2 flex items-center gap-4 text-slate-900 dark:text-white">
                <div className="p-3 md:p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20"><Building2 size={24} /></div>
                Partner Identity
              </h3>
              <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.3em] ml-16 md:ml-20">Onboard organization</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2.5"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-5">Corporate Name *</label><input className={inputCls} placeholder="e.g. Google India" value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} /></div>
              <div className="space-y-2.5"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-5">Industry Sector</label><input className={inputCls} placeholder="e.g. Technology" value={companyForm.industry} onChange={e => setCompanyForm({ ...companyForm, industry: e.target.value })} /></div>
              <div className="space-y-2.5 relative"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-5">Company Type</label><select className={selectCls} value={companyForm.companyType} onChange={e => setCompanyForm({ ...companyForm, companyType: e.target.value })}><option value="">Select Type</option><option>MNC</option><option>Startup</option><option>Product Based</option><option>Service Based</option><option>Govt PSU</option><option>Remote First</option><option>Unicorn</option></select><div className="absolute right-6 top-[44px] pointer-events-none text-slate-500">▼</div></div>
              <div className="space-y-2.5"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-5">HQ Location</label><input className={inputCls} placeholder="e.g. Hyderabad, India" value={companyForm.location} onChange={e => setCompanyForm({ ...companyForm, location: e.target.value })} /></div>
              <div className="md:col-span-2 space-y-2.5"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-5">Corporate Website</label><input className={inputCls} placeholder="https://www.company.com" value={companyForm.website} onChange={e => setCompanyForm({ ...companyForm, website: e.target.value })} /></div>
              
              <div className="md:col-span-2 space-y-3 mt-2">
                <label className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest pl-5">Brand Visual Identity (Logo)</label>
                <div className="flex gap-6 items-center bg-slate-50 dark:bg-[#0b0f14]/50 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
                  <input type="file" accept="image/*" className="hidden" id="modal-logo" onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      compressImage(file, 400).then(res => setCompanyForm({ ...companyForm, logo: res }));
                    }
                  }} />
                  <label htmlFor="modal-logo" className="flex-1 cursor-pointer bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center text-xs font-black text-slate-500 hover:border-emerald-500 hover:text-emerald-500 transition-all uppercase tracking-widest">
                    {companyForm.logo ? 'Change Identity' : 'Upload Identity Logo'}
                  </label>
                  {companyForm.logo ? (
                    <div className="relative group">
                      <img src={companyForm.logo} alt="Preview" className="w-20 h-20 object-contain rounded-2xl bg-white border border-slate-200 p-3 shadow-md" />
                      <button onClick={() => setCompanyForm({...companyForm, logo: ''})} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400"><ImageIcon size={32} /></div>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={async () => { 
                if (!companyForm.name) return toast.error('Company Name is required');
                try {
                  showMsg('Processing partner identity...');
                  const res = await axios.post(`${API}/companies`, companyForm, getConfig()); 
                  const newCompany = res.data;
                  setJobForm({ ...jobForm, company: newCompany.name, companyId: newCompany.id, companyLogo: newCompany.logo });
                  setCompanySearch(newCompany.name);
                  setCompanyForm({ name: '', industry: '', logo: '', companyType: '', location: '', website: '', description: '' }); 
                  fetchData(); 
                  setIsCompanyModalOpen(false);
                  showMsg('Partner Successfully Onboarded'); 
                } catch (err) {
                  toast.error('Failed to onboard partner');
                }
              }} 
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black py-5 rounded-full mt-10 transition-all active:scale-95 shadow-[0_15px_30px_rgba(16,185,129,0.3)] text-lg flex items-center justify-center gap-3"
            >
              <Zap size={20} /> Verify & Authorize Partner
            </button>
          </motion.div>
        </div>
      
  );
};

export default AdminCompanyModal;
