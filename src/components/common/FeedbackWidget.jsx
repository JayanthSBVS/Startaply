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
            await axios.post('http://localhost:5000/api/feedback', form);
            setStatus('success');
            setTimeout(() => { setIsOpen(false); setStatus(''); setForm({ name: '', email: '', message: '' }); }, 2000);
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-500 hover:scale-110 transition-all z-50 flex items-center justify-center"
            >
                <MessageSquare size={24} />
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-[fadeIn_0.2s_ease-out]">
                        <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Send Feedback</h2>
                        <p className="text-slate-500 text-sm mb-6">Help us improve Strataply by sharing your thoughts or reporting issues.</p>

                        {status === 'success' ? (
                            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl font-bold text-center border border-emerald-100">
                                Thank you for your feedback!
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input required type="text" placeholder="Your Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                                <input required type="email" placeholder="Your Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                                <textarea required rows="4" placeholder="Your message..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"></textarea>
                                <button type="submit" disabled={status === 'sending'} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all">
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