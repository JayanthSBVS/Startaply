import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Clock, Megaphone, ArrowRight, Building2, ExternalLink, GraduationCap } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

const JobMelaPage = () => {
    const [melas, setMelas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "Job Melas | Startaply";
        axios.get('/api/job-mela')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                const cleaned = data.map(m => ({
                    ...m,
                    description: m.description?.replace(/thei sjob mea/gi, 'this job mela')
                })).filter(m => m.isactive !== false && m.isActive !== false);
                setMelas(cleaned);
                setLoading(false);
            })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black font-sans transition-colors duration-300">
            <div className="bg-white dark:bg-[#0a0a0a] pt-20 sm:pt-32 pb-12 sm:pb-24 text-center px-4 sm:px-6 border-b border-slate-200 dark:border-neutral-800 transition-colors">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-brand-soft text-brand dark:text-brand-hover rounded-full text-[10px] font-black uppercase tracking-widest mb-4 sm:mb-6 border border-brand/20">
                    <Megaphone size={12} className="animate-pulse" /> Official Hiring Drives
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-3 sm:mb-6 text-slate-900 dark:text-white">
                    Upcoming <span className="text-brand">Job Melas</span>
                </h1>
                <p className="text-xs sm:text-base md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Mega recruitment drives and walk-in hiring campaigns from top Indian employers.
                </p>
            </div>

            {/* College Collaboration Banner */}
            <div className="bg-brand text-on-brand py-3.5 sm:py-4 border-b border-brand-hover">
                <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 text-center sm:text-left">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/15 rounded-full flex items-center justify-center shrink-0">
                        <GraduationCap size={18} className="text-white" />
                    </div>
                    <p className="font-bold text-xs sm:text-base">
                        Proudly collaborating with <span className="text-white font-black underline decoration-white/40">Top Degree &amp; Engineering Colleges</span> nationwide to bring exclusive campus recruitment drives directly to you.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-16 relative z-10">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl h-80 sm:h-96 animate-pulse border border-slate-100 dark:border-slate-800 shadow-xs" />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        {melas.map(mela => {
                            // Support both DB lowercase and camelCase field names
                            const thumbnail = mela.bannerimage || mela.bannerImage || mela.image ||
                                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070';
                            const regLink = mela.registrationlink || mela.registrationLink;
                            const hasMap = !!(mela.googlemaplink || mela.googleMapLink);

                            return (
                                <div key={mela.id} className="bg-white dark:bg-[#0a0a0a] rounded-2xl sm:rounded-[2.5rem] shadow-lg sm:shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-100 dark:border-neutral-800 overflow-hidden flex flex-col group hover:border-brand/40 transition-all duration-300">
                                    <div className="relative h-48 sm:h-64 overflow-hidden">
                                        <img
                                            src={thumbnail}
                                            alt={mela.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-brand text-on-brand backdrop-blur-md px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-md">
                                            Live Event
                                        </div>
                                        {hasMap && (
                                            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1.5 border border-white/10">
                                                <MapPin size={10} className="text-brand-hover" /> Map
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 sm:p-8 flex-1 flex flex-col">
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-1.5 sm:mb-2 group-hover:text-brand dark:group-hover:text-brand-hover transition-colors">{mela.title}</h2>
                                        {mela.company && (
                                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-sm mb-3 sm:mb-4">
                                                <Building2 size={14} /> {mela.company}
                                            </div>
                                        )}
                                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mb-5 sm:mb-8 leading-relaxed flex-1 line-clamp-3">{mela.description}</p>
                                        <div className="space-y-2 sm:space-y-3 bg-slate-50 dark:bg-[#121212] p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-neutral-800 group-hover:bg-brand-soft/50 dark:group-hover:bg-brand-soft/10 group-hover:border-brand/20 transition-colors">
                                            {mela.date && <p className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300"><Calendar className="text-brand" size={16} /> {mela.date}</p>}
                                            {mela.time && <p className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300"><Clock className="text-brand" size={16} /> {mela.time}</p>}
                                            {mela.venue && <p className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300"><MapPin className="text-brand" size={16} /> {mela.venue}</p>}
                                        </div>

                                        <div className="mt-5 sm:mt-6 flex gap-2.5 sm:gap-3">
                                            <Link
                                                to={`/job-mela/${mela.id}`}
                                                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black py-3 sm:py-4 px-3 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] text-xs sm:text-sm shadow-xs min-h-[44px]"
                                            >
                                                Details <ArrowRight size={14} />
                                            </Link>
                                            {regLink ? (
                                                <a
                                                    href={regLink.startsWith('http') ? regLink : `https://${regLink}`}
                                                    target="_blank" rel="noreferrer"
                                                    className="flex-1 bg-brand hover:bg-brand-hover text-on-brand font-black py-3 sm:py-4 px-3 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] text-xs sm:text-sm shadow-md shadow-brand/25 min-h-[44px]"
                                                >
                                                    Register <ExternalLink size={14} />
                                                </a>
                                            ) : (
                                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black py-3 sm:py-4 px-3 rounded-xl sm:rounded-2xl flex items-center justify-center text-xs sm:text-sm cursor-not-allowed min-h-[44px]">
                                                    Link Soon
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobMelaPage;
