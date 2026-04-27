import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { JobsProvider } from './context/JobsContext';
import { Toaster } from 'react-hot-toast';

import ScrollToTop from './components/common/ScrollToTop';
import ScrollToTopButton from './components/common/ScrollToTopButton';

// ── Eager-load high-priority pages (above the fold, visited most) ──────────
import Home from './pages/Home';
import JobsPage from './pages/JobsPage';

// ── Lazy-load everything else – saves ~200KB+ from initial bundle ──────────
const CompaniesPage     = lazy(() => import('./pages/CompaniesPage'));
const CategoryJobsPage  = lazy(() => import('./pages/CategoryJobsPage'));
const JobMelaPage       = lazy(() => import('./pages/JobMelaPage'));
const JobMelaDetailPage = lazy(() => import('./pages/JobMelaDetailPage'));
const PreparationPage   = lazy(() => import('./pages/PreparationPage'));
const AboutUs           = lazy(() => import('./pages/AboutUs'));
const PrivacyPolicy     = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService    = lazy(() => import('./pages/TermsOfService'));
// Admin is the biggest win – 110KB kept out of every user's bundle
const AdminDashboard    = lazy(() => import('./pages/AdminDashboard'));
const AdminLogin        = lazy(() => import('./pages/AdminLogin'));

// ── Simple full-screen spinner used by Suspense ────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <JobsProvider>
      <Toaster position="top-right" />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"               element={<Home />} />
            <Route path="/jobs"           element={<JobsPage />} />
            <Route path="/companies"      element={<CompaniesPage />} />
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
        <ScrollToTopButton />
      </Router>
    </JobsProvider>
  );
}

export default App;