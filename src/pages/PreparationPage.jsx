import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { BookOpen, ChevronRight, GraduationCap, Building2, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
    { id: 'IT Jobs', icon: Monitor },
    { id: 'Non-IT Jobs', icon: GraduationCap },
    { id: 'Government Jobs', icon: Building2 }
];

const PreparationPage = () => {
    const [activeTab, setActiveTab] = useState('IT Jobs');
    const [prepData, setPrepData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/prep-data')
            .then(res => { setPrepData(res.data); setLoading(false); })
            .catch(() => { setLoading(false); });
    }, []);

    const filteredData = useMemo(() => prepData.filter(p => (p.jobType || p.jobtype) === activeTab), [prepData, activeTab]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100">
            <Navbar />
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="bg-slate-900 pt-28 pb-20 px-4 text-center border-b border-slate-800 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50" />
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                        Interview & Exam <span className="text-emerald-400">Preparation</span>
                    </h1>
                    <p className="text-slate-400 font-medium max-w-2xl mx-auto">
                        Access curated study materials and interview questions specific to your field.
                    </p>
                </div>
            </motion.div>

            <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
                <div className="bg-white rounded-full shadow-xl shadow-slate-200/50 border border-slate-200 p-2 mb-8 flex justify-center gap-2 overflow-x-auto no-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeTab === cat.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            <cat.icon size={16} /> {cat.id}
                        </button>
                    ))}
                </div>

                <div className="pb-24 min-h-[50vh]">
                    {loading ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 animate-pulse">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl mb-6" />
                                    <div className="h-6 bg-slate-100 rounded-full w-3/4 mb-4" />
                                    <div className="space-y-3">
                                        <div className="h-4 bg-slate-50 rounded-full w-full" />
                                        <div className="h-4 bg-slate-50 rounded-full w-5/6" />
                                        <div className="h-4 bg-slate-50 rounded-full w-4/6" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredData.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 bg-white rounded-[2rem] border border-slate-200 shadow-sm"
                        >
                            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-xl font-extrabold text-slate-900 mb-2">No Data Available</h3>
                            <p className="text-slate-500 font-medium">Preparation materials for {activeTab} will be added soon.</p>
                        </motion.div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredData.map(item => (
                                    <motion.div 
                                        key={item.id} 
                                        layout 
                                        initial={{ opacity: 0, y: 20 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        exit={{ opacity: 0, scale: 0.95 }} 
                                        className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-emerald-300 hover:shadow-2xl hover:-translate-y-1 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                            <BookOpen size={24} />
                                        </div>
                                        <h3 className="text-xl font-extrabold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                                            {item.heading}
                                        </h3>
                                        <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-sm">
                                            {item.content}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PreparationPage;