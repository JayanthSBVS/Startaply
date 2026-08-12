import React from 'react';
import { PlusCircle, Search, Building2, ChevronRight } from 'lucide-react';
import { inputCls, selectCls, textareaCls } from './adminConstants';

const AdminJobForm = ({
  jobForm,
  setJobForm,
  editingJobId,
  companySearch,
  setCompanySearch,
  showCompanyList,
  setShowCompanyList,
  companies,
  setIsCompanyModalOpen,
  handleJobSubmit
}) => {
  return (
    <div className="bg-white dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200 dark:border-slate-200 dark:border-slate-800/60 rounded-[2.5rem] p-6 md:p-10 shadow-2xl max-w-5xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <h2 className="text-3xl font-black mb-10 border-b border-slate-200 dark:border-slate-800/60 pb-6 text-slate-900 dark:text-white flex items-center gap-4 relative z-10">
        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400"><PlusCircle size={28} /></div>
        {editingJobId ? 'Edit Performance Listing' : 'Publish New Opportunity'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Job Title *</label><input className={inputCls} value={jobForm.title || ''} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} placeholder="Software Engineer" /></div>
        <div className="space-y-2 relative">
          <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">
            Company {jobForm.jobCategory === 'Government Jobs' ? '(Optional)' : '*'}
          </label>
          <div className="relative group/search">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  className={inputCls + " pl-12"} 
                  value={companySearch || jobForm.company || ''} 
                  onChange={e => {
                    setCompanySearch(e.target.value);
                    setShowCompanyList(true);
                    if (!e.target.value) setJobForm({...jobForm, company: '', companyId: null, companyLogo: ''});
                  }} 
                  onFocus={() => setShowCompanyList(true)}
                  placeholder="Search or Select Company..." 
                />
                {showCompanyList && (
                  <div className="absolute top-full left-0 w-full mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[110] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="max-h-72 overflow-y-auto custom-scrollbar p-2 space-y-1">
                      {companies.filter(c => c.name.toLowerCase().includes((companySearch || '').toLowerCase())).length > 0 ? (
                        companies.filter(c => c.name.toLowerCase().includes((companySearch || '').toLowerCase())).map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setJobForm({ ...jobForm, company: c.name, companyId: c.id, companyLogo: c.logo });
                              setCompanySearch(c.name);
                              setShowCompanyList(false);
                            }}
                            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-left transition-all rounded-2xl group/item"
                          >
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover/item:border-emerald-300 transition-colors">
                              {c.logo ? <img src={c.logo} alt="" className="w-full h-full object-contain p-1" /> : <Building2 size={18} className="text-slate-400" />}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-black text-slate-900 dark:text-slate-200 truncate">{c.name}</div>
                              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{c.industry || 'General Partner'} • {c.location || 'Remote'}</div>
                            </div>
                            <ChevronRight size={14} className="ml-auto text-slate-300 opacity-0 group-hover/item:opacity-100 transition-all" />
                          </button>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Building2 size={24} className="text-slate-300" />
                          </div>
                          <div className="text-sm font-bold text-slate-500 mb-1">No partners found</div>
                          <button 
                            onClick={() => { setIsCompanyModalOpen(true); setShowCompanyList(false); }}
                            className="text-xs font-black text-emerald-500 uppercase tracking-widest hover:underline"
                          >
                            Create "{companySearch}"?
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsCompanyModalOpen(true)}
                type="button"
                className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 hover:bg-emerald-500/20 transition-all shadow-sm"
                title="Create New Company"
              >
                <PlusCircle size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 relative">
              <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Category *</label>
              <select className={selectCls} value={jobForm.jobCategory || ''} onChange={e => setJobForm({ ...jobForm, jobCategory: e.target.value, govtJobType: '', stateName: '', jobCategoryType: '' })}>
                <option value="">Select Category</option>
                <option value="IT & Non-IT Jobs">IT & Non-IT Jobs</option>
                <option value="Government Jobs">Government Jobs</option>
                <option value="Private Jobs">Private Jobs</option>
                <option value="Fresher Jobs">Fresher Jobs</option>
                <option value="Gig & Services">Gig & Services</option>
              </select>
              <div className="absolute right-5 top-[38px] pointer-events-none text-slate-500">▼</div>
            </div>

            {jobForm.jobCategory === 'Government Jobs' && (
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Govt Job Type *</label>
                <select className={selectCls} value={jobForm.govtJobType || ''} onChange={e => setJobForm({ ...jobForm, govtJobType: e.target.value, stateName: '' })}>
                  <option value="">Select Type</option>
                  <option value="Central">Central Govt Job</option>
                  <option value="State">State Govt Job</option>
                </select>
                <div className="absolute right-5 top-[38px] pointer-events-none text-slate-500">▼</div>
              </div>
            )}

            {jobForm.jobCategory === 'Government Jobs' && (
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Govt Department *</label>
                <select className={selectCls} value={jobForm.govtDept || ''} onChange={e => setJobForm({ ...jobForm, govtDept: e.target.value })}>
                  <option value="">Select Department</option>
                  <option value="Teaching">Teaching / Education</option>
                  <option value="Police">Police / Security</option>
                  <option value="Military">Military / Defence</option>
                  <option value="Railway">Railway</option>
                  <option value="Banking">Banking & Finance</option>
                  <option value="Healthcare">Healthcare / Medical</option>
                  <option value="Judiciary">Judiciary / Law</option>
                  <option value="UPSC / PSC">UPSC / PSC</option>
                  <option value="Others">Others</option>
                </select>
                <div className="absolute right-5 top-[38px] pointer-events-none text-slate-500">▼</div>
              </div>
            )}

            {jobForm.jobCategory === 'Government Jobs' && jobForm.govtJobType === 'State' && (
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">State Name *</label>
                <select className={selectCls} value={jobForm.stateName || ''} onChange={e => setJobForm({ ...jobForm, stateName: e.target.value })}>
                  <option value="">Select State</option>
                  {['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-5 top-[38px] pointer-events-none text-slate-500">▼</div>
              </div>
            )}

            {jobForm.jobCategory === 'IT & Non-IT Jobs' && (
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Job Specialization *</label>
                <select className={selectCls} value={jobForm.jobCategoryType || ''} onChange={e => setJobForm({ ...jobForm, jobCategoryType: e.target.value, processType: e.target.value === 'IT Job' ? 'Standard' : (jobForm.processType || 'Standard') })}>
                  <option value="">Select Specialization</option>
                  <option value="IT Job">IT Job</option>
                  <option value="Non-IT Job">Non-IT Job</option>
                </select>
                <div className="absolute right-5 top-[38px] pointer-events-none text-slate-500">▼</div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 relative">
          <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Process Type</label>
          <select className={selectCls} value={jobForm.processType || 'Standard'} onChange={e => setJobForm({ ...jobForm, processType: e.target.value })}>
            <option value="Standard">Standard / Normal Role</option>
            {jobForm.jobCategoryType !== 'IT Job' && (
              <>
                <option value="Voice Process">Voice Process</option>
                <option value="Non-Voice Process">Non-Voice Process</option>
              </>
            )}
          </select>
          <div className="absolute right-5 top-[38px] pointer-events-none text-slate-500">▼</div>
        </div>

        <div className="space-y-2 relative">
          <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Application Flow</label>
          <select className={selectCls} value={jobForm.applyType || 'external'} onChange={e => setJobForm({ ...jobForm, applyType: e.target.value })}>
            <option value="external">Third Party (Redirect)</option>
            <option value="easy">Internal (Easy Apply)</option>
          </select>
          <div className="absolute right-5 top-[38px] pointer-events-none text-slate-500">▼</div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-rose-400 tracking-widest">Last Date (Days to Auto-Hide)</label>
          <input
            type="number"
            min="1"
            className={inputCls}
            value={jobForm.expiryDays === null || jobForm.expiryDays === undefined ? '' : jobForm.expiryDays}
            onChange={e => {
              const val = e.target.value;
              setJobForm({ ...jobForm, expiryDays: val === '' ? '' : parseInt(val) });
            }}
            placeholder="e.g. 30 (Leave blank for no auto-hide)"
          />
        </div>

        {jobForm.applyType === 'external' && <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Third Party URL</label><input className={inputCls} value={jobForm.applyUrl || ''} onChange={e => setJobForm({ ...jobForm, applyUrl: e.target.value })} placeholder="https://careers.google.com/..." /></div>}

        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Salary Package</label><input className={inputCls} value={jobForm.salary || ''} onChange={e => setJobForm({ ...jobForm, salary: e.target.value })} placeholder="12 LPA - 15 LPA" /></div>
        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Work Location</label><input className={inputCls} value={jobForm.location || ''} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} placeholder="Bangalore / Remote" /></div>

        {(jobForm.processType === 'Voice Process' || jobForm.processType === 'Non-Voice Process') && (
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Google Maps Embed URL (For Walk-ins)</label>
            <input className={inputCls} value={jobForm.mapLocationUrl || ''} onChange={e => setJobForm({ ...jobForm, mapLocationUrl: e.target.value })} placeholder="https://www.google.com/maps/embed?..." />
          </div>
        )}

        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Experience</label><input className={inputCls} value={jobForm.experience || ''} onChange={e => setJobForm({ ...jobForm, experience: e.target.value })} placeholder="2+ Years" /></div>
        <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Qualification</label><input className={inputCls} value={jobForm.qualification || ''} onChange={e => setJobForm({ ...jobForm, qualification: e.target.value })} placeholder="B.Tech / MCA" /></div>

        <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Job Card Small Info (Reflected on Job Card first)</label><textarea rows="2" className={textareaCls} value={jobForm.description || ''} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} placeholder="Brief summary of the job..."></textarea></div>
        <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Benefits & Perks</label><textarea rows="3" className={textareaCls} value={jobForm.benefits || ''} onChange={e => setJobForm({ ...jobForm, benefits: e.target.value })} placeholder="Provide details about health insurance, PTO, bonuses..."></textarea></div>
        <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Detailed Description</label><textarea rows="5" className={textareaCls} value={jobForm.fullDescription || ''} onChange={e => setJobForm({ ...jobForm, fullDescription: e.target.value })} placeholder="Full job scope..."></textarea></div>
        <div className="md:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Required Skills (Comma separated)</label><input className={inputCls} value={jobForm.requiredSkills || ''} onChange={e => setJobForm({ ...jobForm, requiredSkills: e.target.value })} placeholder="React, Python, SQL" /></div>

        <div className="space-y-2 md:col-span-2"><label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Detail Fields</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <select className={selectCls} value={jobForm.workMode || ''} onChange={e => setJobForm({ ...jobForm, workMode: e.target.value })}>
                <option value="">Work Mode</option>
                <option>On-site</option><option>Remote</option><option>Hybrid</option>
              </select>
              <div className="absolute right-5 top-[14px] pointer-events-none text-slate-500">▼</div>
            </div>
            <div className="relative">
              <select className={selectCls} value={jobForm.type || ''} onChange={e => setJobForm({ ...jobForm, type: e.target.value })}>
                <option value="">Job Type</option>
                <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
              </select>
              <div className="absolute right-5 top-[14px] pointer-events-none text-slate-500">▼</div>
            </div>
          </div>
        </div>
      </div>
      <button onClick={handleJobSubmit} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg py-5 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] mt-10 transition-all active:scale-[0.98] relative z-10">{editingJobId ? 'Update & Sync Job' : 'Publish to Live Portal'}</button>
    </div>
  );
};

export default React.memo(AdminJobForm);
