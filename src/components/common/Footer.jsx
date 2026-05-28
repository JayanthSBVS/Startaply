import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Mail, Phone, Linkedin, ArrowUpRight } from 'lucide-react';

// WhatsApp SVG
const WhatsAppIcon = ({ size = 20 }) => (
  <svg fill="currentColor" viewBox="0 0 24 24" width={size} height={size}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

const TelegramIcon = ({ size = 20 }) => (
  <svg fill="currentColor" viewBox="0 0 24 24" width={size} height={size}>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const socialLinks = [
  { href: 'https://wa.me/919876543210', icon: <WhatsAppIcon size={18} />, label: 'WhatsApp', hover: 'hover:bg-[#25D366] hover:text-white hover:border-[#25D366]' },
  { href: 'https://instagram.com/startaply', icon: <Instagram size={18} />, label: 'Instagram', hover: 'hover:bg-gradient-to-br hover:from-[#833ab4] hover:via-[#fd1d1d] hover:to-[#fcb045] hover:text-white hover:border-transparent' },
  { href: 'https://t.me/startaply', icon: <TelegramIcon size={18} />, label: 'Telegram', hover: 'hover:bg-[#0088cc] hover:text-white hover:border-[#0088cc]' },
  { href: 'https://youtube.com/@startaply', icon: <Youtube size={18} />, label: 'YouTube', hover: 'hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]' },
  { href: 'https://linkedin.com/company/startaply', icon: <Linkedin size={18} />, label: 'LinkedIn', hover: 'hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]' },
];

const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="group flex items-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors duration-200 text-sm font-medium"
    >
      {children}
      <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mt-0.5" />
    </Link>
  </li>
);

const Footer = () => {
  return (
    <footer className="bg-[#020617] text-slate-400 relative overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      {/* Atmospheric glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.2) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />

      <div className="relative z-10">
        {/* ── Main footer content ─────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand column */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="group inline-block mb-4">
              <div className="text-3xl font-extrabold text-white tracking-tight mb-1">
                START<span className="text-emerald-500">APLY</span>
              </div>
              <div className="text-[10px] font-bold tracking-[0.25em] text-slate-500 uppercase">Find · Apply · Grow</div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 mb-6 max-w-xs">
              India's fastest-growing opportunity platform. Government, IT, Non-IT & Fresher roles — all verified, all free.
            </p>

            {/* Social icons */}
            <div className="flex gap-2 flex-wrap">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={`p-2 bg-slate-900 rounded-xl text-slate-500 transition-all duration-300 border border-slate-800 hover:scale-110 hover:shadow-lg ${s.hover}`}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-bold mb-5 text-xs uppercase tracking-[0.2em]">Platform</h4>
            <ul className="space-y-3">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/jobs">Browse Jobs</FooterLink>
              <FooterLink to="/companies">Companies</FooterLink>
              <FooterLink to="/job-melas">Job Melas</FooterLink>
              <FooterLink to="/preparation">Preparation</FooterLink>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold mb-5 text-xs uppercase tracking-[0.2em]">Job Categories</h4>
            <ul className="space-y-3">
              <FooterLink to="/category/Government%20Jobs">Government Jobs</FooterLink>
              <FooterLink to="/category/IT%20%26%20Non-IT%20Jobs">IT Jobs</FooterLink>
              <FooterLink to="/jobs">Non-IT Jobs</FooterLink>
              <FooterLink to="/jobs?fresh=true">Freshers Jobs</FooterLink>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="text-white font-bold mb-5 text-xs uppercase tracking-[0.2em]">Legal & Info</h4>
            <ul className="space-y-3 mb-8">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
              <FooterLink to="/#feedback">Leave Feedback</FooterLink>
            </ul>

            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-[0.2em]">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@startaply.com" className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors">
                  <Mail size={13} /> support@startaply.com
                </a>
              </li>
              <li>
                <a href="tel:+919876543210" className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-colors">
                  <Phone size={13} /> +91 98765 43210
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────────────── */}
        <div className="border-t border-slate-900 max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} Startaply. All rights reserved.</p>
          <p className="text-xs text-slate-700">Made with ❤️ for job seekers across India</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;