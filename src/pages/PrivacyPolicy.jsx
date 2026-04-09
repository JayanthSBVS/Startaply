import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <Navbar />

      <div className="bg-slate-800 border-b border-slate-700 pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
            Privacy Policy
          </h1>
          <p className="text-slate-400 mt-4">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16 prose prose-invert prose-green prose-sm sm:prose-base">
        <p className="text-lg text-slate-300 leading-relaxed mb-8">
          At Strataply, our mission is to make job searching simple, fast, and accessible. In providing you with reliable and easy-to-understand job information, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
        </p>
        
        <h3 className="font-bold text-2xl text-white mt-10 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          1. Information We Collect
        </h3>
        <p className="text-slate-400 leading-relaxed mb-6">
          We may collect information about you in a variety of ways to help you apply easily and grow your career. Information we collect on the Site includes personal data like your name, email, phone number, and resume data that you voluntarily give to us when choosing to apply for jobs directly through our centralized platform.
        </p>

        <h3 className="font-bold text-2xl text-white mt-10 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          2. Use of Your Information
        </h3>
        <p className="text-slate-400 leading-relaxed mb-4">
          Having accurate information about you permits us to provide you with a structured, efficient, and customized experience devoid of confusion. Specifically, we may use information collected about you via the Site to:
        </p>
        <ul className="list-disc pl-5 mt-4 space-y-2 text-slate-400 mb-6">
          <li>Provide real-time updates on your job applications.</li>
          <li>Email you directly regarding your chosen opportunities.</li>
          <li>Fulfill and manage your job applications quickly and securely.</li>
        </ul>

        <h3 className="font-bold text-2xl text-white mt-10 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          3. Data Security
        </h3>
        <p className="text-slate-400 leading-relaxed">
          We use administrative, technical, and physical security measures to help protect your personal information. While we take reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
