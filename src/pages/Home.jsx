import React from 'react';
import Navbar from '../components/common/Navbar';
import Hero from '../components/home/Hero';
import StatsStrip from '../components/home/StatsStrip';
import CategoryGrid from '../components/home/CategoryGrid';
import JobMelaTicker from '../components/home/JobMelaTicker'; // New
import HowItWorks from '../components/home/HowItWorks';
import FeaturedJobsSection from '../components/jobs/FeaturedJobsSection';
import TodaysJobsSection from '../components/jobs/TodaysJobsSection';
import WhySection from '../components/home/WhySection';
import TrendingCompanies from '../components/home/TrendingCompanies';
import Footer from '../components/common/Footer';
import JobMelaPopup from '../components/home/JobMelaPopup'; // New

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100">
      <JobMelaPopup /> {/* Automated Popup */}
      <Navbar />
      <Hero />
      <StatsStrip />
      <CategoryGrid />
      <JobMelaTicker /> {/* News Reader Section */}
      <HowItWorks />

      <div className="space-y-0">
        <TodaysJobsSection />
        <FeaturedJobsSection />
        {/* Fixed Visibility */}
      </div>

      <WhySection />
      <TrendingCompanies />
      <Footer />
    </div>
  );
};

export default Home;