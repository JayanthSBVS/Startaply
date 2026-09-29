import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, CheckCircle2, Award, Zap, ArrowRight, Sparkles, Building2, Users, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import CategoryGrid from '../components/home/CategoryGrid';
import CollegeCollabBanner from '../components/home/CollegeCollabBanner';
import BrandLogo from '../components/common/BrandLogo';

const AboutUs = () => {
  useEffect(() => {
    document.title = "About Us | Startaply";
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans transition-colors duration-300">

      {/* ── HERO BANNER ────────────────────────────────────────── */}
      <div className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-neutral-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-5xl mx-auto px-4 text-center z-10 flex flex-col items-center"
        >
          <div className="mb-8">
            <BrandLogo variant="vertical" height={84} className="hover:scale-105 transition-transform duration-300" />
          </div>

          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-soft border border-brand/20 text-brand dark:text-brand-hover text-xs font-black uppercase tracking-wider mb-5">
            <Sparkles size={14} /> The Next-Gen Career Ecosystem
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
            Connecting Talent with <span className="text-brand">Opportunity</span>
          </h1>
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-8">
            Startaply is India's verified job platform engineered to help ambitious students, freshers, and experienced professionals find and apply for authentic career opportunities with zero fees and zero middlemen.
          </p>

          {/* Impact stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-4">
            {[
              { val: '50,000+', label: 'Candidates Placed', icon: Users },
              { val: '500+', label: 'Verified Partners', icon: Building2 },
              { val: '100%', label: 'Free Applications', icon: Award },
              { val: '24 hrs', label: 'Daily New Openings', icon: ShieldCheck }
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 flex flex-col items-center">
                <stat.icon size={20} className="text-brand mb-1.5" />
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{stat.val}</span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── VALUES GRID ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Curated & Verified", desc: "Every job, internship, and drive is manually screened to protect candidates from spam and fake recruiters." },
            { icon: CheckCircle2, title: "1-Click Easy Apply", desc: "Centralized applications, direct HR connects, and instant status updates without lengthy redirections." },
            { icon: Award, title: "Zero Consulting Fees", desc: "We eliminated paywalls and consulting charges forever. Transparent, candidate-first opportunity discovery." }
          ].map((item, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/40 border border-slate-200 dark:border-slate-800 hover:border-brand/50 hover:-translate-y-1 transition-all group"
            >
              <div className="w-14 h-14 bg-brand-soft rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand group-hover:scale-110 transition-all duration-300">
                <item.icon className="text-brand group-hover:text-on-brand transition-colors" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Category Integration */}
      <div className="bg-white dark:bg-black border-y border-slate-200 dark:border-neutral-800">
        <CategoryGrid />
      </div>

      {/* ── MISSION & VISION ───────────────────────────────────── */}
      <div className="bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-soft border border-brand/20 text-brand dark:text-brand-hover text-xs font-bold uppercase tracking-wider mb-6">
                <Target size={16} /> Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">Democratizing Career Growth</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed italic border-l-4 border-brand pl-6 font-medium">
                "To make career discovery transparent, fast, and accessible for everyone across India by providing reliable, verified, and high-growth opportunities."
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-neutral-800 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                <Eye size={16} /> Our Vision
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">The Opportunity Ecosystem</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium">
                To build the single most trusted employment and talent platform where candidates discover top roles, prepare for rigorous assessments, and launch meaningful careers.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <CollegeCollabBanner />

      {/* ── BOTTOM CTA ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-black border-t border-slate-200 dark:border-neutral-800 transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Ready to launch your career?</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-8 font-medium">
            Explore hundreds of verified roles, startup drives, and exclusive campus hiring campaigns.
          </p>
          <Link to="/jobs" className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover hover:-translate-y-1 text-on-brand px-10 py-4 rounded-full font-bold transition-all shadow-lg shadow-brand/25 text-lg">
            Explore All Openings <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
