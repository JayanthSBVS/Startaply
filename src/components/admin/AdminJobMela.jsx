import React from 'react';
import { Megaphone, Zap, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API, inputCls } from './adminConstants';
import { compressImage } from '../../utils/imageCompression';

const AdminJobMela = ({
  melaForm,
  setMelaForm,
  melas,
  fetchData,
  showMsg,
  confirmAction,
  getConfig
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 rounded-[2.5rem] p-10">
        <h3 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-900 dark:text-white"><Megaphone className="text-amber-400" /> Job Mela Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Mela Title</label><input className={inputCls} value={melaForm.title} onChange={e => setMelaForm({ ...melaForm, title: e.target.value })} placeholder="Career Mega Fair 2024" /></div>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Target Date</label><input type="date" className={inputCls} value={melaForm.date} onChange={e => setMelaForm({ ...melaForm, date: e.target.value })} /></div>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Organising Company</label><input className={inputCls} value={melaForm.company || ''} onChange={e => setMelaForm({ ...melaForm, company: e.target.value })} placeholder="e.g. TCS, Infosys" /></div>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Timing</label><input className={inputCls} value={melaForm.time} onChange={e => setMelaForm({ ...melaForm, time: e.target.value })} placeholder="10:00 AM - 4:00 PM" /></div>
          <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Venue / Location (Text)</label><input className={inputCls} value={melaForm.venue} onChange={e => setMelaForm({ ...melaForm, venue: e.target.value })} placeholder="Online / Hyderabad Convention Centre" /></div>

          {/* Banner Image */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">🖼️ Banner Image Upload</label>
            <input 
              type="file" 
              accept="image/*"
              className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 font-medium text-slate-900 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-500/10 file:text-emerald-500 dark:file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer" 
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  compressImage(file, 1200).then(res => setMelaForm({ ...melaForm, bannerImage: res }));
                }
              }} 
            />
            {melaForm.bannerImage && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-200 dark:border-slate-700/50 h-40 w-fit">
                <img src={melaForm.bannerImage} alt="Banner Preview" className="h-full object-contain" onError={e => e.target.style.display='none'} />
              </div>
            )}
          </div>

          {/* Google Map Link */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest">📍 Google Maps Embed Link</label>
            <input className={inputCls} value={melaForm.googleMapLink || ''} onChange={e => setMelaForm({ ...melaForm, googleMapLink: e.target.value })} placeholder="https://www.google.com/maps/embed?pb=..." />
            <p className="text-[10px] text-slate-500 font-bold pl-2">Go to Google Maps → Share → Embed a map → Copy the src URL from the iframe code</p>
          </div>

          <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">External Registration Link</label><input className={inputCls} value={melaForm.registrationLink} onChange={e => setMelaForm({ ...melaForm, registrationLink: e.target.value })} placeholder="https://forms.gle/..." /></div>

          <div className="flex gap-10 bg-slate-950/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 md:col-span-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-black uppercase text-slate-500">Live Ticker</span>
              <button onClick={() => setMelaForm({ ...melaForm, isActive: !melaForm.isActive })} className={`w-12 h-6 rounded-full transition-colors relative ${melaForm.isActive ? 'bg-amber-500' : 'bg-slate-700'}`}><div className={`absolute top-1.5 w-3 h-3 bg-white rounded-full transition-all ${melaForm.isActive ? 'left-7' : 'left-2'}`} /></button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-black uppercase text-slate-500">Auto-Popup</span>
              <button onClick={() => setMelaForm({ ...melaForm, showPopup: !melaForm.showPopup })} className={`w-12 h-6 rounded-full transition-colors relative ${melaForm.showPopup ? 'bg-emerald-500' : 'bg-slate-700'}`}><div className={`absolute top-1.5 w-3 h-3 bg-white rounded-full transition-all ${melaForm.showPopup ? 'left-7' : 'left-2'}`} /></button>
            </div>
          </div>
        </div>
        <button onClick={async () => { await axios.post(`${API}/job-mela`, melaForm, getConfig()); setMelaForm({ title: '', date: '', venue: '', time: '', isActive: true, showPopup: true, company: '', registrationLink: '', bannerImage: '', googleMapLink: '' }); fetchData(); showMsg('Mela Created Successfully'); }} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-5 rounded-full mt-10 transition-all shadow-xl shadow-amber-500/10">🚀 Publish Job Mela</button>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-black flex items-center gap-2 px-4 text-slate-900 dark:text-white"><Zap size={20} className="text-amber-400" /> All Job Melas</h4>
        {melas.map(m => (
          <div key={m.id} className="bg-white dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {(m.bannerimage || m.bannerImage) && (
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 flex-shrink-0">
                  <img src={m.bannerimage || m.bannerImage} alt={m.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="min-w-0">
                <div className="font-extrabold text-slate-900 dark:text-slate-200 truncate">{m.title}</div>
                <div className="text-xs text-slate-500 font-bold mt-1">{m.date} • {m.venue}</div>
                {(m.googlemaplink || m.googleMapLink) && <div className="text-[10px] text-blue-400 font-bold mt-0.5">📍 Map link added</div>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={async () => {
                  try {
                    await axios.put(`${API}/job-mela/${m.id}/set-active`, {}, getConfig());
                    fetchData();
                    showMsg(`"${m.title}" is now active for Live Ticker & Popup!`);
                  } catch (err) {
                    toast.error('Failed to set active Job Mela');
                  }
                }}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                  m.isActive || m.isactive
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/20 font-black' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-500/20 hover:text-amber-400'
                }`}
                title="Click to set this Job Mela as active on live ticker and homepage popup"
              >
                <Zap size={14} className={m.isActive || m.isactive ? 'fill-current' : ''} />
                {m.isActive || m.isactive ? 'Active on Ticker & Popup' : 'Set as Active'}
              </button>

              <button 
                onClick={() => confirmAction(`Delete Job Mela "${m.title}"?`, async () => { 
                  await axios.delete(`${API}/job-mela/${m.id}`, getConfig()); 
                  fetchData(); 
                  showMsg('Removed'); 
                })} 
                className="p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl text-rose-500 transition-colors shrink-0"
                title="Delete Mela"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {melas.length === 0 && (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-800">
            <Megaphone size={40} className="mx-auto text-slate-700 mb-3" />
            <p className="text-slate-500 font-bold text-sm">No Job Melas yet. Create one above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(AdminJobMela);
