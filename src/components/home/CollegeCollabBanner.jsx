import React from 'react';
import { GraduationCap, Sparkles, Building2, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const CollegeCollabBanner = () => {
    return (
        <section className="relative py-24 bg-slate-950 overflow-hidden border-y border-slate-900">
            {/* Background Glows & Patterns */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest mb-6">
                            <GraduationCap size={16} /> Campus to Corporate
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-[1.1]">
                            Empowering <span className="text-emerald-400">Institutions</span> Nationwide
                        </h2>

                        <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10">
                            Strataply exclusively partners with Top Degree & Engineering Colleges across India. We bridge the gap between academia and industry by bringing verified, high-tier recruitment drives directly to campus networks.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-full px-6 py-4 shadow-xl shadow-emerald-900/10 hover:border-emerald-500/30 transition-colors">
                                <Building2 size={24} className="text-emerald-500 shrink-0" />
                                <span className="text-white font-bold text-sm tracking-wide">500+ Partner Colleges</span>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-full px-6 py-4 shadow-xl shadow-emerald-900/10 hover:border-emerald-500/30 transition-colors">
                                <Award size={24} className="text-emerald-500 shrink-0" />
                                <span className="text-white font-bold text-sm tracking-wide">Exclusive Campus Drives</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Image & Floating Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative h-[450px] rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl group"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1462"
                            alt="College Campus Graduates"
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

                        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8">
                            <div className="bg-emerald-600/90 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] border border-emerald-400/50 shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="flex items-center gap-3 mb-3">
                                    <Sparkles className="text-emerald-200" size={24} />
                                    <h3 className="text-white font-black text-xl tracking-tight">Direct Placements</h3>
                                </div>
                                <p className="text-emerald-50 text-sm font-medium leading-relaxed">
                                    Students from our partnered institutes gain priority access to verified corporate walk-ins, giant job melas, and private placement fairs before they open to the public.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default CollegeCollabBanner;