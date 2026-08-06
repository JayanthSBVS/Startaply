import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Twitter, Linkedin, Instagram, Youtube, ArrowRight } from 'lucide-react';

const Footer = () => {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-login');
  if (isAdminRoute) return null;

  return (
    <footer className="bg-surface-muted border-t border-border-strong pt-12 md:pt-24 pb-6 md:pb-8 transition-colors duration-base">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* ── CTA Block ── */}
        <div className="mb-10 md:mb-16 rounded-xl p-6 md:p-12 bg-surface-raised border border-border flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8 shadow-sm text-center md:text-left">
          <div className="max-w-xl">
            <h3 className="text-xl md:text-4xl font-black text-content mb-2 tracking-tight leading-tight">
              Ready to Accelerate Your <span className="text-brand">Career?</span>
            </h3>
            <p className="text-content-secondary text-sm md:text-lg">
              Join thousands of professionals finding their dream roles on Startaply.
            </p>
          </div>
          <div>
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-on-brand font-bold px-8 py-4 rounded-md text-base transition-colors duration-fast focus-visible min-h-[44px]"
            >
              Explore Openings <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-16 lg:gap-8 mb-10 md:mb-16">

          {/* ── Brand & Mission ── */}
          <div className="lg:col-span-5">
            <Link to="/" className="inline-block mb-6 focus-visible rounded-sm">
              <span className="text-3xl font-black text-content tracking-tighter leading-none transition-colors">
                START<span className="text-brand">APLY</span>
              </span>
            </Link>
            <p className="text-content-secondary font-medium text-base mb-8 max-w-sm leading-relaxed">
              India's premium opportunity ecosystem. Discover verified work that moves you, built for the ambitious.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: <Twitter size={20} />, label: 'Twitter', url: '#' },
                { icon: <Linkedin size={20} />, label: 'LinkedIn', url: '#' },
                { icon: <Instagram size={20} />, label: 'Instagram', url: '#' },
                { icon: <Youtube size={20} />, label: 'YouTube', url: '#' }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  className="w-[44px] h-[44px] rounded-md flex items-center justify-center bg-surface-raised border border-border text-content-muted hover:text-brand hover:border-brand-soft transition-colors duration-fast focus-visible"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Platform Links ── */}
          <div className="lg:col-span-3 lg:col-start-7">
            <h4 className="text-content font-bold uppercase tracking-widest text-xs mb-6">
              Platform
            </h4>
            <ul className="space-y-4">
              {['Browse Jobs', 'Companies', 'Job Melas', 'Preparation'].map(link => (
                <li key={link}>
                  <Link
                    to={`/${link.toLowerCase().replace(' ', '-')}`}
                    className="text-content-secondary hover:text-brand font-semibold transition-colors duration-fast inline-flex items-center gap-2 focus-visible rounded-sm min-h-[44px] sm:min-h-0"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Explore Links ── */}
          <div className="lg:col-span-3">
            <h4 className="text-content font-bold uppercase tracking-widest text-xs mb-6">
              Explore
            </h4>
            <ul className="space-y-4">
              {[
                { name: 'IT & Tech', path: '/category/IT%20%26%20Non-IT%20Jobs' },
                { name: 'Government', path: '/category/Government%20Jobs' },
                { name: 'Freshers', path: '/jobs?fresh=true' },
                { name: 'Gig Workers', path: '/category/Gig%20%26%20Services' }
              ].map(link => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-content-secondary hover:text-brand font-semibold transition-colors duration-fast inline-flex items-center gap-2 focus-visible rounded-sm min-h-[44px] sm:min-h-0"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ── Legal & Copyright ── */}
        <div className="pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm font-semibold text-content-secondary">
            <Link to="/privacy" className="hover:text-brand transition-colors duration-fast focus-visible rounded-sm p-1">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-brand transition-colors duration-fast focus-visible rounded-sm p-1">Terms of Service</Link>
            <Link to="/about" className="hover:text-brand transition-colors duration-fast focus-visible rounded-sm p-1">About Us</Link>
          </div>
          <div className="text-content-muted font-medium text-sm">
            © {new Date().getFullYear()} Startaply. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
