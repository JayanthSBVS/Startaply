import React, { useState } from 'react';
import { MapPin, Clock, Bookmark, ChevronRight } from 'lucide-react';
import { CompanyLogo } from '../common/CompanyLogo';
import { useTimeAgo } from '../../utils/timeAgo';

const JobCard = ({ job, onViewDetails }) => {
  const [saved, setSaved] = useState(false);
  const livePostedTime = useTimeAgo(job.createdAt);

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (onViewDetails) onViewDetails(job);
  };

  return (
    <div
      className="group bg-white border border-gray-200 rounded-xl p-4 transition hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      onClick={() => onViewDetails && onViewDetails(job)}
    >

      <div className="flex items-start gap-3">

        {/* Company Logo */}
        <div
          className="w-11 h-11 flex items-center justify-center rounded-lg border flex-shrink-0"
          style={{ background: `${job.companyColor}15`, borderColor: `${job.companyColor}30` }}
        >
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.company} className="w-7 h-7 object-contain" />
          ) : (
            <CompanyLogo company={job.company} color={job.companyColor || '#16A34A'} size={18} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-green-600 truncate">
            {job.title}
          </h3>
          <p className="text-xs text-gray-500">{job.company}</p>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
          className="flex-shrink-0"
        >
          <Bookmark
            size={16}
            className={saved ? 'fill-green-600 text-green-600' : 'text-gray-400'}
          />
        </button>

      </div>

      <div className="mt-3 text-xs text-gray-600 flex flex-wrap gap-3">

        <div className="flex items-center gap-1">
          <MapPin size={12} />
          <span className="truncate max-w-[100px]">{job.location}</span>
        </div>

        <div className="font-medium text-gray-900">
          {job.salary}
        </div>

        <div className="ml-auto flex items-center gap-1 text-gray-500">
          <Clock size={12} />
          {livePostedTime}
        </div>

      </div>

      {job.description && (
        <p className="mt-3 text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {job.description}
        </p>
      )}

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {job.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="border-t mt-3 pt-3 flex justify-between items-center">

        <div className="flex gap-2">

          {job.mode && (
            <span className="text-[10px] px-2 py-1 bg-green-50 text-green-600 rounded border border-green-100">
              {job.mode}
            </span>
          )}

          {job.type && (
            <span className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded border border-gray-200">
              {job.type}
            </span>
          )}

          {job.hot && (
            <span className="text-[10px] px-2 py-1 bg-orange-50 text-orange-600 rounded border border-orange-100">
              🔥 Hot
            </span>
          )}

        </div>

        <button
          onClick={handleViewDetails}
          className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700"
        >
          View Details
          <ChevronRight size={13} />
        </button>

      </div>

    </div>
  );
};

export default JobCard;