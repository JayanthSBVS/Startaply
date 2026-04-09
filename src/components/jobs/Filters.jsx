import React from 'react';

const Filters = ({ filters, setFilters }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">

      <select
        className="w-full border rounded p-2 text-sm"
        value={filters.location}
        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
      >
        <option>All Locations</option>
        <option>Bangalore</option>
        <option>Remote</option>
      </select>

      <select
        className="w-full border rounded p-2 text-sm"
        value={filters.mode}
        onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
      >
        <option>All Modes</option>
        <option>Remote</option>
        <option>Hybrid</option>
      </select>

    </div>
  );
};

export default Filters;