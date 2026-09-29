import React, { useState } from 'react';
import { GraduationCap, Building2, CalendarCheck, X, Send, Loader2, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CollegeCollabBanner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ collegeName: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, phone: digitsOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid official email address.');
      return;
    }
    if (formData.phone.length !== 10) {
      setError('Contact number must be exactly 10 digits.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/collabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to submit request');
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        setFormData({ collegeName: '', email: '', phone: '', message: '' });
      }, 3000);
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="collabs" className="relative py-20 md:py-28 bg-white dark:bg-black overflow-hidden border-b border-slate-200/80 dark:border-neutral-800 transition-colors duration-300">
      {/* Background Decorative Mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-br from-[#001F8E]/5 via-[#1A62FE]/8 to-transparent dark:from-[#001F8E]/15 dark:via-[#1A62FE]/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-gradient-to-br from-slate-50 to-brand-soft dark:from-[#0a0a0a] dark:to-[#050505] border border-slate-200/80 dark:border-neutral-800 rounded-3xl p-5 sm:p-8 md:p-14 shadow-xl shadow-slate-200/40 dark:shadow-none text-center relative overflow-hidden"
        >
          {/* Subtle top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand via-brand-hover to-blue-400" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-soft border border-brand/20 text-brand dark:text-brand-hover text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-6">
            <GraduationCap size={15} /> Campus to Corporate Network
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 sm:mb-5 tracking-tight leading-tight">
            Bridging Campus Talent with <br className="hidden sm:inline" />
            <span className="text-brand dark:text-brand-hover">High-Growth Corporates</span>
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base md:text-lg font-normal leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto">
            Startaply partners with leading Degree, Engineering, and Polytechnic colleges across India. We bring verified corporate hiring drives and fresher recruitment melas directly to your campus.
          </p>

          {/* Key Metrics / Highlights */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-4 items-stretch sm:items-center justify-center mb-6 sm:mb-9">
            <div className="flex items-center gap-2.5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-xs">
              <Building2 size={16} className="text-brand dark:text-brand-hover shrink-0" />
              <span className="text-slate-800 dark:text-white font-bold text-xs sm:text-sm">500+ Partner Colleges</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-xs">
              <CalendarCheck size={16} className="text-brand dark:text-brand-hover shrink-0" />
              <span className="text-slate-800 dark:text-white font-bold text-xs sm:text-sm">Exclusive On-Campus Drives</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-xs">
              <Award size={16} className="text-amber-500 shrink-0" />
              <span className="text-slate-800 dark:text-white font-bold text-xs sm:text-sm">100% Free Placement Engine</span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="group inline-flex items-center justify-center gap-2.5 bg-brand hover:bg-brand-hover text-on-brand w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-brand/25 active:scale-95 min-h-[48px]"
            aria-label="Request College Collaboration"
          >
            Partner with Startaply
            <Send size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Collaboration Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Partner with Startaply"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 z-10"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Partner with Startaply</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">Submit your institution details for corporate drive collaboration.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  aria-label="Close form"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                {success ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 bg-[#EFF3FF] dark:bg-[#1A62FE]/10 text-[#001F8E] dark:text-[#1A62FE] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#1A62FE]/20">
                      <CheckCircle2 size={28} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">Request Received!</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal max-w-sm mx-auto">Our campus partnerships team will review your details and reach out within 24 business hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs rounded-xl border border-rose-100 dark:border-rose-500/20 font-medium">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">College / Institution Name <span className="text-rose-500">*</span></label>
                      <input
                        required
                        type="text"
                        name="collegeName"
                        value={formData.collegeName}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A62FE]/20 focus:border-[#1A62FE] transition-all font-medium"
                        placeholder="e.g. Osmania University College of Engineering"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Official Placement Email <span className="text-rose-500">*</span></label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A62FE]/20 focus:border-[#1A62FE] transition-all font-medium"
                        placeholder="placements@college.edu.in"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Contact Number (10 Digits) <span className="text-rose-500">*</span></label>
                      <input
                        required
                        type="tel"
                        name="phone"
                        maxLength={10}
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A62FE]/20 focus:border-[#1A62FE] transition-all font-medium"
                        placeholder="e.g. 9876543210"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Expected Drive Details / Message (Optional)</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A62FE]/20 focus:border-[#1A62FE] transition-all resize-none font-medium"
                        placeholder="Share expected batch size, branches, or preferred drive dates..."
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#001F8E] hover:bg-[#1A62FE] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-[#001F8E]/20 disabled:opacity-60 text-sm"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Submit Partnership Request'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CollegeCollabBanner;
