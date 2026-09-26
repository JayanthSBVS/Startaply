import { Crown, BadgeCheck, UserCheck } from 'lucide-react';

export const API = '/api';

export const inputCls = "w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#1A62FE] focus:ring-2 focus:ring-[#1A62FE]/20 outline-none transition-all shadow-sm dark:shadow-inner font-medium";
export const selectCls = "w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white cursor-pointer focus:border-[#1A62FE] focus:ring-2 focus:ring-[#1A62FE]/20 outline-none transition-all shadow-sm dark:shadow-inner appearance-none font-medium";
export const textareaCls = "w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#1A62FE] focus:ring-2 focus:ring-[#1A62FE]/20 outline-none transition-all resize-none shadow-sm dark:shadow-inner font-medium";

export const ROLE_CONFIG = {
  manager:               { label: 'Manager',              color: 'text-purple-600 dark:text-purple-400',  bg: 'bg-purple-50 dark:bg-purple-500/10',  border: 'border-purple-200 dark:border-purple-500/20',  icon: Crown },
  operational_manager:   { label: 'Op. Manager (Full Access)', color: 'text-[#001F8E] dark:text-[#1A62FE]', bg: 'bg-[#EFF3FF] dark:bg-[#1A62FE]/10', border: 'border-[#1A62FE]/20', icon: BadgeCheck },
  operational_executive: { label: 'Op. Executive (Restricted)', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20', icon: UserCheck },
};

export const getRoleConfig = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.operational_executive;
export const getRoleLabel = (role) => getRoleConfig(role).label;
