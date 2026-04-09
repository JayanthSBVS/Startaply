import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <div className="bg-white border-b pt-28 pb-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">
            Terms of Service
          </h1>
          <p className="text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 prose prose-green prose-sm sm:prose-base text-gray-700">
        <p>
          Welcome to Strataply. By accessing our website, you agree to these Terms of Service.
        </p>

        <h3 className="font-semibold text-lg text-gray-900 mt-6 mb-2">1. Use of the Site</h3>
        <p>
          The Site is intended for users who are seeking employment opportunities. You agree to use the
          Site in accordance with all applicable laws and regulations.
        </p>

        <h3 className="font-semibold text-lg text-gray-900 mt-6 mb-2">2. User Accounts</h3>
        <p>
          When you create an account with us, you must provide information that is accurate, complete,
          and current at all times. Failure to do so constitutes a breach of the Terms.
        </p>

        <h3 className="font-semibold text-lg text-gray-900 mt-6 mb-2">3. Intellectual Property</h3>
        <p>
          The Site and its original content, features, and functionality are owned by Strataply and are
          protected by international copyright, trademark, patent, trade secret, and other intellectual
          property or proprietary rights laws.
        </p>

        <h3 className="font-semibold text-lg text-gray-900 mt-6 mb-2">4. Disclaimers</h3>
        <p>
          We do not guarantee that any employer will ask for your resume, ask you to interview, or hire you.
          We also do not guarantee the completeness or accuracy of any job listings.
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
