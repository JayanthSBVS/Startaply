import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <Navbar />

      <div className="bg-slate-800 border-b border-slate-700 pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
            Terms of Service
          </h1>
          <p className="text-slate-400 mt-4">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16 prose prose-invert prose-green prose-sm sm:prose-base">
        <p className="text-lg text-slate-300 leading-relaxed mb-8">
          Welcome to Strataply. By accessing our centralized job discovery and application platform, you agree to these Terms of Service. Our mission is to provide you with clear, reliable job updates and help you apply easily.
        </p>

        <h3 className="font-bold text-2xl text-white mt-10 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          1. Use of the Site
        </h3>
        <p className="text-slate-400 leading-relaxed mb-6">
          The Site is intended for users who are seeking employment opportunities, aiming to reduce the effort required in job searching. You agree to use the Site in accordance with all applicable laws and regulations, and to not use the site for any fraudulent job applications.
        </p>

        <h3 className="font-bold text-2xl text-white mt-10 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          2. User Accounts & Information
        </h3>
        <p className="text-slate-400 leading-relaxed mb-6">
          When you use our Easy Apply features, you must provide information that is accurate, complete, and current. Fake or outdated information creates confusion, which goes against our core vision of a trusted platform.
        </p>

        <h3 className="font-bold text-2xl text-white mt-10 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          3. Intellectual Property
        </h3>
        <p className="text-slate-400 leading-relaxed mb-6">
          The Site and its original content, features, and functionality are owned by Strataply and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
        </p>

        <h3 className="font-bold text-2xl text-white mt-10 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          4. Disclaimers
        </h3>
        <p className="text-slate-400 leading-relaxed">
          While we strive to eliminate fake or outdated job postings by providing real-time updates in one place, we do not guarantee that any employer will ask for your resume, ask you to interview, or hire you. We aim to help you grow your career, but your success depends on various external factors.
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
