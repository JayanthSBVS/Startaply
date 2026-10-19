import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { 
  Users, Search, Filter, Download, Trash2, ExternalLink, 
  Linkedin, CheckCircle2, AlertCircle, Clock, Briefcase, 
  GraduationCap, MapPin, Phone, Mail, Sparkles, X, Eye, 
  ChevronRight, RefreshCw, Smartphone, Award, Truck, Laptop, Building2, Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API, inputCls, selectCls } from './adminConstants';

const AdminCandidates = ({
  confirmAction,
  showMsg,
  getConfig,
  userProfile,
  isManager
}) => {
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, it: 0, nonIt: 0, gig: 0, others: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [trackFilter, setTrackFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(null);

  const canDelete = isManager ? isManager() : userProfile?.role === 'manager' || userProfile?.role === 'operational_manager';

  const fetchCandidates = useCallback(async () => {
    try {
      setIsLoading(true);
      const config = getConfig ? getConfig() : null;
      if (!config) return;

      const [listRes, statsRes] = await Promise.all([
        axios.get(`${API}/candidates?limit=200`, config),
        axios.get(`${API}/candidates/stats`, config).catch(() => ({ data: null }))
      ]);

      if (listRes.data && Array.isArray(listRes.data.candidates)) {
        setCandidates(listRes.data.candidates);
      }
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      toast.error('Failed to load candidate roster');
    } finally {
      setIsLoading(false);
    }
  }, [getConfig]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Handle status update
  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      setIsUpdatingStatus(candidateId);
      const config = getConfig ? getConfig() : null;
      await axios.put(`${API}/candidates/${candidateId}/status`, { status: newStatus }, config);
      
      setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c));
      if (selectedCandidate && selectedCandidate.id === candidateId) {
        setSelectedCandidate(prev => ({ ...prev, status: newStatus }));
      }
      if (showMsg) showMsg(`Status updated to ${newStatus}`);
      else toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Status update failed:', err);
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Handle delete
  const handleDeleteCandidate = (candidate) => {
    confirmAction(
      `Are you sure you want to permanently delete candidate record "${candidate.name}" (${candidate.email})?`,
      async () => {
        try {
          const config = getConfig ? getConfig() : null;
          await axios.delete(`${API}/candidates/${candidate.id}`, config);
          setCandidates(prev => prev.filter(c => c.id !== candidate.id));
          if (showMsg) showMsg(`Candidate ${candidate.name} removed successfully`);
          else toast.success(`Candidate removed`);
          if (selectedCandidate?.id === candidate.id) setSelectedCandidate(null);
        } catch (err) {
          toast.error(err.response?.data?.error || 'Failed to delete candidate record');
        }
      },
      "Delete Candidate Record"
    );
  };

  // Filter candidates client-side for ultra-fast instant feedback
  const filteredCandidates = useMemo(() => {
    return candidates.filter(cand => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || (
        cand.name?.toLowerCase().includes(term) ||
        cand.email?.toLowerCase().includes(term) ||
        cand.phone?.includes(term) ||
        cand.city?.toLowerCase().includes(term) ||
        cand.skills?.toLowerCase().includes(term) ||
        cand.qualification?.toLowerCase().includes(term) ||
        cand.subTrack?.toLowerCase().includes(term)
      );

      const matchesTrack = trackFilter === 'all' || cand.careerTrack === trackFilter;

      return matchesSearch && matchesTrack;
    });
  }, [candidates, searchTerm, trackFilter]);

  // CSV Export for operational recruitment teams
  const handleExportCSV = () => {
    if (!filteredCandidates.length) {
      toast.error('No candidate records to export');
      return;
    }

    const headers = [
      'Candidate ID', 'Full Legal Name', 'Email', 'Phone', 'City', 
      'Career Track', 'Sub Track', 'Qualification', 'Skills', 
      'LinkedIn URL', 'WhatsApp Opt-In', 'Registration Date'
    ];

    const rows = filteredCandidates.map(c => [
      `"${c.id}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.email}"`,
      `"${c.phone || ''}"`,
      `"${(c.city || '').replace(/"/g, '""')}"`,
      `"${(c.careerTrack || '').toUpperCase()}"`,
      `"${(c.subTrack || '').replace(/"/g, '""')}"`,
      `"${(c.qualification || '').replace(/"/g, '""')}"`,
      `"${(c.skills || '').replace(/"/g, '""')}"`,
      `"${c.linkedinUrl || ''}"`,
      c.whatsappSync ? 'YES' : 'NO',
      `"${c.createdAt ? new Date(Number(c.createdAt)).toLocaleString('en-IN') : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `startaply_candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredCandidates.length} candidate profiles`);
  };

  const getTrackBadge = (track) => {
    switch (track) {
      case 'it':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Laptop size={12} /> IT / Software
          </span>
        );
      case 'non-it':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Building2 size={12} /> Non-IT / Corp
          </span>
        );
      case 'gig':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Truck size={12} /> Gig & Fleet
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Layers size={12} /> Other Disciplines
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PLACED':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'SHORTLISTED':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'VERIFIED':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'SUSPENDED':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* ── TOP METRICS CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Registered</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total || candidates.length}</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <Sparkles size={11} /> 100% Verified
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Signups</p>
          <p className="text-2xl font-black text-brand dark:text-brand-hover mt-1">{stats.today || 0}</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 font-semibold">
            <Clock size={11} /> Last 24 Hours
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 shadow-xs">
          <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">IT / Software</p>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">{stats.it || 0}</p>
          <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 font-medium mt-1">Tech & Coding</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Non-IT / Corp</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{stats.nonIt || 0}</p>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium mt-1">Business & Sales</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 shadow-xs">
          <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Gig & Fleet</p>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">{stats.gig || 0}</p>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium mt-1">Field Logistics</p>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 shadow-xs">
          <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Other Sectors</p>
          <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">{stats.others || 0}</p>
          <p className="text-[11px] text-purple-600/80 dark:text-purple-400/80 font-medium mt-1">Vocational & Specialized</p>
        </div>
      </div>

      {/* ── FILTER & SEARCH ACTION BAR ── */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input 
              type="text"
              placeholder="Search by name, email, phone, city, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputCls} pl-11`}
            />
          </div>

          {/* Quick Filter Selectors & Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className={`${selectCls} text-xs py-2.5 px-3.5 w-auto`}
            >
              <option value="all">All Career Tracks</option>
              <option value="it">IT / Software</option>
              <option value="non-it">Non-IT / Corporate</option>
              <option value="gig">Gig & Fleet</option>
              <option value="others">Other Disciplines</option>
            </select>

            <button
              onClick={fetchCandidates}
              disabled={isLoading}
              title="Refresh Roster"
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity shadow-xs ml-auto md:ml-0"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Active Filter Pills */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredCandidates.length}</span> of {candidates.length} candidates
          </div>
          {(searchTerm || trackFilter !== 'all') && (
            <button 
              onClick={() => { setSearchTerm(''); setTrackFilter('all'); }}
              className="text-brand hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── CANDIDATE ROSTER TABLE ── */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {isLoading && !candidates.length ? (
          <div className="py-20 text-center">
            <RefreshCw className="animate-spin text-brand mx-auto mb-3" size={28} />
            <p className="text-sm font-semibold text-slate-500">Loading candidate roster from secure database...</p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3.5">
              <Users size={26} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No candidates match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or track filters, or wait for new candidate registrations.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Candidate Profile</th>
                  <th className="py-3.5 px-4">Track &amp; Sub-Track</th>
                  <th className="py-3.5 px-4">Qualification / Domain</th>
                  <th className="py-3.5 px-4">LinkedIn Profile</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredCandidates.map((c) => {
                  return (
                    <tr 
                      key={c.id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Name, Contact, City */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-brand font-black text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                              {c.name}
                              {c.whatsappSync && (
                                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold border border-emerald-200/50">
                                  WhatsApp Sync
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail size={11} /> {c.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone size={11} /> {c.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={11} /> {c.city || 'Bengaluru'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Track & SubTrack */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {getTrackBadge(c.careerTrack)}
                          <p className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">
                            {c.subTrack || 'General Entry'}
                          </p>
                        </div>
                      </td>

                      {/* Qualification & Skills */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {c.qualification || 'Verified Candidate'}
                        </div>
                        {c.skills && (
                          <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5" title={c.skills}>
                            {c.skills}
                          </div>
                        )}
                      </td>

                      {/* LinkedIn URL */}
                      <td className="py-3.5 px-4">
                        {c.linkedinUrl ? (
                          <a
                            href={c.linkedinUrl.startsWith('http') ? c.linkedinUrl : `https://${c.linkedinUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold text-xs group-hover:underline"
                          >
                            <Linkedin size={14} className="shrink-0" />
                            <span className="truncate max-w-[130px]">View Profile</span>
                            <ExternalLink size={11} className="opacity-70" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">Not provided</span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {c.createdAt ? new Date(Number(c.createdAt)).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        }) : 'Recent'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCandidate(c)}
                            title="Inspect Preferences & Details"
                            className="p-2 rounded-xl text-brand hover:bg-brand/10 border border-brand/20 transition-colors"
                          >
                            <Eye size={15} />
                          </button>

                          {canDelete && (
                            <button
                              onClick={() => handleDeleteCandidate(c)}
                              title="Delete Candidate Record (Manager Only)"
                              className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DETAILED CANDIDATE INSPECTION MODAL ── */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-black text-lg">
                  {selectedCandidate.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {selectedCandidate.name}
                  </h2>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    ID: {selectedCandidate.id} • Registered: {new Date(Number(selectedCandidate.createdAt)).toLocaleString()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Contact & Verification Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
              <div className="space-y-1.5">
                <p className="text-slate-400 font-bold uppercase text-[10px]">Email Address</p>
                <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Mail size={13} className="text-slate-400" /> {selectedCandidate.email}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-slate-400 font-bold uppercase text-[10px]">Contact Mobile</p>
                <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Phone size={13} className="text-slate-400" /> {selectedCandidate.phone}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-slate-400 font-bold uppercase text-[10px]">Current Location</p>
                <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-400" /> {selectedCandidate.city}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-slate-400 font-bold uppercase text-[10px]">LinkedIn Verified Link</p>
                {selectedCandidate.linkedinUrl ? (
                  <a 
                    href={selectedCandidate.linkedinUrl.startsWith('http') ? selectedCandidate.linkedinUrl : `https://${selectedCandidate.linkedinUrl}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Linkedin size={13} /> Open LinkedIn Profile <ExternalLink size={10} />
                  </a>
                ) : (
                  <p className="text-slate-400">Not Provided</p>
                )}
              </div>
            </div>

            {/* Track & Role Classification */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Career Track &amp; Sub-Track</p>
              <div className="flex items-center gap-2">
                {getTrackBadge(selectedCandidate.careerTrack)}
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {selectedCandidate.subTrack}
                </span>
              </div>
            </div>

            {/* Comprehensive Dynamic Preferences Breakdown */}
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Full Preferences &amp; Profile Specifications
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                {selectedCandidate.preferences && typeof selectedCandidate.preferences === 'object' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {Object.entries(selectedCandidate.preferences).map(([key, val]) => (
                      <div key={key} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 break-words">
                          {Array.isArray(val) ? val.join(', ') : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No structured preferences recorded.</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCandidates;
