import React from 'react';
import { motion } from 'framer-motion';

const steps = [
    { num: '01', title: 'Explore Roles', desc: 'Search verified government, private, and fresher jobs instantly.' },
    { num: '02', title: 'Review Details', desc: 'Check salary, location, and skills with complete transparency.' },
    { num: '03', title: 'Apply Directly', desc: 'Click to apply immediately with zero friction and no login required.' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } }
};

const HowItWorks = () => {
    return (
        <section className="py-20 bg-white border-b border-slate-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
                variants={containerVariants}
                className="relative z-10 max-w-6xl mx-auto px-4 text-center"
            >
                <motion.div variants={itemVariants} className="mb-14">
                    <span className="text-emerald-600 font-black tracking-widest uppercase text-xs mb-2 block">Zero Friction</span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">How It Works</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">Three simple steps to land your dream job without ever creating an account.</p>
                </motion.div>

                <div className="relative">
                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        {steps.map((step) => (
                            <motion.div variants={itemVariants} key={step.num} className="flex flex-col items-center group bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-2">
                                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[1.25rem] flex items-center justify-center text-2xl font-black mb-6 shadow-sm border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                                    {step.num}
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-900 mb-3">{step.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default HowItWorks;