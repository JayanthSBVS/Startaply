import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import axios from 'axios';

const FeedbackWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await axios.post('/api/feedback', form);
            setStatus('success');
            setTimeout(() => { setIsOpen(false); setStatus(''); setForm({ name: '', email: '', message: '' }); }, 2000);
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-emerald-600 dark:bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-500 hover:scale-110 transition-all z-50 flex items-center justify-center"
            >
                <MessageSquare size={24} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative animate-[fadeIn_0.2s_ease-out] border border-slate-200 dark:border-slate-800 transition-colors">
                        <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2 rounded-full transition-colors">
                            <X size={16} />
                        </button>
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Send Feedback</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">Help us improve Strataply by sharing your thoughts or reporting issues.</p>

                        {status === 'success' ? (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl font-bold text-center border border-emerald-100 dark:border-emerald-800">
                                Thank you for your feedback!
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input required type="text" placeholder="Your Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full px-5 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-slate-900 dark:text-white" />
                                <input required type="email" placeholder="Your Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full px-5 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-slate-900 dark:text-white" />
                                <textarea required rows="4" placeholder="Your message..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] px-5 py-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none font-medium text-slate-900 dark:text-white"></textarea>
                                <button type="submit" disabled={status === 'sending'} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all">
                                    {status === 'sending' ? 'Sending...' : <><Send size={18} /> Submit Feedback</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default FeedbackWidget;