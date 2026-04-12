import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Briefcase, GraduationCap, Building2, Users, PartyPopper, PlusCircle } from 'lucide-react';

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Freshers', path: '/category/Fresher%20Jobs', icon: GraduationCap },
    { name: 'Govt Jobs', path: '/category/Government%20Jobs', icon: Building2 },
    { name: 'Companies', path: '/companies', icon: Users },
    { name: 'Job Melas', path: '/job-melas', icon: PartyPopper },
  ];

  return (
    <>
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold text-slate-900 tracking-tight">
          STRATA<span className="text-emerald-600">PLY</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          {menuItems.map((item) => (
            <Link key={item.name} to={item.path} className="hover:text-emerald-600 transition-colors">
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          <Link to="/jobs" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all focus:ring-4 focus:ring-emerald-500/20">
            Browse Jobs
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setOpen(!open)} 
          className="md:hidden p-2 -mr-2 text-slate-800 hover:text-emerald-600 transition-colors"
          aria-label="Toggle Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>

    {/* Mobile Menu */}
    {open && (
      <div className="md:hidden">
        <div 
          onClick={() => setOpen(false)}
          className="fixed inset-0 top-[73px] bg-slate-900/40 backdrop-blur-sm z-[90]"
        />
        <div 
          className="fixed top-[73px] right-0 bottom-0 w-[280px] bg-white z-[100] border-l border-slate-100 shadow-2xl overflow-y-auto animate-in slide-in-from-right-8 duration-300"
        >
          <div className="p-6 space-y-6">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 px-4 py-3.5 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all font-semibold group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <item.icon size={20} className="text-slate-500 group-hover:text-emerald-600" />
                  </div>
                  <span className="text-base">{item.name}</span>
                </Link>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100">
              <Link 
                to="/jobs" 
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg shadow-sm transition-all"
              >
                <PlusCircle size={20} /> Browse All Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Navbar;