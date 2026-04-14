import React from 'react';
import Navbar from '../components/common/Navbar';
import Hero from '../components/home/Hero';
import StatsStrip from '../components/home/StatsStrip';
import CategoryGrid from '../components/home/CategoryGrid';
import JobMelaTicker from '../components/home/JobMelaTicker';
import HowItWorks from '../components/home/HowItWorks';
import FeaturedJobsSection from '../components/jobs/FeaturedJobsSection';
import TodaysJobsSection from '../components/jobs/TodaysJobsSection';
import WhySection from '../components/home/WhySection';
import CollegeCollabBanner from '../components/home/CollegeCollabBanner'; // NEW
import TrendingCompanies from '../components/home/TrendingCompanies';
import Testimonials from '../components/home/Testimonials';
import Footer from '../components/common/Footer';
import JobMelaPopup from '../components/home/JobMelaPopup';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100">
      <JobMelaPopup />
      <Navbar />
      <Hero />
      <StatsStrip />
      <div className="space-y-0">
        <TodaysJobsSection />
        <FeaturedJobsSection />
      </div>

      <div className="py-8">
        <JobMelaTicker />
      </div>

      <TrendingCompanies />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Home;