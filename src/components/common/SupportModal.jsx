import React, { useState } from 'react';
import { Mail, Send, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SupportModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '', issue: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.issue) {
      toast.error('Email and issue details are required');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/support`, formData);
      toast.success('Support ticket submitted successfully!');
      setFormData({ name: '', email: '', issue: '' });
      onClose();
    } catch (err) {
      toast.error('Failed to submit ticket. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-emerald-500 p-6 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/10 hover:bg-black/20 p-2 rounded-full">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Mail size={24} /> Live Support
            </h2>
            <p className="text-emerald-50 font-medium text-sm mt-2 opacity-90">
              Need help? Raise a ticket and our team will get back to you via email.
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Your Name</label>
              <input 
                type="text" 
                placeholder="John Doe"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-[#0b0f14] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-inner"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest pl-1">Email Address *</label>
              <input 
                type="email" 
                required
                placeholder="john@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-[#0b0f14] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-inner"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest pl-1">Issue Details *</label>
              <textarea 
                required
                rows={4}
                placeholder="Describe your issue or question in detail..."
                value={formData.issue}
                onChange={e => setFormData({ ...formData, issue: e.target.value })}
                className="w-full bg-slate-50 dark:bg-[#0b0f14] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-inner resize-none"
              />
            </div>
            
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-slate-950 font-black py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <><Send size={18} /> Submit Ticket</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SupportModal;
