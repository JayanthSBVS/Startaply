import React from 'react';
import { MapPin, IndianRupee, X } from 'lucide-react';

const JobModal = ({ job, onClose }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">

      <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1 pr-8">{job.title}</h2>
        <p className="text-sm font-bold text-emerald-600">{job.company}</p>

        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-4 rounded-[1.25rem]">
            <MapPin size={20} className="text-emerald-500 shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Location</p>
              <p className="text-sm font-bold text-slate-700">{job.location || 'Not specified'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-4 rounded-[1.25rem]">
            <IndianRupee size={20} className="text-emerald-500 shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Salary</p>
              <p className="text-sm font-bold text-slate-700">{job.salary || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <button className="mt-8 w-full bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all text-white font-bold py-4 rounded-full text-lg">
          Apply Now
        </button>

      </div>

    </div>
  );
};

export default JobModal;