import React from 'react';
import { BookOpen, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API, inputCls, selectCls, textareaCls } from './adminConstants';

const AdminPrepData = ({
  prepForm,
  setPrepForm,
  prepData,
  fetchData,
  showMsg,
  confirmAction,
  getConfig
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 max-w-3xl mx-auto space-y-8">
      {/* Add Form */}
      <div className="bg-white dark:bg-slate-900/40 p-6 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/60 shadow-2xl">
        <h3 className="text-xl md:text-2xl font-black mb-8 flex items-center gap-4 text-emerald-400"><BookOpen size={28} /> New Preparation Content</h3>
        <div className="space-y-5">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Target Category</label>
            <div className="relative">
              <select className={selectCls} value={prepForm.jobType} onChange={e => setPrepForm({ ...prepForm, jobType: e.target.value })}>
                <option>IT Jobs</option><option>Non-IT Jobs</option><option>Government Jobs</option>
              </select>
              <div className="absolute right-5 top-[14px] pointer-events-none text-slate-500">▼</div>
            </div>
          </div>

          {/* Content Type */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Content Type</label>
            <div className="flex flex-wrap gap-2">
              {[{ val: 'article', label: '📝 Article / Tips' }, { val: 'qna', label: '❓ Q&A' }, { val: 'paper', label: '📄 Previous Year Paper' }].map(opt => (
                <button key={opt.val} onClick={() => setPrepForm({ ...prepForm, contentType: opt.val })}
                  className={`px-4 py-2 rounded-full text-xs font-black border transition-all ${
                    prepForm.contentType === opt.val
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-slate-500'
                  }`}>{opt.label}</button>
              ))}
            </div>
          </div>

          {/* Article Fields */}
          {prepForm.contentType === 'article' && (
            <>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Title / Topic</label><input className={inputCls} placeholder="e.g. React Interview Basics" value={prepForm.heading} onChange={e => setPrepForm({ ...prepForm, heading: e.target.value })} /></div>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Content / Body</label><textarea rows="8" className={textareaCls} placeholder="Write tips, guides, key points..." value={prepForm.content} onChange={e => setPrepForm({ ...prepForm, content: e.target.value })}></textarea></div>
            </>
          )}

          {/* Q&A Fields */}
          {prepForm.contentType === 'qna' && (
            <>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest pl-1">Question</label><input className={inputCls} placeholder="e.g. What is polymorphism?" value={prepForm.question} onChange={e => setPrepForm({ ...prepForm, question: e.target.value, heading: e.target.value })} /></div>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Answer</label><textarea rows="6" className={textareaCls} placeholder="Detailed answer..." value={prepForm.answer} onChange={e => setPrepForm({ ...prepForm, answer: e.target.value, content: e.target.value })}></textarea></div>
            </>
          )}

          {/* Paper Fields */}
          {prepForm.contentType === 'paper' && (
            <>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-amber-500 tracking-widest pl-1">Paper Title</label><input className={inputCls} placeholder="e.g. UPSC Prelims 2023 GS Paper" value={prepForm.heading} onChange={e => setPrepForm({ ...prepForm, heading: e.target.value })} /></div>
              
              {/* File upload OR URL */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-amber-500 tracking-widest pl-1">Upload PDF from Device</label>
                <div className="flex gap-2 items-center">
                  <input
                    id="prep-paper-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword"
                    className="hidden"
                    onClick={(e) => { e.target.value = null; }}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error('File too large. Please upload files under 5MB.');
                        return;
                      }
                      showMsg('Reading file...');
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setPrepForm(f => ({ ...f, fileUrl: ev.target.result }));
                        showMsg('File ready to upload!');
                      };
                      reader.onerror = () => toast.error('Could not read file.');
                      reader.readAsDataURL(file);
                    }}
                  />
                  <label htmlFor="prep-paper-upload" className="flex-1 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 border-2 border-dashed border-amber-500/40 rounded-2xl px-5 py-4 text-sm text-center text-amber-600 dark:text-amber-400 font-bold transition-all block select-none">
                    {prepForm.fileUrl?.startsWith('data:') ? '✓ File Selected' : '📎 Click to Upload PDF / DOC'}
                  </label>
                  {prepForm.fileUrl?.startsWith('data:') && (
                    <button type="button" onClick={() => setPrepForm(f => ({ ...f, fileUrl: '' }))} className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all shrink-0"><Trash2 size={16}/></button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">OR paste URL</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                </div>
                <input className={inputCls} placeholder="https://drive.google.com/... (optional if file uploaded)" value={prepForm.fileUrl?.startsWith('data:') ? '' : prepForm.fileUrl} onChange={e => setPrepForm({ ...prepForm, fileUrl: e.target.value })} disabled={prepForm.fileUrl?.startsWith('data:')} />
              </div>
              
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Description (optional)</label><textarea rows="3" className={textareaCls} placeholder="e.g. 100 questions, 2 hours, GS Paper I" value={prepForm.content} onChange={e => setPrepForm({ ...prepForm, content: e.target.value })}></textarea></div>
            </>
          )}

           <button
            onClick={async () => {
              await axios.post(`${API}/prep-data`, prepForm, getConfig());
              setPrepForm({ heading: '', jobType: 'IT Jobs', content: '', contentType: 'article', fileUrl: '', question: '', answer: '' });
              fetchData();
              showMsg('Prep Material Published');
            }}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-5 rounded-full shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >Publish to Prep Page</button>
        </div>
      </div>

      {/* Existing Items List */}
      <div className="space-y-4">
        <h4 className="text-sm font-black uppercase text-slate-500 tracking-[0.2em] px-2 flex items-center justify-between">
          Existing Materials
          <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-lg text-[10px]">{prepData.length} Items</span>
        </h4>
        {prepData.map(item => (
          <div key={item.id} className="bg-white dark:bg-slate-900/40 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800/80">
            <div className="flex justify-between items-start mb-3 gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700/50">{item.jobtype || item.jobType}</span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                  (item.contenttype || item.contentType) === 'qna' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  (item.contenttype || item.contentType) === 'paper' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                }`}>{(item.contenttype || item.contentType) === 'qna' ? '❓ Q&A' : (item.contenttype || item.contentType) === 'paper' ? '📄 Paper' : '📝 Article'}</span>
              </div>
              <button
                onClick={() => confirmAction('Delete material?', async () => { await axios.delete(`${API}/prep-data/${item.id}`, getConfig()); fetchData(); showMsg('Removed'); })}
                className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-colors flex-shrink-0"
              ><Trash2 size={16} /></button>
            </div>
            <h5 className="font-extrabold text-slate-900 dark:text-slate-100 mb-1 text-sm md:text-base">{item.heading}</h5>
            {(item.contenttype || item.contentType) === 'paper' && (item.fileurl || item.fileUrl) && (
              <a href={item.fileurl || item.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-amber-400 font-bold mt-1 hover:text-amber-300">📥 Download Link</a>
            )}
            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 font-medium mt-1">{item.content}</p>
          </div>
        ))}
        {prepData.length === 0 && (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-800">
            <BookOpen size={40} className="mx-auto text-slate-400 dark:text-slate-700 mb-3" />
            <p className="text-slate-500 font-bold text-sm">No prep materials yet. Add your first one above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(AdminPrepData);
