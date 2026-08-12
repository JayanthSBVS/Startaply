import React from 'react';
import { Building2, Trash2 } from 'lucide-react';
import axios from 'axios';
import { API, inputCls, selectCls } from './adminConstants';
import { compressImage } from '../../utils/imageCompression';
import { publishFreshness } from '../../utils/dataFreshness';

const AdminCompanies = ({
  companyForm,
  setCompanyForm,
  companies,
  fetchData,
  showMsg,
  confirmAction,
  getConfig,
  userProfile,
  isManager
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 p-8 rounded-[2.5rem] sticky top-24">
          <h3 className="text-xl font-black mb-6 flex items-center gap-3"><Building2 className="text-purple-400" /> New Company</h3>
          <div className="space-y-4">
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Name</label><input className={inputCls} placeholder="Company Name" value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Industry</label><input className={inputCls} placeholder="e.g. Technology" value={companyForm.industry} onChange={e => setCompanyForm({ ...companyForm, industry: e.target.value })} /></div>
            <div className="space-y-2 relative"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Company Type</label><select className={selectCls} value={companyForm.companyType} onChange={e => setCompanyForm({ ...companyForm, companyType: e.target.value })}><option value="">Select Type</option><option>MNC</option><option>Startup</option><option>Product Based</option><option>Service Based</option><option>Govt PSU</option><option>Remote First</option><option>Unicorn</option></select><div className="absolute right-5 top-[38px] pointer-events-none text-slate-500">▼</div></div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Company Logo</label>
              <input 
                type="file" 
                accept="image/*"
                className="w-full border border-slate-700/50 rounded-xl px-4 py-3 font-medium text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer" 
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    compressImage(file, 400).then(res => setCompanyForm({ ...companyForm, logo: res }));
                  }
                }} 
              />
              {companyForm.logo && <img src={companyForm.logo} alt="Preview" className="w-16 h-16 object-contain mt-2 bg-white/5 rounded-xl border border-slate-700 p-2" />}
            </div>
            <button onClick={async () => { 
              const res = await axios.post(`${API}/companies`, companyForm, getConfig()); 
              publishFreshness('companies', 'create', res.data?.id || 'new');
              setCompanyForm({ name: '', industry: '', logo: '' }); 
              fetchData(); 
              showMsg('Company added'); 
            }} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-full mt-4 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">Add Partner</button>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map(comp => (
          <div key={comp.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 p-6 rounded-[2rem] flex items-center justify-between group overflow-hidden relative">
            <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
              <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">{comp.logo ? <img src={comp.logo} alt={comp.name} className="w-full h-full object-contain" /> : <Building2 className="text-slate-600" />}</div>
              <div className="min-w-0">
                <div className="font-extrabold text-slate-900 dark:text-slate-200 truncate">{comp.name}</div>
                <div className="text-[10px] font-black text-slate-500 tracking-widest uppercase">{comp.industry}</div>
                {comp.companyType && <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">{comp.companyType}</span>}
              </div>
            </div>
            <button 
              onClick={() => confirmAction(`Delete company "${comp.name}"?`, async () => { 
                await axios.delete(`${API}/companies/${comp.id}`, getConfig()); 
                publishFreshness('companies', 'delete', comp.id);
                fetchData(); 
                showMsg('Company removed'); 
              })} 
              className="p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl text-rose-500 transition-all opacity-0 group-hover:opacity-100 relative z-10 shrink-0"
              title="Delete Company"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(AdminCompanies);
