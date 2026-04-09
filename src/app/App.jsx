import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { JobsProvider } from '../context/JobsContext';

import Home from '../pages/Home';
import JobsPage from '../pages/JobsPage';
import CompaniesPage from '../pages/CompaniesPage';
import CategoryJobsPage from '../pages/CategoryJobsPage';
import AdminDashboard from '../pages/AdminDashboard';
import AdminLogin from '../pages/AdminLogin';

import InterviewPrepPage from '../pages/InterviewPrepPage';
import AboutUs from '../pages/AboutUs';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';

import ScrollToTop from '../components/common/ScrollToTop';

function App() {
  return (
    <JobsProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/category/:categoryName" element={<CategoryJobsPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/interview-prep" element={<InterviewPrepPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
      </Router>
    </JobsProvider>
  );
}

export default App;