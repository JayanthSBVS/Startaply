import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Briefcase, GraduationCap, Building2, Users, PartyPopper, BookOpen, Info, Home } from 'lucide-react';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'IT & Non-IT Jobs', path: '/category/IT%20%26%20Non-IT%20Jobs', icon: GraduationCap },
    { name: 'Govt Jobs', path: '/category/Government%20Jobs', icon: Building2 },
    { name: 'Companies', path: '/companies', icon: Users },
    { name: 'Job Melas', path: '/job-melas', icon: PartyPopper },
    { name: 'Preparation', path: '/preparation', icon: BookOpen },
    { name: 'About Us', path: '/about', icon: Info },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path.split('?')[0].replace(/%20/g, ' '));
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-extrabold text-slate-900 tracking-tight shrink-0">
            STRATA<span className="text-emerald-600">PLY</span>
          </Link>

          <div className="hidden lg:flex items-center gap-2 text-sm font-bold text-slate-600 overflow-x-auto">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`transition-all duration-300 whitespace-nowrap px-4 py-2 rounded-full ${isActive(item.path) ? 'text-emerald-600 bg-emerald-50 shadow-sm' : 'hover:text-emerald-600 hover:bg-emerald-50 hover:shadow-sm hover:-translate-y-0.5'}`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:block shrink-0 ml-4">
            <Link to="/jobs" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all">
              Browse Jobs
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-slate-800 hover:text-emerald-600 transition-colors">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden">
          <div onClick={() => setOpen(false)} className="fixed inset-0 top-[73px] bg-slate-900/40 backdrop-blur-sm z-[90]" />
          <div className="fixed top-[73px] right-0 bottom-0 w-[280px] bg-white z-[100] border-l border-slate-100 shadow-2xl overflow-y-auto animate-in slide-in-from-right-8 duration-300">
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link key={item.name} to={item.path} onClick={() => setOpen(false)} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-bold group ${isActive(item.path) ? 'text-emerald-600 bg-emerald-50' : 'text-slate-700 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive(item.path) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600'}`}>
                      <item.icon size={20} />
                    </div>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;