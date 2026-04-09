import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Jobs', path: '/jobs' },
    { label: 'Companies', path: '/companies' },
    { label: 'About Us', path: '/about' },
  ];

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-[100] transition-colors ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-200' : 'bg-transparent'}`}
        style={{ zIndex: 100 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">

          <Link to="/" className="text-lg font-bold z-[101]">
            <span>STRATA</span>
            <span className="text-green-600">PLY</span>
          </Link>

          <div className="hidden md:flex gap-6 text-sm text-gray-600">
            {navLinks.map((link) => (
              <Link
                key={link.path + link.label}
                to={link.path}
                className={`hover:text-green-600 transition-colors font-medium ${
                  location.pathname === link.path ? 'text-green-600' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <button 
            className="md:hidden z-[101] text-gray-700 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-[99] pt-20 px-6 flex flex-col gap-6 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.path + link.label}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-xl font-bold transition-colors ${
                location.pathname === link.path ? 'text-green-600' : 'text-gray-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default Navbar;