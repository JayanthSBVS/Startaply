import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmDeleteModal = ({ 
  isOpen, 
  title = "Confirm Deletion", 
  message = "Are you sure you want to delete this entry? This action cannot be undone.", 
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
          onClick={onCancel}
        />

        {/* Modal Dialog */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white dark:bg-[#0e131b] border border-slate-200 dark:border-slate-800/80 rounded-[2.5rem] p-6 md:p-8 shadow-2xl overflow-hidden"
        >
          {/* Subtle Top Red Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500" />
          
          {/* Close button */}
          <button 
            onClick={onCancel}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-900/60 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col items-center text-center space-y-5 pt-2">
            {/* Warning Icon with Pulsing Ring */}
            <div className="relative">
              <div className="absolute -inset-2 bg-rose-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/10">
                <Trash2 size={36} className="animate-bounce" />
              </div>
            </div>

            {/* Title & Message */}
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {title}
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed px-2">
                {message}
              </p>
            </div>

            {/* Danger Notice Pill */}
            <div className="w-full bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 flex items-center gap-3 text-left">
              <AlertTriangle size={20} className="text-rose-500 shrink-0" />
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Warning: Permanent action. Data cannot be recovered once confirmed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-3.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-black text-sm shadow-lg shadow-rose-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmDeleteModal;
