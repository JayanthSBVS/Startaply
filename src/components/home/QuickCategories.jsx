import React from 'react';

const categories = [
  'IT & Non-IT Jobs',
  'Private Jobs',
  'Remote Jobs',
  'Internships',
];

const QuickCategories = ({ onSelect }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap gap-4 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect?.(cat)}
            className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-brand-soft dark:hover:bg-brand/10 hover:text-brand dark:hover:text-brand-hover hover:border-brand/30 dark:hover:border-brand/30 shadow-sm dark:shadow-none hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
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
