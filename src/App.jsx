import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { JobsProvider } from './context/JobsContext';
import { Toaster } from 'react-hot-toast';

import ScrollToTop from './components/common/ScrollToTop';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import MobileBottomNav from './components/common/MobileBottomNav';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';

// Eager-load high-priority pages (above the fold, visited most)
import Home from './pages/Home';
import JobsPage from './pages/JobsPage';

// Safe chunk loader: retries once via reload, then shows error instead of infinite loop
const lazyRetry = (componentImport) => {
  return lazy(async () => {
    const storageKey = 'chunk_reload_attempted';
    try {
      const component = await componentImport();
      // Success - clear any previous reload flag
      sessionStorage.removeItem(storageKey);
      return component;
    } catch (error) {
      // If we already tried reloading once, don't loop - throw to ErrorBoundary
      if (sessionStorage.getItem(storageKey)) {
        sessionStorage.removeItem(storageKey);
        throw error;
      }
      // First failure - mark and reload
      sessionStorage.setItem(storageKey, '1');
      window.location.reload();
      return { default: () => null };
    }
  });
};

// Lazy-load everything else - saves ~200KB+ from initial bundle
const CompaniesPage     = lazyRetry(() => import('./pages/CompaniesPage'));
const CompanyProfilePage = lazyRetry(() => import('./pages/CompanyProfilePage'));
const CategoryJobsPage  = lazyRetry(() => import('./pages/CategoryJobsPage'));
const JobMelaPage       = lazyRetry(() => import('./pages/JobMelaPage'));
const JobMelaDetailPage = lazyRetry(() => import('./pages/JobMelaDetailPage'));
const PreparationPage   = lazyRetry(() => import('./pages/PreparationPage'));
const AboutUs           = lazyRetry(() => import('./pages/AboutUs'));
const PrivacyPolicy     = lazyRetry(() => import('./pages/PrivacyPolicy'));
const TermsOfService    = lazyRetry(() => import('./pages/TermsOfService'));
// Admin is the biggest win - 110KB kept out of every user's bundle
const AdminDashboard    = lazyRetry(() => import('./pages/AdminDashboard'));
const AdminLogin        = lazyRetry(() => import('./pages/AdminLogin'));

// Simple full-screen spinner used by Suspense
const PageLoader = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f14] flex items-center justify-center transition-colors">
    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <JobsProvider>
      <Toaster position="top-right" />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Navbar />
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"               element={<Home />} />
              <Route path="/jobs"           element={<JobsPage />} />
              <Route path="/companies"      element={<CompaniesPage />} />
              <Route path="/companies/:companyId" element={<CompanyProfilePage />} />
              <Route path="/job-melas"      element={<JobMelaPage />} />
              <Route path="/job-mela/:id"   element={<JobMelaDetailPage />} />
              <Route path="/category/:categoryName" element={<CategoryJobsPage />} />
              <Route path="/admin"          element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin-login"    element={<AdminLogin />} />
              <Route path="/preparation"    element={<PreparationPage />} />
              <Route path="/about"          element={<AboutUs />} />
              <Route path="/privacy"        element={<PrivacyPolicy />} />
              <Route path="/terms"          element={<TermsOfService />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <Footer />
        <ScrollToTopButton />
        <MobileBottomNav />
      </Router>
    </JobsProvider>
  );
}

export default App;

