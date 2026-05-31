import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Twitter, Linkedin, Instagram, Youtube, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const location = useLocation();

  // Exclude rendering Footer on admin dashboard and login screens
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-login');
  if (isAdminRoute) return null;

  return (
    <footer className="relative bg-white dark:bg-[#0b0f14] pt-12 md:pt-24 pb-6 md:pb-8 overflow-hidden transition-colors duration-500">
      
      {/* ── Cinematic Background Atmosphere ── */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
      
      {/* Atmospheric ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full opacity-30 dark:opacity-20 pointer-events-none mix-blend-multiply dark:mix-blend-screen transition-opacity duration-500 bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-10 pointer-events-none mix-blend-multiply dark:mix-blend-screen transition-opacity duration-500 bg-indigo-500/10 blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* ── Premium Call to Action ── */}
        <div className="mb-10 md:mb-16 relative rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 overflow-hidden bg-slate-950 dark:bg-white/5 border border-slate-800 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8 shadow-2xl group text-center md:text-left">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/30 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 max-w-xl">
            <h3 className="text-xl md:text-5xl font-black text-white mb-2 md:mb-4 tracking-tight leading-tight">
              Ready to Accelerate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Career?</span>
            </h3>
            <p className="text-slate-400 text-sm md:text-lg">Join thousands of professionals finding their dream roles on Startaply.</p>
          </div>
          <div className="relative z-10">
            <Link to="/jobs" className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 md:px-10 md:py-5 rounded-full text-base md:text-lg transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] active:scale-95" style={{minHeight:'44px'}}>
              Explore Openings <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-16 lg:gap-8 mb-10 md:mb-16">
          
          {/* ── Brand & Mission (LEFT) ── */}
          <div className="lg:col-span-5">
            <Link to="/" className="inline-block mb-6 group relative">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none transition-colors relative z-10">
                START<span className="text-emerald-500">APLY</span>
              </span>
              <div className="absolute -inset-4 bg-emerald-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-lg mb-10 max-w-sm leading-relaxed">
              India's premium opportunity ecosystem. Discover verified work that moves you, built for the ambitious.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: <Twitter size={20} />, label: 'Twitter', color: 'hover:text-cyan-500 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/20' },
                { icon: <Linkedin size={20} />, label: 'LinkedIn', color: 'hover:text-blue-600 hover:bg-blue-600/10 hover:border-blue-600/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-600/20' },
                { icon: <Instagram size={20} />, label: 'Instagram', color: 'hover:text-pink-600 hover:bg-pink-600/10 hover:border-pink-600/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-600/20' },
                { icon: <Youtube size={20} />, label: 'YouTube', color: 'hover:text-red-600 hover:bg-red-600/10 hover:border-red-600/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-600/20' }
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 transition-all duration-300 ${social.color}`}
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Navigation Clusters (CENTER) ── */}
          <div className="lg:col-span-3 lg:col-start-7">
            <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm mb-8 flex items-center gap-2">
              Platform
            </h4>
            <ul className="space-y-5">
              {['Browse Jobs', 'Companies', 'Job Melas', 'Preparation'].map(link => (
                <li key={link}>
                  <Link to={`/${link.toLowerCase().replace(' ', '-')}`} className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold transition-all relative group inline-flex items-center gap-2 hover:translate-x-2">
                    {link}
                    <ArrowRight size={14} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-emerald-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="lg:col-span-3">
            <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm mb-8 flex items-center gap-2">
              Explore
            </h4>
            <ul className="space-y-5">
              {[
                { name: 'IT & Tech', path: '/category/IT%20%26%20Non-IT%20Jobs' },
                { name: 'Government', path: '/category/Government%20Jobs' },
                { name: 'Freshers', path: '/jobs?fresh=true' },
                { name: 'Gig Workers', path: '/category/Gig%20%26%20Services' }
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-all relative group inline-flex items-center gap-2 hover:translate-x-2">
                    {link.name}
                    <ArrowRight size={14} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-indigo-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ── Legal & Copyright (BOTTOM) ── */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-slate-500 dark:text-slate-400">
            <Link to="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Terms of Service</Link>
            <Link to="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">About Us</Link>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8">
            <p className="text-slate-400 dark:text-slate-500 font-semibold text-sm">
              © {new Date().getFullYear()} Startaply. All rights reserved.
            </p>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;

