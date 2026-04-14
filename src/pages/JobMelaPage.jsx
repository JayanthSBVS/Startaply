import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Calendar, MapPin, Clock, Megaphone, ArrowRight, Building2, ExternalLink, GraduationCap } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

const JobMelaPage = () => {
    const [melas, setMelas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/job-mela')
            .then(res => {
                const cleaned = res.data.map(m => ({
                    ...m,
                    description: m.description?.replace(/thei sjob mea/gi, 'this job mela')
                })).filter(m => m.isActive);
                setMelas(cleaned);
                setLoading(false);
            })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            <div className="bg-slate-900 pt-32 pb-24 text-white text-center px-6 border-b border-slate-800">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-500/20">
                    <Megaphone size={12} className="animate-pulse" /> Official Updates
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                    Upcoming <span className="text-emerald-400">Job Melas</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Mega recruitment drives and walk-in interviews from top Indian companies.
                </p>
            </div>

            {/* NEW: College Collaboration Banner */}
            <div className="bg-emerald-600 text-white py-4 border-b border-emerald-700">
                <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                        <GraduationCap size={20} className="text-white" />
                    </div>
                    <p className="font-bold text-sm sm:text-base">
                        Proudly collaborating with <span className="text-emerald-200 font-black">Top Degree & Engineering Colleges</span> nationwide to bring exclusive campus recruitment drives directly to you.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16 relative z-10">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-white rounded-[2.5rem] h-96 animate-pulse border border-slate-100 shadow-sm" />
                        ))}
                    </div>
                ) : melas.length === 0 ? (
                    <EmptyState
                        title="No Upcoming Events"
                        message="There are no active Job Melas at the moment. We recommend staying tuned for upcoming recruitment drives."
                        onReset={() => window.location.href = '/'}
                        resetLabel="Go to Home"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {melas.map(mela => (
                            <div key={mela.id} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col group hover:border-emerald-200 transition-all duration-300">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={mela.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070'}
                                        alt={mela.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-700 border border-white/20">
                                        Live Event
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <h2 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{mela.title}</h2>
                                    {mela.company && (
                                        <div className="flex items-center gap-2 text-slate-500 font-bold mb-4">
                                            <Building2 size={16} /> {mela.company}
                                        </div>
                                    )}
                                    <p className="text-slate-500 font-medium mb-8 leading-relaxed flex-1 line-clamp-3">{mela.description}</p>
                                    <div className="space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100 group-hover:bg-emerald-50/30 group-hover:border-emerald-100 transition-colors">
                                        {mela.date && <p className="flex items-center gap-3 text-sm font-bold text-slate-700"><Calendar className="text-emerald-500" size={18} /> {mela.date}</p>}
                                        {mela.time && <p className="flex items-center gap-3 text-sm font-bold text-slate-700"><Clock className="text-emerald-500" size={18} /> {mela.time}</p>}
                                        {mela.venue && <p className="flex items-center gap-3 text-sm font-bold text-slate-700"><MapPin className="text-emerald-500" size={18} /> {mela.venue}</p>}
                                    </div>

                                    {mela.registrationLink ? (
                                        <a
                                            href={mela.registrationLink.startsWith('http') ? mela.registrationLink : `https://${mela.registrationLink}`}
                                            target="_blank" rel="noreferrer"
                                            className="mt-8 bg-slate-900 hover:bg-emerald-600 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                                        >
                                            Register Now <ExternalLink size={18} />
                                        </a>
                                    ) : (
                                        <button className="mt-8 bg-slate-100 text-slate-400 font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed">
                                            Link Pending <ArrowRight size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default JobMelaPage;