import React, { useState, useEffect } from 'react';
import Hero from '../components/home/Hero';
import JobMelaTicker from '../components/home/JobMelaTicker';
import StatsStrip from '../components/home/StatsStrip';
import CategoryGrid from '../components/home/CategoryGrid';
import FeaturedJobsSection from '../components/jobs/FeaturedJobsSection';
import TodaysJobsSection from '../components/jobs/TodaysJobsSection';
import TrendingCompanies from '../components/home/TrendingCompanies';
import HowItWorks from '../components/home/HowItWorks';
import CollegeCollabBanner from '../components/home/CollegeCollabBanner';
import Testimonials from '../components/home/Testimonials';
import JobDetailsPanel from '../components/jobs/JobDetailsPanel';
import JobMelaPopup from '../components/home/JobMelaPopup';

const Home = () => {
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    document.title = "Startaply - Opportunity Engine";
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen bg-slate-50 dark:bg-[#0b0f14] transition-colors duration-300">
      {/* Hero Section — with backend banner carousel */}
      <Hero />

      {/* Live Job Mela Ticker */}
      <JobMelaTicker />

      {/* Platform Scale Metrics */}
      <StatsStrip />

      {/* Job Categories */}
      <CategoryGrid />

      {/* Live Opportunities — Today's Jobs (backend-connected) */}
      <TodaysJobsSection onViewDetails={setSelectedJob} />

      {/* Featured Jobs (backend-connected, admin-controlled isFeatured flag) */}
      <FeaturedJobsSection onJobClick={setSelectedJob} />

      {/* The Startaply Network */}
      <TrendingCompanies />

      {/* How It Works — real platform flow */}
      <HowItWorks />

      {/* Campus to Corporate — college partnerships */}
      <CollegeCollabBanner />

      {/* Career Transformations — admin-controlled testimonials */}
      <Testimonials />

      {/* Slide-over Job Details Panel */}
      <JobDetailsPanel
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
      />

      {/* Job Mela Popup — backend-connected, shows after 5s if admin enabled showPopup */}
      <JobMelaPopup />
    </div>
  );
};

export default Home;
