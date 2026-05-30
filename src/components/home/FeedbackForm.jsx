import React, { useState } from 'react';
import { useJobs } from '../../context/JobsContext';
import { Check, MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const FeedbackForm = () => {
  const { addFeedback } = useJobs();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus('submitting');
    try {
      await addFeedback(form);
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => {
        setStatus('idle');
        setIsOpen(false);
      }, 3000);
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <>
      <section id="feedback" className="py-24 section-light relative overflow-hidden transition-colors duration-500">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#EEF4FF] dark:to-slate-900/50 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8 border border-slate-200 dark:border-slate-800 relative group cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageSquare className="w-10 h-10 text-emerald-500 relative z-10" />
            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md">
              <Sparkles size={12} />
            </div>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Help us build the <span className="text-gradient-emerald">Future</span></h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto font-medium text-lg leading-relaxed">
            Your feedback directly shapes our product roadmap. Tell us what you love, what's broken, or what you wish existed.
          </p>
          
          <button
            onClick={() => setIsOpen(true)}
            className="group relative overflow-hidden bg-slate-900 dark:bg-emerald-500 text-white font-bold py-4 px-10 rounded-full transition-all inline-flex items-center gap-3 shadow-[0_8px_30px_rgba(15,23,42,0.2)] dark:shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:-translate-y-1"
          >
            <div className="absolute inset-0 border border-white/20 rounded-full opacity-0 group-hover:animate-[ring-pulse_1.5s_ease-out_infinite]" />
            <MessageSquare size={18} className="relative z-10" />
            <span className="relative z-10">Share Your Thoughts</span>
          </button>
        </div>
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-[#0b0f14]/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden relative border border-slate-100 dark:border-slate-800"
          >
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors p-2.5 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 md:p-10">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">
                  <MessageSquare size={16} /> User Feedback
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">We're listening.</h3>
              </div>

              <form onSubmit={handleSubmit} className="text-left space-y-5">
                {status === 'success' && (
                  <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 text-sm font-bold animate-in fade-in">
                    <Check size={18} /> Feedback received successfully!
                  </div>
                )}
                {status === 'error' && (
                  <div className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-500/20 text-sm font-bold animate-in fade-in">
                    Failed to submit feedback. Please try again.
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mb-2 pl-1">Your Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-[#0b0f14] border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none font-semibold text-slate-900 dark:text-white placeholder-slate-400"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mb-2 pl-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-[#0b0f14] border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none font-semibold text-slate-900 dark:text-white placeholder-slate-400"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mb-2 pl-1">Your Thoughts</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-[#0b0f14] border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none resize-none font-semibold text-slate-900 dark:text-white placeholder-slate-400"
                    placeholder="Tell us what you think..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 mt-2 rounded-2xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {status === 'submitting' ? 'Submitting...' : <><Send size={18} /> Send Feedback</>}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default FeedbackForm;
