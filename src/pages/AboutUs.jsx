import React from 'react';
import { Target, Eye, CheckCircle2, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CategoryGrid from '../components/home/CategoryGrid';
import CollegeCollabBanner from '../components/home/CollegeCollabBanner';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <div className="relative pt-32 pb-20 overflow-hidden bg-slate-900 border-b border-slate-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500 rounded-full blur-[120px]"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-6xl mx-auto px-4 text-center z-10"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Redefining <span className="text-emerald-400">Job Discovery</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-slate-400 leading-relaxed font-medium">
            Strataply is a modern platform designed to help users find and apply for verified job opportunities instantly, with zero friction and zero fees.
          </p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Find Jobs", desc: "Access real-time updates on job openings across top categories." },
            { icon: CheckCircle2, title: "Apply Easily", desc: "Use our centralized platform to apply quickly and track your growth." },
            { icon: Award, title: "Zero Fees", desc: "We removed the paywalls. Get 100% free access to verified roles." }
          ].map((item, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="p-8 rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 border border-slate-200 hover:border-emerald-400 hover:-translate-y-1 transition-all group"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:scale-110 transition-all duration-300">
                <item.icon className="text-emerald-600 group-hover:text-white transition-colors" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Category Integration */}
      <div className="bg-white border-y border-slate-200">
        <CategoryGrid />
      </div>

      <div className="bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6">
                <Target size={16} /> Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Simplifying the Journey</h2>
              <p className="text-slate-600 text-lg leading-relaxed italic border-l-4 border-emerald-500 pl-6 font-medium">
                "To make job searching simple, fast, and accessible by providing reliable, verified, and easy-to-understand career opportunities."
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
                <Eye size={16} /> Our Vision
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Becoming the Trusted Choice</h2>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                To evolve into a trusted global ecosystem where professionals can discover, track, and apply for life-changing job opportunities seamlessly in one place.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <CollegeCollabBanner />

      <div className="bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-32 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 tracking-tight">Ready to elevate your career?</h2>
          <a href="/jobs" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-1 text-white px-10 py-4 rounded-full font-bold transition-all shadow-lg shadow-emerald-600/30 text-lg">
            Explore All Jobs
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUs;