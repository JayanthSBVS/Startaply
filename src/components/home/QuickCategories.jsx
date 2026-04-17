import React from 'react';

const categories = [
  'IT & Non-IT Jobs',
  'Private Jobs',
  'Remote Jobs',
  'Internships',
  'Government Jobs',
];

const QuickCategories = ({ onSelect }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap gap-4 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect?.(cat)}
            className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-500/50 shadow-sm dark:shadow-none hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-emerald-500 transition-colors" />
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickCategories;