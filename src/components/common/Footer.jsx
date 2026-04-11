import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* BRAND */}
        <div className="col-span-1 md:col-span-1">
          <h2 className="text-2xl font-extrabold text-white mb-4 tracking-tight">
            STRATA<span className="text-emerald-500">PLY</span>
          </h2>
          <p className="text-sm leading-relaxed">
            Find freshers, government, and private jobs in one place. Fast. Free. Reliable.
          </p>
        </div>

        {/* LINKS */}
        <div>
          <h4 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">Platform</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/jobs" className="hover:text-emerald-400 hover:translate-x-1 inline-block transition-transform">Jobs</Link></li>
            <li><Link to="/companies" className="hover:text-emerald-400 hover:translate-x-1 inline-block transition-transform">Companies</Link></li>
            <li><Link to="/interview-prep" className="hover:text-emerald-400 hover:translate-x-1 inline-block transition-transform">Interview Prep</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">Categories</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/category/Fresher%20Jobs" className="hover:text-emerald-400 hover:translate-x-1 inline-block transition-transform">Freshers Jobs</Link></li>
            <li><Link to="/category/Government%20Jobs" className="hover:text-emerald-400 hover:translate-x-1 inline-block transition-transform">Government Jobs</Link></li>
            <li><Link to="/category/IT%20%26%20Software%20Jobs" className="hover:text-emerald-400 hover:translate-x-1 inline-block transition-transform">Private Jobs</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">Legal</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/privacy" className="hover:text-emerald-400 hover:translate-x-1 inline-block transition-transform">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-emerald-400 hover:translate-x-1 inline-block transition-transform">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="max-w-6xl mx-auto px-4 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm">
        <p>© {new Date().getFullYear()} Strataply. All rights reserved.</p>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Systems Operational</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;