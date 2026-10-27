import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { JobsProvider } from './context/JobsContext';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';

// Eager load only what's needed on first paint
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Home from './pages/Home';
import JobsPage from './pages/JobsPage';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import MobileBottomNav from './components/common/MobileBottomNav';
import ScrollToTopButton from './components/common/ScrollToTopButton';

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

// Lazy-load everything else - saves bundle weight on initial load
const CompaniesPage      = lazyRetry(() => import('./pages/CompaniesPage'));
const CompanyProfilePage  = lazyRetry(() => import('./pages/CompanyProfilePage'));
const CategoryJobsPage   = lazyRetry(() => import('./pages/CategoryJobsPage'));
const JobMelaPage        = lazyRetry(() => import('./pages/JobMelaPage'));
const JobMelaDetailPage  = lazyRetry(() => import('./pages/JobMelaDetailPage'));
const PreparationPage    = lazyRetry(() => import('./pages/PreparationPage'));
const AboutUs            = lazyRetry(() => import('./pages/AboutUs'));
const PrivacyPolicy      = lazyRetry(() => import('./pages/PrivacyPolicy'));
const TermsOfService     = lazyRetry(() => import('./pages/TermsOfService'));
const AdminDashboard     = lazyRetry(() => import('./pages/AdminDashboard'));
const AdminLogin         = lazyRetry(() => import('./pages/AdminLogin'));
const EmployerPortal     = lazyRetry(() => import('./pages/employer/EmployerPortal'));

// Simple full-screen spinner used by Suspense
const PageLoader = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center transition-colors">
    <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer';

  return (
    <JobsProvider>
      <Toaster position="top-right" />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        
        {/* Render internal Application Navbar ONLY when user is authenticated and not employer */}
        {user && !isEmployer && <Navbar />}

        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public & Candidate Homepage */}
              <Route path="/"               element={isEmployer ? <Navigate to="/employer" replace /> : user ? <Home /> : <LandingPage />} />
              <Route path="/landing"        element={<LandingPage />} />
              <Route path="/login"          element={user ? <Navigate to="/" replace /> : <LoginPage />} />
              <Route path="/signup"         element={user ? <Navigate to="/" replace /> : <SignupPage />} />

              {/* Employer Portal Routes */}
              <Route path="/employer"           element={<EmployerPortal />} />
              <Route path="/employer/login"     element={<EmployerPortal defaultTab="login" />} />
              <Route path="/employer/signup"    element={<EmployerPortal defaultTab="signup" />} />
              <Route path="/employer/dashboard" element={<EmployerPortal defaultTab="overview" />} />
              <Route path="/post-a-job"         element={<EmployerPortal defaultTab="post" />} />
              
              {/* Admin Routes */}
              <Route path="/admin"          element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin-login"    element={<AdminLogin />} />
              <Route path="/admin/login"    element={<AdminLogin />} />

              {/* Public Informational Routes */}
              <Route path="/about"          element={<AboutUs />} />
              <Route path="/about-us"       element={<AboutUs />} />
              <Route path="/privacy"        element={<PrivacyPolicy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms"          element={<TermsOfService />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />

              {/* Protected Internal Application Routes (Only accessible after login) */}
              <Route path="/home"           element={user ? <Home /> : <Navigate to="/login" replace />} />
              <Route path="/jobs"           element={user ? <JobsPage /> : <Navigate to="/login" replace />} />
              <Route path="/companies"      element={user ? <CompaniesPage /> : <Navigate to="/login" replace />} />
              <Route path="/companies/:companyId" element={user ? <CompanyProfilePage /> : <Navigate to="/login" replace />} />
              <Route path="/company/:companyId" element={user ? <CompanyProfilePage /> : <Navigate to="/login" replace />} />
              <Route path="/job-melas"      element={user ? <JobMelaPage /> : <Navigate to="/login" replace />} />
              <Route path="/job-mela"       element={user ? <JobMelaPage /> : <Navigate to="/login" replace />} />
              <Route path="/job-mela/:id"   element={user ? <JobMelaDetailPage /> : <Navigate to="/login" replace />} />
              <Route path="/job-melas/:id"  element={user ? <JobMelaDetailPage /> : <Navigate to="/login" replace />} />
              <Route path="/category/:categoryName" element={user ? <CategoryJobsPage /> : <Navigate to="/login" replace />} />
              <Route path="/preparation"    element={user ? <PreparationPage /> : <Navigate to="/login" replace />} />
              <Route path="/prep"           element={user ? <PreparationPage /> : <Navigate to="/login" replace />} />
              <Route path="/interview-prep" element={user ? <PreparationPage /> : <Navigate to="/login" replace />} />

              {/* Catch-all fallback */}
              <Route path="*"               element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>

        {/* Render internal Application Footer, ScrollToTop, and Mobile Bottom Nav ONLY when authenticated and not employer */}
        {user && !isEmployer && (
          <>
            <Footer />
            <ScrollToTopButton />
            <MobileBottomNav />
          </>
        )}
      </Router>
    </JobsProvider>
  );
}

export default App;
