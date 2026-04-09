import React from 'react';
import { companiesData } from '../../data/jobsData';

import { Link } from 'react-router-dom';
import CompanyLogo from '../common/CompanyLogo';

const TrendingCompanies = () => {
  return (
    <section className="py-10 bg-white overflow-hidden">

      <div className="max-w-6xl mx-auto px-4 mb-6 text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Trusted by top companies
        </h2>
      </div>

      <div className="overflow-hidden">

        <div className="companies-track">

          {[...companiesData, ...companiesData].map((c, i) => (
            <Link key={i} to={`/jobs?company=${encodeURIComponent(c.name)}`} className="company-card hover:bg-gray-50 flex items-center justify-center gap-2">
              <CompanyLogo company={c.name} size={28} color={c.color || '#16A34A'} />
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