import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="text-xl font-bold tracking-tight text-white mb-4 block">
            STRATA<span className="text-green-500">PLY</span>
          </Link>
          <p className="text-sm text-gray-400 mt-2 pr-4">
            The cleanest, fastest way to find your next opportunity. No spam, just curated jobs.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/jobs" className="hover:text-green-400 transition">Browse Jobs</Link></li>
            <li><Link to="/companies" className="hover:text-green-400 transition">Companies</Link></li>
            <li><Link to="/interview-prep" className="hover:text-green-400 transition">Interview Prep</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy" className="hover:text-green-400 transition">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-green-400 transition">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Connect</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-green-400 transition">WhatsApp</a></li>
            <li><a href="#" className="hover:text-green-400 transition">Telegram</a></li>
            <li><a href="#" className="hover:text-green-400 transition">YouTube</a></li>
          </ul>
        </div>

      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12 pt-6 border-t border-gray-800 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} Strataply. All rights reserved.</p>
        <div className="mt-4 md:mt-0 flex gap-4">
          <Link to="/privacy" className="hover:text-gray-300">Privacy</Link>
          <Link to="/terms" className="hover:text-gray-300">Terms</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;