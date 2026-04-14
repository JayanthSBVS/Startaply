import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <div className="bg-slate-900 border-b border-slate-800 pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Terms of <span className="text-emerald-400">Service</span>
          </h1>
          <p className="text-slate-400 mt-6 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-200">
          <p className="text-lg text-slate-600 leading-relaxed mb-10 font-medium">
            Welcome to Strataply. By accessing our centralized job discovery and application platform, you agree to these Terms of Service. Our mission is to provide you with clear, reliable job updates and help you apply easily.
          </p>

          <h3 className="font-extrabold text-2xl text-slate-900 mt-12 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-base">1</span>
            Use of the Site
          </h3>
          <p className="text-slate-600 leading-relaxed mb-6 font-medium">
            The Site is intended for users who are seeking employment opportunities, aiming to reduce the effort required in job searching. You agree to use the Site in accordance with all applicable laws and regulations, and to not use the site for any fraudulent job applications.
          </p>

          <h3 className="font-extrabold text-2xl text-slate-900 mt-12 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-base">2</span>
            User Accounts & Information
          </h3>
          <p className="text-slate-600 leading-relaxed mb-6 font-medium">
            When you use our Easy Apply features, you must provide information that is accurate, complete, and current. Fake or outdated information creates confusion, which goes against our core vision of a trusted platform.
          </p>

          <h3 className="font-extrabold text-2xl text-slate-900 mt-12 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-base">3</span>
            Intellectual Property
          </h3>
          <p className="text-slate-600 leading-relaxed mb-6 font-medium">
            The Site and its original content, features, and functionality are owned by Strataply and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </p>

          <h3 className="font-extrabold text-2xl text-slate-900 mt-12 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-base">4</span>
            Disclaimers
          </h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            While we strive to eliminate fake or outdated job postings by providing real-time updates in one place, we do not guarantee that any employer will ask for your resume, ask you to interview, or hire you. We aim to help you grow your career, but your success depends on various external factors.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;