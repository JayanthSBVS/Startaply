import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { JobsProvider } from './context/JobsContext';
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import JobsPage from './pages/JobsPage';
import CompaniesPage from './pages/CompaniesPage';
import CategoryJobsPage from './pages/CategoryJobsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import PreparationPage from './pages/PreparationPage';
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import JobMelaPage from './pages/JobMelaPage';
import JobMelaDetailPage from './pages/JobMelaDetailPage';

import ScrollToTop from './components/common/ScrollToTop';
import ScrollToTopButton from './components/common/ScrollToTopButton';

function App() {
  return (
    <JobsProvider>
      <Toaster position="top-right" />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/job-melas" element={<JobMelaPage />} />
          <Route path="/job-mela/:id" element={<JobMelaDetailPage />} />
          <Route path="/category/:categoryName" element={<CategoryJobsPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/preparation" element={<PreparationPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
        <ScrollToTopButton />
      </Router>
    </JobsProvider>
  );
}

export default App;