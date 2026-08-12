import React, { useState, useMemo } from 'react';
import { Users, Search, Download, Trash2, Filter, Building2, Calendar } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API } from './adminConstants';

const AdminApplications = ({
  applications,
  confirmAction,
  fetchData,
  showMsg,
  getConfig
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const getRole = (a) => a.jobtitle || a.jobTitle;
  const getCompany = (a) => a.companyname || a.companyName;

  const roles = useMemo(() => [...new Set(applications.map(a => getRole(a)).filter(Boolean))].sort(), [applications]);
  const companies = useMemo(() => [...new Set(applications.map(a => getCompany(a)).filter(Boolean))].sort(), [applications]);

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const term = searchTerm.toLowerCase();
      const role = getRole(app);
      const company = getCompany(app);
      
      const matchesSearch = !term || (
        app.name?.toLowerCase().includes(term) || 
        app.email?.toLowerCase().includes(term) || 
        app.phone?.toLowerCase().includes(term) ||
        role?.toLowerCase().includes(term)
      );
      
      const matchesRole = !roleFilter || role === roleFilter;
      const matchesCompany = !companyFilter || company === companyFilter;
      
      let matchesDate = true;
      const appTime = parseInt(app.appliedat || app.createdAt || app.appliedAt || Date.now());
      if (fromDate) {
        matchesDate = matchesDate && (appTime >= new Date(fromDate).getTime());
      }
      if (toDate) {
        const toTime = new Date(toDate).getTime() + 86400000;
        matchesDate = matchesDate && (appTime < toTime);
      }
      
      return matchesSearch && matchesRole && matchesCompany && matchesDate;
    });
  }, [applications, searchTerm, roleFilter, companyFilter, fromDate, toDate]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5">
      {/* Scalable Applicant Data Manager */}
      <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 rounded-[2.5rem] overflow-hidden shadow-sm dark:shadow-2xl">

        {/* Table Header & Controls */}
        <div className="p-8 border-b border-slate-200 dark:border-slate-800/60">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-4">
              <Users className="text-emerald-400" /> Applicant Tracking
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-black tracking-widest ml-2">
                {applications.length} TOTAL
              </span>
            </h2>
          </div>

          {/* Global Search & Filters */}
          <div className="flex flex-col gap-4">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search by applicant name, email, or job title..."
                className="w-full bg-slate-50 dark:bg-[#0b0f14]/50 border border-slate-200 dark:border-slate-700/50 rounded-full pl-12 pr-5 py-3.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-inner"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select className="bg-slate-50 dark:bg-[#0b0f14]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select className="bg-slate-50 dark:bg-[#0b0f14]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}>
                <option value="">All Companies</option>
                {companies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0b0f14]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">From</span>
                <input type="date" className="bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0b0f14]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">To</span>
                <input type="date" className="bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none" value={toDate} onChange={e => setToDate(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Unified Scalable Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0b0f14]/50 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black border-b border-slate-800">
                <th className="px-8 py-5">Applicant</th>
                <th className="px-8 py-5">Position Applied</th>
                <th className="px-8 py-5">Contact Info</th>
                <th className="px-8 py-5 text-center">Applied On</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredApps.map(app => (
                <tr key={app.id} className="applicant-row hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-base">{app.name}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                      {getRole(app) || 'N/A'}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-1">
                      <Building2 size={12} /> {getCompany(app) || 'N/A'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{app.email}</div>
                    <div className="text-xs text-slate-500 font-bold mt-1">{app.phone || 'No Phone Provided'}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                      <Calendar size={12} /> {new Date(parseInt(app.appliedat || app.createdAt || app.appliedAt || Date.now())).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      {app.resume && (
                        <a href={app.resume} target="_blank" rel="noreferrer" className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-emerald-500 transition-all border border-emerald-500/20" title="View Resume">
                          <Download size={18} />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          confirmAction(`Permanently delete applicant ${app.name}?`, async () => {
                            try {
                              await axios.delete(`${API}/jobs/applications/${app.id}`, getConfig());
                              fetchData();
                              showMsg('Application Deleted');
                            } catch (err) {
                              toast.error('Failed to delete applicant');
                            }
                          });
                        }}
                        className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-all border border-rose-500/20"
                        title="Delete Applicant"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-32 text-slate-500">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-bold uppercase tracking-widest text-xs">No applications found in database</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AdminApplications);
