import { Crown, BadgeCheck, UserCheck } from 'lucide-react';

export const API = '/api';

export const inputCls = "w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-full px-5 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-sm dark:shadow-inner";
export const selectCls = "w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-full px-5 py-3.5 text-sm text-slate-900 dark:text-white cursor-pointer focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-sm dark:shadow-inner appearance-none";
export const textareaCls = "w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-[1.5rem] px-5 py-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none shadow-sm dark:shadow-inner";

export const ROLE_CONFIG = {
  manager:               { label: 'Manager',              color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  icon: Crown },
  operational_manager:   { label: 'Op. Manager (Full Access)',          color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: BadgeCheck },
  operational_executive: { label: 'Op. Executive (Restricted)',        color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: UserCheck },
};

export const getRoleConfig = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.operational_executive;
export const getRoleLabel = (role) => getRoleConfig(role).label;
