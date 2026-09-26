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
  const [payrollFilter, setPayrollFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const getRole = (a) => a.jobtitle || a.jobTitle;
  const getCompany = (a) => a.companyname || a.companyName;
  const getPayrollStatus = (a) => a.payrollstatus || a.payrollStatus || 'ACCOUNT_OPENING_PENDING';
  const getSubId = (a) => a.subid || a.subId || 'N/A';

  const roles = useMemo(() => [...new Set(applications.map(a => getRole(a)).filter(Boolean))].sort(), [applications]);
  const companies = useMemo(() => [...new Set(applications.map(a => getCompany(a)).filter(Boolean))].sort(), [applications]);

  const handleUpdatePayrollStatus = async (appId, newStatus) => {
    try {
      await axios.put(`${API}/jobs/applications/${appId}/payroll-status`, { payrollStatus: newStatus }, getConfig());
      fetchData();
      showMsg(`Payroll status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update payroll status');
    }
  };

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const term = searchTerm.toLowerCase();
      const role = getRole(app);
      const company = getCompany(app);
      const subId = getSubId(app);
      const pStatus = getPayrollStatus(app);
      
      const matchesSearch = !term || (
        app.name?.toLowerCase().includes(term) || 
        app.email?.toLowerCase().includes(term) || 
        app.phone?.toLowerCase().includes(term) ||
        role?.toLowerCase().includes(term) ||
        subId.toLowerCase().includes(term)
      );
      
      const matchesRole = !roleFilter || role === roleFilter;
      const matchesCompany = !companyFilter || company === companyFilter;
      const matchesPayroll = !payrollFilter || pStatus === payrollFilter;
      
      let matchesDate = true;
      const appTime = parseInt(app.appliedat || app.createdAt || app.appliedAt || Date.now());
      if (fromDate) {
        matchesDate = matchesDate && (appTime >= new Date(fromDate).getTime());
      }
      if (toDate) {
        const toTime = new Date(toDate).getTime() + 86400000;
        matchesDate = matchesDate && (appTime < toTime);
      }
      
      return matchesSearch && matchesRole && matchesCompany && matchesPayroll && matchesDate;
    });
  }, [applications, searchTerm, roleFilter, companyFilter, payrollFilter, fromDate, toDate]);

  const renderPayrollBadge = (status) => {
    if (status === 'PAYROLL_ACTIVE') {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Payroll Active</span>;
    }
    if (status === 'ACCOUNT_VERIFIED') {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EFF3FF] dark:bg-[#1A62FE]/10 text-[#001F8E] dark:text-[#1A62FE] border border-[#1A62FE]/20">Account Verified</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Kotak Opening Pending</span>;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5">
      {/* Scalable Applicant Data Manager */}
      <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl">

        {/* Table Header & Controls */}
        <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800/60">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-3">
              <Users className="text-[#001F8E] dark:text-[#1A62FE]" size={22} /> Applicant & Kotak 811 Tracking
              <span className="bg-[#EFF3FF] dark:bg-[#1A62FE]/10 text-[#001F8E] dark:text-[#1A62FE] border border-[#1A62FE]/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider ml-1">
                {applications.length} TOTAL
              </span>
            </h2>
          </div>

          {/* Global Search & Filters */}
          <div className="flex flex-col gap-3.5">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by applicant name, email, job title, or Sub-ID..."
                className="w-full bg-slate-50 dark:bg-[#0b0f14]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-[#1A62FE] focus:ring-2 focus:ring-[#1A62FE]/20 outline-none transition-all shadow-inner font-medium"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              <select className="bg-slate-50 dark:bg-[#0b0f14]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-[#1A62FE]" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select className="bg-slate-50 dark:bg-[#0b0f14]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-[#1A62FE]" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}>
                <option value="">All Companies</option>
                {companies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="bg-slate-50 dark:bg-[#0b0f14]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-[#1A62FE]" value={payrollFilter} onChange={e => setPayrollFilter(e.target.value)}>
                <option value="">All Payroll Statuses</option>
                <option value="ACCOUNT_OPENING_PENDING">Kotak Opening Pending</option>
                <option value="ACCOUNT_VERIFIED">Account Verified</option>
                <option value="PAYROLL_ACTIVE">Payroll Active</option>
              </select>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0b0f14]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3 py-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">From</span>
                <input type="date" className="bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0b0f14]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-3 py-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">To</span>
                <input type="date" className="bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none" value={toDate} onChange={e => setToDate(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Unified Scalable Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0b0f14]/50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Position Applied</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Kotak 811 / Payroll</th>
                <th className="px-6 py-4 text-center">Applied On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {filteredApps.map(app => (
                <tr key={app.id} className="applicant-row hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{app.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">Sub-ID: {getSubId(app)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-[#001F8E] dark:group-hover:text-[#1A62FE] transition-colors text-sm">
                      {getRole(app) || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                      <Building2 size={12} className="text-slate-400" /> {getCompany(app) || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{app.email}</div>
                    <div className="text-xs text-slate-500 font-normal mt-0.5">{app.phone || 'No Phone'}</div>
                    {app.city && <div className="text-[10px] font-bold text-[#001F8E] dark:text-[#1A62FE] uppercase mt-0.5">{app.city} {app.vehiclestatus || app.vehicleStatus ? `• ${app.vehiclestatus || app.vehicleStatus}` : ''}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <div>{renderPayrollBadge(getPayrollStatus(app))}</div>
                      <select 
                        value={getPayrollStatus(app)} 
                        onChange={(e) => handleUpdatePayrollStatus(app.id, e.target.value)}
                        className="text-[11px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 outline-none font-medium cursor-pointer hover:border-[#1A62FE] transition-colors"
                      >
                        <option value="ACCOUNT_OPENING_PENDING">Opening Pending</option>
                        <option value="ACCOUNT_VERIFIED">Verify Account</option>
                        <option value="PAYROLL_ACTIVE">Activate Payroll</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap">
                      <Calendar size={12} /> {new Date(parseInt(app.appliedat || app.createdAt || app.appliedAt || Date.now())).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {app.resume && (
                        <a href={app.resume} target="_blank" rel="noreferrer" className="p-2 bg-[#EFF3FF] hover:bg-[#1A62FE]/20 dark:bg-[#1A62FE]/10 rounded-lg text-[#001F8E] dark:text-[#1A62FE] transition-all border border-[#1A62FE]/20" title="View Resume">
                          <Download size={15} />
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
                        className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 rounded-lg text-rose-600 dark:text-rose-400 transition-all border border-rose-200 dark:border-rose-500/20"
                        title="Delete Applicant"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-20 text-slate-400">
                    <Users size={36} className="mx-auto mb-3 opacity-40" />
                    <p className="font-bold text-xs">No applications match your criteria</p>
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
