import React from 'react';
import { motion } from 'framer-motion';
import { Compass, FileSearch, Rocket } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: Compass,
    title: 'Explore Roles',
    desc: 'Search verified government, private, and fresher jobs instantly across 15+ categories.',
    accent: 'from-emerald-400 to-teal-400',
    glow: 'rgba(16,185,129,0.12)',
  },
  {
    num: '02',
    icon: FileSearch,
    title: 'Review Details',
    desc: 'Check salary, location, and skills with complete transparency. No hidden information.',
    accent: 'from-blue-400 to-cyan-400',
    glow: 'rgba(6,182,212,0.12)',
  },
  {
    num: '03',
    icon: Rocket,
    title: 'Apply Directly',
    desc: 'Click to apply with zero friction. No account creation. No consultancy fees.',
    accent: 'from-violet-400 to-purple-400',
    glow: 'rgba(167,139,250,0.12)',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/50 overflow-hidden relative transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] opacity-20"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(16,185,129,0.08) 0%, transparent 65%)', filter: 'blur(80px)' }}
        />
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
        className="relative z-10 max-w-6xl mx-auto px-4"
      >
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-500">Zero Friction</span>
          </motion.div>
          <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            How It <span className="text-gradient-emerald">Works</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-medium text-base">
            Three simple steps to your next opportunity. No account required.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -6 }}
                key={step.num}
                className="group relative bg-slate-50 dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/50 hover:border-emerald-400/40 dark:hover:border-emerald-700/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-300 overflow-hidden cursor-default"
              >
                {/* Accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${step.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Background glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
                  style={{ background: `radial-gradient(ellipse at top left, ${step.glow} 0%, transparent 60%)` }}
                />

                {/* Step number (ghost) */}
                <div className="absolute top-6 right-6 text-6xl font-black text-slate-100 dark:text-slate-800/60 leading-none pointer-events-none select-none group-hover:text-emerald-100/30 dark:group-hover:text-emerald-900/30 transition-colors">
                  {step.num}
                </div>

                {/* Icon */}
                <div className={`relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-br ${step.accent} flex items-center justify-center mb-6 shadow-[0_4px_16px_rgba(0,0,0,0.12)] group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} className="text-white" />
                </div>

                <h3 className="relative z-10 text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {step.title}
                </h3>
                <p className="relative z-10 text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-sm">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};

export default HowItWorks;