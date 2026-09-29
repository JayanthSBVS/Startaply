import React, { useState } from 'react';
import { Mail, Send, X, CheckCircle2, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const SupportModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '', issue: '' });
  const [loading, setLoading] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!formData.issue?.trim()) {
      toast.error('Issue details are required');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/support`, formData);
      const ticketId = `TK-${Date.now().toString().slice(-6)}`;
      setSubmittedTicket({
        id: ticketId,
        name: formData.name,
        email: formData.email,
        issue: formData.issue
      });
      setFormData({ name: '', email: '', issue: '' });
    } catch (err) {
      toast.error('Failed to submit ticket. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmittedTicket(null);
    setFormData({ name: '', email: '', issue: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center p-4 sm:p-6" style={{ minHeight: '100vh' }}>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={handleClose}
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-2rem)] flex flex-col z-10"
          >
            {submittedTicket ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 sm:p-8 text-center space-y-5 overflow-y-auto"
              >
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute -inset-2 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10">
                    <CheckCircle2 size={40} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-full uppercase tracking-wider border border-emerald-500/20">
                    <Ticket size={14} /> Ticket ID: #{submittedTicket.id}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Support Ticket Submitted!
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
                    Thank you <span className="font-bold text-slate-800 dark:text-slate-200">{submittedTicket.name || 'valued user'}</span>. Our support team has logged your issue and will get back to you at <span className="font-bold text-emerald-600 dark:text-emerald-400">{submittedTicket.email}</span>.
                  </p>
                </div>
                
                <div className="bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 text-left space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400 font-medium">
                    <span>Status:</span>
                    <span className="text-emerald-500 font-bold uppercase">Open & Priority Assigned</span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                    "{submittedTicket.issue}"
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-sm"
                >
                  Got It, Thank You!
                </button>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-brand text-white p-5 sm:p-6 relative overflow-hidden shrink-0">
                  <button 
                    onClick={handleClose} 
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full min-h-[36px] min-w-[36px] flex items-center justify-center" 
                    aria-label="Close support modal"
                  >
                    <X size={18} />
                  </button>
                  <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2.5">
                    <Mail size={22} className="text-blue-200" /> Live Support
                  </h2>
                  <p className="text-blue-100 font-medium text-xs sm:text-sm mt-1">
                    Need help? Raise a ticket and our team will get back to you via email.
                  </p>
                </div>
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 sm:p-6 md:p-8 space-y-4 overflow-y-auto">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest pl-1">Your Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-brand dark:text-brand-hover tracking-widest pl-1">Email Address *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-brand dark:text-brand-hover tracking-widest pl-1">Issue Details *</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Describe your issue or question in detail..."
                      value={formData.issue}
                      onChange={e => setFormData({ ...formData, issue: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all resize-none"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-brand/25 active:scale-95 text-sm min-h-[44px]"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><Send size={16} /> Submit Ticket</>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SupportModal;
