import React from 'react';
import { Link } from 'react-router-dom';
import { Send, Instagram, MessageCircle, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <h2 className="text-2xl font-extrabold text-white mb-4 tracking-tight">
            STRATA<span className="text-emerald-500">PLY</span>
          </h2>
          <p className="text-sm leading-relaxed mb-6">
            Find freshers, government, and private jobs in one place. Fast. Free. Reliable.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-emerald-600 hover:text-white transition-all"><Send size={18} /></a>
            <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-emerald-600 hover:text-white transition-all"><Instagram size={18} /></a>
            <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-emerald-600 hover:text-white transition-all"><MessageCircle size={18} /></a>
            <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-emerald-600 hover:text-white transition-all"><Youtube size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">Platform</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/" className="hover:text-emerald-400 hover:translate-x-1 inline-block transition-transform">Home</Link></li>
            <li><Link to="/jobs" className="hover:text-emerald-400 hover:translate-x-1 inline-block transition-transform">Jobs</Link></li>
            <li><Link to="/companies" className="hover:text-emerald-400 hover:translate-x-1 inline-block transition-transform">Companies</Link></li>
            <li><Link to="/preparation" className="hover:text-emerald-400 hover:translate-x-1 inline-block transition-transform">Preparation</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">Categories</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/category/IT%20%26%20Non-IT%20Jobs" className="hover:text-emerald-400 hover:translate-x-1 inline-block transition-transform">IT & Non-IT Jobs</Link></li>
            <li><Link to="/category/Government%20Jobs" className="hover:text-emerald-400 hover:translate-x-1 inline-block transition-transform">Government Jobs</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">Legal</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/about" className="hover:text-emerald-400 hover:translate-x-1 inline-block transition-transform">About Us</Link></li>
            <li><Link to="/privacy" className="hover:text-emerald-400 hover:translate-x-1 inline-block transition-transform">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-emerald-400 hover:translate-x-1 inline-block transition-transform">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm">
        <p>© {new Date().getFullYear()} Strataply. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;