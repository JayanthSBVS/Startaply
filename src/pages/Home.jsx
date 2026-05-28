import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Hero from '../components/home/Hero';
import StatsStrip from '../components/home/StatsStrip';
import CategoryGrid from '../components/home/CategoryGrid';
import JobMelaTicker from '../components/home/JobMelaTicker';
import HowItWorks from '../components/home/HowItWorks';
import FeaturedJobsSection from '../components/jobs/FeaturedJobsSection';
import TodaysJobsSection from '../components/jobs/TodaysJobsSection';
import WhySection from '../components/home/WhySection';
import CollegeCollabBanner from '../components/home/CollegeCollabBanner';
import TrendingCompanies from '../components/home/TrendingCompanies';
import Testimonials from '../components/home/Testimonials';
import Footer from '../components/common/Footer';
import JobMelaPopup from '../components/home/JobMelaPopup';
import FeedbackForm from '../components/home/FeedbackForm';
import JobDetailsPanel from '../components/jobs/JobDetailsPanel';

// Home.jsx owns the single shared JobDetailsPanel so that
// FeaturedJobsSection and TodaysJobsSection don't each render
// their own panel, which caused dual-panel stacking conflicts.
const Home = () => {
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white font-sans selection:bg-emerald-100 dark:selection:bg-emerald-900/40 transition-colors duration-300">
      <JobMelaPopup />
      <Navbar />

      {/* ── Hero — Cinematic Entry ─────────────────────────────────── */}
      <Hero />

      {/* ── Live Intelligence Ticker ───────────────────────────────── */}
      <JobMelaTicker />

      {/* ── Platform Impact Stats ──────────────────────────────────── */}
      <StatsStrip />

      {/* ── Fresh Listings — Today's Jobs ─────────────────────────── */}
      <TodaysJobsSection onViewDetails={setSelectedJob} />

      {/* ── Featured Opportunities ─────────────────────────────────── */}
      <FeaturedJobsSection onViewDetails={setSelectedJob} />

      {/* ── Why Choose Startaply ───────────────────────────────────── */}
      <WhySection />

      {/* ── How It Works ──────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Partner Ecosystem — Company Streams ───────────────────── */}
      <TrendingCompanies />

      {/* ── Career Transformations ────────────────────────────────── */}
      <Testimonials />

      {/* ── College Collaboration Banner ───────────────────────────── */}
      <CollegeCollabBanner />

      {/* ── Feedback Form ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 w-full py-8 bg-slate-50 dark:bg-[#020617]">
        <FeedbackForm />
      </div>

      <Footer />

      {/* Single shared JobDetailsPanel — avoids dual-panel conflicts */}
      <JobDetailsPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
};

export default Home;