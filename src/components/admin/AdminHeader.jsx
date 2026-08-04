import React from 'react';
import { LayoutDashboard, RefreshCw } from 'lucide-react';

const AdminHeader = ({
  activeTab, setIsMobileMenuOpen, toast, getRoleLabel, user
}) => {
  return (
    <header className="bg-white/80 dark:bg-[#0b0f14]/50 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50 p-4 md:px-8 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500" onClick={() => setIsMobileMenuOpen(true)}><LayoutDashboard size={24} /></button>
            <h1 className="text-xl font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">{activeTab}</h1>
            <button 
              onClick={() => {
                localStorage.removeItem('cache_jobs');
                localStorage.removeItem('cache_companies');
                localStorage.removeItem('cache_melas');
                localStorage.removeItem('cache_prep');
                toast.success('Public Cache Reset. Site is now synced.');
                window.location.reload();
              }}
              className="ml-4 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
              title="Force sync changes to public site"
            >
              <RefreshCw size={12} /> Sync Site
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-emerald-600 uppercase tracking-tighter">{getRoleLabel(user?.role)}</p>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{user?.name || 'Authorized User'}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-black shadow-inner">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>
  );
};

export default AdminHeader;
