import React from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../context/JobsContext';

const TrendingCompanies = () => {
  const { companies } = useJobs();

  if (!companies || companies.length === 0) return null;
  return (
    <section className="py-10 bg-white overflow-hidden">

      <div className="max-w-6xl mx-auto px-4 mb-6 text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Trusted by top companies
        </h2>
      </div>

      <div className="overflow-hidden">

        <div className="companies-track">

          {[...companies, ...companies].map((c, i) => (
            <Link key={i} to={`/jobs?company=${encodeURIComponent(c.name)}`} className="company-card hover:bg-gray-50 flex items-center justify-center gap-2 px-6 py-3 border border-gray-100 rounded-xl whitespace-nowrap min-w-[160px]">
              {c.logo ? (
                <img src={c.logo} alt={c.name} className="w-8 h-8 object-contain" />
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white uppercase" style={{ background: c.color || '#16A34A' }}>
                  {c.name.charAt(0)}
                </div>
              )}
              <p className="text-sm font-medium text-gray-700">
                {c.name}
              </p>
            </Link>
          ))}

        </div>

      </div>

    </section>
  );
};

export default TrendingCompanies;