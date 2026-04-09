import React from 'react';

const JobModal = ({ job, onClose }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">

      <div className="bg-white rounded-xl w-full max-w-lg p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold">{job.title}</h2>
        <p className="text-sm text-gray-500">{job.company}</p>

        <div className="mt-4 text-sm text-gray-700">
          <p><strong>Location:</strong> {job.location}</p>
          <p><strong>Salary:</strong> {job.salary}</p>
        </div>

        <button className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg">
          Apply Now
        </button>

      </div>

    </div>
  );
};

export default JobModal;