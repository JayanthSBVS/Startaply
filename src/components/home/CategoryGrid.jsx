import React from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
  { name: 'IT Jobs',          emoji: '💻' },
  { name: 'Remote Jobs',      emoji: '🌐' },
  { name: 'Internships',      emoji: '🎓' },
  { name: 'Fresher Jobs',     emoji: '🌱' },
  { name: 'Government Jobs',  emoji: '🏛️' },
  { name: 'Startup Jobs',     emoji: '🚀' },
];

const CategoryGrid = ({ onSelect }) => {
  const navigate = useNavigate();

  const handleClick = (catName) => {
    // Also trigger legacy onSelect if provided (for home page search scroll)
    if (onSelect) onSelect(catName);
    navigate(`/category/${encodeURIComponent(catName)}`);
  };

  return (
    <section className="py-12 bg-white">

      <div className="max-w-6xl mx-auto px-4">

        <h2 className="text-xl font-semibold mb-6">
          Explore by Category
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

          {categories.map((c) => (
            <div
              key={c.name}
              onClick={() => handleClick(c.name)}
              className="p-5 border border-gray-200 rounded-xl cursor-pointer hover:shadow-md hover:-translate-y-1 transition bg-white hover:border-green-200"
            >
              <span className="text-2xl mb-2 block">{c.emoji}</span>
              <p className="font-medium text-gray-800">{c.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                Explore opportunities →
              </p>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
};

export default CategoryGrid;