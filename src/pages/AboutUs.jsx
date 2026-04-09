import React from 'react';
import { Target, Eye, AlertCircle, CheckCircle2, Award, Zap } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden bg-white border-b border-gray-200">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-200 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Job Discovery</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
            Strataply is a job discovery and application platform designed to help users find and apply for job opportunities in a simple and efficient way. 
          </p>
        </div>
      </div>

      {/* Stats/Core Concept */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Find Jobs", desc: "Access real-time updates on job openings across different categories." },
            { icon: CheckCircle2, title: "Apply Easily", desc: "Centralized platform to apply quickly and track your career growth." },
            { icon: Award, title: "Grow Career", desc: "Reduce the effort required in job searching and improve your experience." }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-2xl bg-white shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <item.icon className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Problem & Solution */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <AlertCircle className="text-red-500" />
              The Challenges We Solve
            </h2>
            <div className="space-y-6">
              {[
                "Lack of timely updates on job openings.",
                "Scattered information across multiple websites wasting time.",
                "Fake or outdated job postings creating confusion.",
                "Absence of an easy and centralized platform."
              ].map((text, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                  <p className="text-gray-600 sm:text-lg">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/10 rounded-full blur-[80px]"></div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 relative z-10">Our Solution</h2>
            <p className="text-gray-600 mb-8 leading-relaxed relative z-10 text-lg">
              Strataply addresses these challenges by offering a centralized platform where users can access job updates in a structured and clear format. We simplify the search process by organizing opportunities and making it easier for users to find suitable roles.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {[
                "Real-time Updates",
                "Structured Experience",
                "Fast Applications",
                "Clear Information"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <CheckCircle2 className="text-green-600" size={18} />
                  <span className="text-sm font-semibold text-gray-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100/50 border border-green-200 text-green-700 text-xs font-bold uppercase tracking-wider mb-6">
                <Target size={14} /> Mission Statement
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Simplifying the Journey</h2>
              <p className="text-gray-600 text-lg leading-relaxed italic border-l-4 border-green-500 pl-6">
                "To make job searching simple, fast, and accessible by providing reliable and easy-to-understand job information."
              </p>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
                <Eye size={14} /> Our Future Vision
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Becoming the Trusted Choice</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                To become a trusted platform where users can discover, track, and apply for job opportunities seamlessly in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 py-32 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8">Ready to grow your career?</h2>
        <a href="/jobs" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-green-900/20 text-lg">
          Explore All Jobs
        </a>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUs;
