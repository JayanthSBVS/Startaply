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
        <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden relative transition-colors duration-300">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/40 dark:bg-emerald-900/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
                variants={containerVariants}
                className="relative z-10 max-w-6xl mx-auto px-4 text-center"
            >
                <motion.div variants={itemVariants} className="mb-14">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black tracking-widest uppercase text-xs mb-2 block">Zero Friction</span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">How It Works</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">Three simple steps to land your dream job without ever creating an account.</p>
                </motion.div>

                <div className="relative">
                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        {steps.map((step) => (
                            <motion.div variants={itemVariants} key={step.num} className="flex flex-col items-center group bg-white/80 dark:bg-slate-950/40 backdrop-blur-sm p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-slate-950/20 border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-2">
                                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-[1.25rem] flex items-center justify-center text-2xl font-black mb-6 shadow-sm border border-emerald-100 dark:border-emerald-800 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:text-slate-950 group-hover:rotate-6 transition-all duration-300">
                                    {step.num}
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{step.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default HowItWorks;