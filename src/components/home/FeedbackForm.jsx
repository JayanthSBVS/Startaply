import React, { useState } from 'react';
import { useJobs } from '../../context/JobsContext';
import { Check, MessageSquare, X, Send } from 'lucide-react';

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
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 border border-emerald-100">
            <MessageSquare className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">We Value Your Feedback</h2>
          <p className="text-slate-500 mb-8 max-w-xl mx-auto font-medium text-lg">
            Help us improve Strataply! Let us know what features you love or what we could do better to help you find your dream job faster.
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-slate-900 hover:bg-emerald-600 text-white font-bold py-4 px-10 rounded-full transition-all inline-flex items-center gap-3 shadow-lg shadow-slate-900/20 hover:shadow-emerald-600/30"
          >
            <MessageSquare size={18} />
            Leave Feedback
          </button>
        </div>
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors p-2 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 rounded-[1.25rem] mb-4 border border-emerald-100">
                  <MessageSquare className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Feedback</h3>
                <p className="text-slate-500 mt-2 font-medium">Help us build a better platform for you.</p>
              </div>

              <form onSubmit={handleSubmit} className="text-left">
                {status === 'success' && (
                  <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-200 mb-6 text-sm font-bold">
                    <Check size={18} />
                    Thank you! Your feedback has been sent to our team.
                  </div>
                )}
                {status === 'error' && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 mb-6 text-sm font-bold">
                    Failed to submit feedback. Please try again.
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Your Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none font-medium"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none font-medium"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Your Feedback</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors outline-none resize-none font-medium"
                      placeholder="Tell us what you think..."
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 mt-2 rounded-full transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                  >
                    {status === 'submitting' ? 'Submitting...' : <><Send size={18} /> Send Feedback</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackForm;