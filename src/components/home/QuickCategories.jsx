import React from 'react';

const categories = [
  'Fresher Jobs',
  'Remote Jobs',
  'Internships',
  'IT Jobs',
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
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-green-50 hover:border-green-300 transition"
          >
            {cat}
          </button>
        ))}

      </div>
    </div>
  );
};

export default QuickCategories;