import React from 'react';
import { X, LayoutDashboard, PlusCircle, Briefcase, FileText, Building2, MapPin, BookOpen, MessageSquareQuote, Handshake, MessageSquare, Users2, Sliders, History, BarChart3, Image as ImageIcon, Zap, LogOut, Ticket } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

import BrandLogo from '../common/BrandLogo';

const AdminSidebar = ({
  isMobileMenuOpen, setIsMobileMenuOpen, activeTab, setActiveTab,
  logout, navigate, isManager, myPermissions
}) => {
  const perms = myPermissions || {};
  const isMgr = isManager ? isManager() : false;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(isMgr ? [
      { id: 'team',        label: 'Team Management', icon: Users2 },
      { id: 'permissions', label: 'Role Permissions', icon: Sliders },
      { id: 'logs',        label: 'Activity Logs',   icon: History },
      { id: 'global_stats', label: 'Global Intelligence', icon: BarChart3 },
      { id: 'herobanners', label: 'Hero Banners',    icon: ImageIcon },
    ] : []),
    { id: 'liveticker',   label: 'Live Ticker',      icon: Zap },
    ...(isMgr || perms.can_post_job !== false ? [{ id: 'add', label: 'Post Job', icon: PlusCircle }] : []),
    ...(isMgr || perms.can_post_job !== false || perms.can_edit_job !== false || perms.can_delete_job !== false ? [{ id: 'manage', label: 'Manage Jobs', icon: Briefcase }] : []),
    ...(isMgr || perms.can_view_applicants !== false ? [{ id: 'applications', label: 'Applications', icon: FileText }] : []),
    ...(isMgr || perms.can_manage_companies !== false ? [{ id: 'companies', label: 'Companies', icon: Building2 }] : []),
    ...(isMgr || perms.can_manage_mela !== false ? [{ id: 'jobmela', label: 'Job Mela', icon: MapPin }] : []),
    ...(isMgr || perms.can_manage_prep !== false ? [{ id: 'prep', label: 'Prep Data', icon: BookOpen }] : []),
    { id: 'testimonials', label: 'Testimonials',     icon: MessageSquareQuote },
    { id: 'collabs',      label: 'Collab Requests',  icon: Handshake },
    { id: 'support',      label: 'Support Tickets',  icon: Ticket },
  ];
  return (
    
      <div className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-50 dark:bg-[#0b0f14]/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/50 flex flex-col z-[100] transition-all duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BrandLogo variant="horizontal" height={28} />
            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-brand-soft text-brand border border-brand/20">Admin</span>
          </div>
          <button className="md:hidden text-slate-500 dark:text-slate-400" onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === item.id ? 'bg-brand/10 text-brand dark:text-brand-hover border border-brand/20 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'}`}>
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
