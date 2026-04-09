import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <div className="bg-white border-b pt-28 pb-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">
            Privacy Policy
          </h1>
          <p className="text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 prose prose-green prose-sm sm:prose-base text-gray-700">
        <p>
          At Strataply, we take your privacy seriously. This Privacy Policy explains how we collect, use,
          disclose, and safeguard your information when you visit our website.
        </p>
        
        <h3 className="font-semibold text-lg text-gray-900 mt-6 mb-2">1. Information We Collect</h3>
        <p>
          We may collect information about you in a variety of ways. Information we collect on the Site includes:
          personal data like name, email, and resume data that you voluntarily give to us when choosing to apply for jobs.
        </p>

        <h3 className="font-semibold text-lg text-gray-900 mt-6 mb-2">2. Use of Your Information</h3>
        <p>
          Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience.
          Specifically, we may use information collected about you via the Site to:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Create and manage your account.</li>
          <li>Email you regarding your application.</li>
          <li>Fulfill and manage your job applications.</li>
        </ul>

        <h3 className="font-semibold text-lg text-gray-900 mt-6 mb-2">3. Data Security</h3>
        <p>
          We use administrative, technical, and physical security measures to help protect your personal information.
          While we have taken reasonable steps to secure the personal information you provide to us, please be aware
          that despite our efforts, no security measures are perfect or impenetrable.
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
