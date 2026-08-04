import React from 'react';
import { X, LayoutDashboard, PlusCircle, Briefcase, FileText, Building2, MapPin, BookOpen, MessageSquareQuote, Handshake, MessageSquare, Users2, Sliders, History, BarChart3, Image as ImageIcon, Zap, LogOut } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

const AdminSidebar = ({
  isMobileMenuOpen, setIsMobileMenuOpen, activeTab, setActiveTab,
  logout, navigate, isManager
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(isManager() ? [
      { id: 'team',        label: 'Team Management', icon: Users2 },
      { id: 'permissions', label: 'Role Permissions', icon: Sliders },
      { id: 'logs',        label: 'Activity Logs',   icon: History },
      { id: 'global_stats', label: 'Global Intelligence', icon: BarChart3 },
      { id: 'herobanners', label: 'Hero Banners',    icon: ImageIcon },
      { id: 'liveticker',  label: 'Live Ticker',     icon: Zap },
    ] : []),
    { id: 'add',          label: 'Post Job',     icon: PlusCircle },
    { id: 'manage',       label: 'Manage Jobs',  icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'companies',    label: 'Companies',    icon: Building2 },
    { id: 'jobmela',      label: 'Job Mela',     icon: MapPin },
    { id: 'prep',         label: 'Prep Data',    icon: BookOpen },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { id: 'collabs',      label: 'Collab Requests', icon: Handshake },
    { id: 'feedback',     label: 'Feedback',     icon: MessageSquare },
  ];
  return (
    
      <div className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-50 dark:bg-[#0b0f14]/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/50 flex flex-col z-[100] transition-all duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/50 flex justify-between items-center">
          <h2 className="text-xl font-black tracking-tighter">START<span className="text-emerald-500">ADMIN</span></h2>
          <button className="md:hidden text-slate-500 dark:text-slate-500 dark:text-slate-400" onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === item.id ? 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/50 flex flex-col gap-2">
          <ThemeToggle className="w-full flex" />
          <button onClick={() => { logout(); navigate('/admin-login'); }} className="flex items-center gap-3 text-rose-500 dark:text-rose-400 text-sm font-bold w-full p-4 hover:bg-rose-500/10 rounded-2xl transition-colors border border-transparent hover:border-rose-500/20"><LogOut size={18} /> Sign Out</button>
        </div>
      </div>

      
  );
};

export default AdminSidebar;
