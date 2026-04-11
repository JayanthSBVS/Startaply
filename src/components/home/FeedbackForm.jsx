import React, { useState } from 'react';
import { useJobs } from '../../context/JobsContext';
import { Check, MessageSquare, X } from 'lucide-react';

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
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <MessageSquare className="w-10 h-10 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">We Value Your Feedback</h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">
            Help us improve Strataply! Let us know what features you love or what we could do better to help you find your dream job faster.
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-colors inline-flex items-center gap-2"
          >
            <MessageSquare size={20} />
            Leave Feedback
          </button>
        </div>
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded-full mb-4">
                  <MessageSquare className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Your Feedback</h3>
                <p className="text-gray-500 mt-2 text-sm">Help us build a better platform for you.</p>
              </div>

              <form onSubmit={handleSubmit} className="text-left">
                {status === 'success' && (
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 mb-4 text-sm font-medium">
                    <Check size={16} />
                    Thank you! Your feedback has been sent to our team.
                  </div>
                )}
                {status === 'error' && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 mb-4 text-sm font-medium">
                    Failed to submit feedback. Please try again.
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Your Feedback</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors outline-none resize-none"
                      placeholder="Tell us what you think..."
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 mt-2 rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center text-md"
                  >
                    {status === 'submitting' ? 'Submitting...' : 'Send Feedback'}
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

