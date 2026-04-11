import React from 'react';
import { MapPin, Monitor } from 'lucide-react';

const Filters = ({ filters, setFilters }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <MapPin size={14} /> Location
        </label>
        <select
          className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        >
          <option>All Locations</option>
          <option>Bangalore</option>
          <option>Hyderabad</option>
          <option>Pune</option>
          <option>Remote</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Monitor size={14} /> Work Mode
        </label>
        <select
          className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
          value={filters.mode}
          onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
        >
          <option>All Modes</option>
          <option>Remote</option>
          <option>Hybrid</option>
          <option>On-site</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;