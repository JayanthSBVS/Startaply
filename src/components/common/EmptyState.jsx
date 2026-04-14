import React from 'react';
import { SearchX, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const EmptyState = ({
  title = "No results found",
  message = "We couldn't find what you were looking for. Please try adjusting your filters or search terms.",
  onReset,
  resetLabel = "Clear Filters"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm"
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-emerald-100 rounded-full blur-[30px] opacity-40 animate-pulse" />
        <div className="relative w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner overflow-hidden">
          <motion.div
            animate={{
              rotate: [0, -5, 5, -5, 0],
              y: [0, -4, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut"
            }}
          >
            <SearchX size={48} className="text-slate-300" />
          </motion.div>
          <div className="absolute top-4 left-4 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <div className="absolute bottom-6 right-6 w-2 h-2 bg-amber-400 rounded-full" />
        </div>
      </div>

      <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-10 font-medium leading-relaxed md:text-lg">
        {message}
      </p>

      {onReset && (
        <button
          onClick={onReset}
          className="group inline-flex items-center gap-3 bg-slate-950 hover:bg-emerald-600 text-white font-black py-4 px-10 rounded-full transition-all shadow-xl shadow-slate-950/20 hover:shadow-emerald-600/30 active:scale-95"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> {resetLabel}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;