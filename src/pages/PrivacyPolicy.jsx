import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <div className="bg-slate-900 border-b border-slate-800 pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Privacy <span className="text-emerald-400">Policy</span>
          </h1>
          <p className="text-slate-400 mt-6 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-200">
          <p className="text-lg text-slate-600 leading-relaxed mb-10 font-medium">
            At Strataply, our mission is to make job searching simple, fast, and accessible. In providing you with reliable and easy-to-understand job information, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
          </p>

          <h3 className="font-extrabold text-2xl text-slate-900 mt-12 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-base">1</span>
            Information We Collect
          </h3>
          <p className="text-slate-600 leading-relaxed mb-6 font-medium">
            We may collect information about you in a variety of ways to help you apply easily and grow your career. Information we collect on the Site includes personal data like your name, email, phone number, and resume data that you voluntarily give to us when choosing to apply for jobs directly through our centralized platform.
          </p>

          <h3 className="font-extrabold text-2xl text-slate-900 mt-12 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-base">2</span>
            Use of Your Information
          </h3>
          <p className="text-slate-600 leading-relaxed mb-6 font-medium">
            Having accurate information about you permits us to provide you with a structured, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
          </p>
          <ul className="space-y-4 text-slate-600 font-medium mb-6">
            <li className="flex items-start gap-3"><div className="w-2 h-2 mt-2.5 rounded-full bg-emerald-500 shrink-0"></div> Provide real-time updates on your job applications.</li>
            <li className="flex items-start gap-3"><div className="w-2 h-2 mt-2.5 rounded-full bg-emerald-500 shrink-0"></div> Email you directly regarding your chosen opportunities.</li>
            <li className="flex items-start gap-3"><div className="w-2 h-2 mt-2.5 rounded-full bg-emerald-500 shrink-0"></div> Fulfill and manage your job applications quickly and securely.</li>
          </ul>

          <h3 className="font-extrabold text-2xl text-slate-900 mt-12 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-base">3</span>
            Data Security
          </h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            We use administrative, technical, and physical security measures to help protect your personal information. While we take reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;