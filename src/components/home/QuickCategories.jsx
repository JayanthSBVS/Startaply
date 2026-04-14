import React from 'react';

const categories = [
  'IT & Non-IT Jobs',
  'Remote Jobs',
  'Internships',
  'Government Jobs',
];

const QuickCategories = ({ onSelect }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect?.(cat)}
            className="px-6 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all shadow-sm"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickCategories;