import React, { useState } from 'react';

import Navbar from '../components/common/Navbar';
import StickySearch from '../components/common/StickySearch';
import Hero from '../components/home/Hero';
import StatsStrip from '../components/home/StatsStrip';
import FeaturedJobs from '../components/jobs/FeaturedJobs';
import TrendingCompanies from '../components/home/TrendingCompanies';
import WhySection from '../components/home/WhySection';
import InterviewPrep from '../components/home/InterviewPrep';
import TodaysJobs from '../components/jobs/TodaysJobs';
import JobAlerts from '../components/home/JobAlerts';
import Footer from '../components/common/Footer';
import CategoryGrid from '../components/home/CategoryGrid';
import FreshJobs from '../components/jobs/FreshJobs';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      <Navbar />
      <StickySearch onSearch={setSearchQuery} />
      <Hero onSearch={setSearchQuery} />
      <CategoryGrid />
      <StatsStrip />
      <FreshJobs />
      <FeaturedJobs />
      <TodaysJobs />
      <TrendingCompanies />
      <WhySection />
      <InterviewPrep />
      <JobAlerts />
      <Footer />

    </div>
  );
};

export default Home;