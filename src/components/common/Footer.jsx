import React from 'react';
import { Link } from 'react-router-dom';
import { Send, Instagram, Smartphone, Youtube, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1 border-r border-slate-800/50 pr-6">
          <h2 className="text-2xl font-extrabold text-white mb-4 tracking-tight">
            STRATA<span className="text-emerald-500">PLY</span>
          </h2>
          <p className="text-sm leading-relaxed mb-6">
            Find freshers, government, and private jobs in one place. Fast. Free. Reliable.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-emerald-600 hover:text-white transition-all"><Send size={18} /></a>
            <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-emerald-600 hover:text-white transition-all"><Instagram size={18} /></a>
            <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-emerald-600 hover:text-white transition-all">
              {/* Custom WhatsApp SVG instead of lucide react icon */}
              <svg fill="currentColor" viewBox="0 0 24 24" width="18" height="18">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
            </a>
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
        
        {/* Contact info column added to grid */}
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 mb-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h4 className="text-white font-semibold mb-3 tracking-wide uppercase text-sm">Contact Us</h4>
           <ul className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm">
             <li><a href="mailto:support@strataply.com" className="hover:text-emerald-400 flex items-center gap-2 transition-colors"><Mail size={16} /> support@strataply.com</a></li>
             <li><a href="tel:+919876543210" className="hover:text-emerald-400 flex items-center gap-2 transition-colors"><Phone size={16} /> +91 98765 43210</a></li>
           </ul>
        </div>
        <div className="text-sm mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800 w-full md:w-auto text-left md:text-right">
          <p>© {new Date().getFullYear()} Strataply. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;