import React from 'react';
import { Link } from 'react-router-dom';

const InterviewPrep = () => {
  return (
    <section className="py-12">

      <div className="max-w-6xl mx-auto px-4">

        <div className="bg-white border rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">

          <div>
            <h3 className="font-semibold text-lg">
              Prepare for Your Interviews
            </h3>
            <p className="text-sm text-gray-500">
              Practice questions, tips, and guides.
            </p>
          </div>

          <Link to="/interview-prep" className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
            Start Preparing
          </Link>

        </div>

      </div>

    </section>
  );
};

export default InterviewPrep;