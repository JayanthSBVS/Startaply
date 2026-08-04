import React from 'react';
import { MessageSquareQuote, Star, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API, inputCls, textareaCls } from './adminConstants';
import { compressImage } from '../../utils/imageCompression';

const AdminTestimonials = ({
  testimonialForm,
  setTestimonialForm,
  testimonials,
  fetchData,
  showMsg,
  confirmAction,
  getConfig
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/60 sticky top-24 shadow-2xl">
          <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-purple-400"><Star size={24} /> Add Testimonial</h3>
          <div className="space-y-4">
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Full Name</label><input className={inputCls} value={testimonialForm.name} onChange={e => setTestimonialForm({ ...testimonialForm, name: e.target.value })} placeholder="John Doe" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Tagline / Role</label><input className={inputCls} value={testimonialForm.tagline} onChange={e => setTestimonialForm({ ...testimonialForm, tagline: e.target.value })} placeholder="Senior Developer" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Review</label><textarea rows="4" className={textareaCls} value={testimonialForm.description} onChange={e => setTestimonialForm({ ...testimonialForm, description: e.target.value })} placeholder="Their success story..."></textarea></div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Candidate Photo</label>
              <div className="flex gap-2 items-center">
                <input
                  id="testimonial-upload-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onClick={(e) => { e.target.value = null; }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    try {
                      showMsg('Processing image...');
                      const compressed = await compressImage(file, 400, 0.75);
                      setTestimonialForm(f => ({ ...f, photo: compressed }));
                    } catch (err) {
                      toast.error('Could not read image. Try a different file.');
                    }
                  }}
                />
                <label htmlFor="testimonial-upload-input" className="flex-1 cursor-pointer bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl px-5 py-4 text-sm text-center text-slate-600 dark:text-slate-300 font-bold transition-all block select-none">
                  {testimonialForm.photo ? '✓ Image Ready' : '📷 Click to Upload Photo'}
                </label>
                {testimonialForm.photo && (
                  <button type="button" onClick={() => setTestimonialForm(f => ({ ...f, photo: '' }))} className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-black transition-all shrink-0"><Trash2 size={16}/></button>
                )}
              </div>
              {testimonialForm.photo && (
                <div className="mt-2 rounded-2xl overflow-hidden border-2 border-emerald-500/40 w-20 h-20 shadow-md">
                  <img src={testimonialForm.photo} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }} />
                </div>
              )}
            </div>
            <button type="button" onClick={async () => { 
              if (!testimonialForm.name?.trim() || !testimonialForm.description?.trim()) {
                toast.error('Please fill in at least Name and Review fields.');
                return;
              }
              try {
                await axios.post(`${API}/testimonials`, testimonialForm, getConfig()); 
                setTestimonialForm({ name: '', tagline: '', description: '', photo: '' }); 
                fetchData(); 
                showMsg('Testimonial published!'); 
              } catch (err) {
                toast.error('Failed to publish testimonial');
              }
            }} className="w-full bg-purple-500 hover:bg-purple-400 text-white font-black py-4 rounded-full mt-4 transition-all shadow-lg shadow-purple-500/20">Publish Testimonial</button>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map(t => (
          <div key={t.id} className="bg-white dark:bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/60 shadow-xl relative group">
            <button onClick={() => confirmAction('Delete testimonial?', async () => { await axios.delete(`${API}/testimonials/${t.id}`, getConfig()); fetchData(); showMsg('Removed'); })} className="absolute top-6 right-6 p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700/50">
                {t.photo ? <img src={t.photo} alt={t.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl font-black text-slate-400">{t.name?.charAt(0)}</div>}
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white">{t.name}</h4>
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{t.tagline}</p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium italic">"{t.description}"</p>
          </div>
        ))}
        {testimonials.length === 0 && (
          <div className="col-span-full text-center py-20 bg-slate-50 dark:bg-slate-900/20 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-800">
            <MessageSquareQuote size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-slate-500 font-bold">No testimonials added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(AdminTestimonials);
