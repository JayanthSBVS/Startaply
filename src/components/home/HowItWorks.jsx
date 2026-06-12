import React from 'react';
import { Search, MapPin, MousePointerClick, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: <Search size={26} />,
    title: 'Discover Opportunities',
    desc: 'Search across Government, IT, Non-IT, Fresher and Startup jobs - all verified, zero consulting fees.',
    number: '01',
    color: 'emerald',
  },
  {
    icon: <MapPin size={26} />,
    title: 'Explore Verified Openings',
    desc: 'Review salary, location, work mode, experience required, skills needed, and last date to apply.',
    number: '02',
    color: 'cyan',
  },
  {
    icon: <MousePointerClick size={26} />,
    title: 'Apply Directly',
    desc: 'Click Apply and go straight to the company portal or use Easy Apply - no middlemen, no hidden steps.',
    number: '03',
    color: 'indigo',
  },
  {
    icon: <CheckCircle2 size={26} />,
    title: 'Land Your Role',
    desc: 'Follow up with new listings daily. Job Mela campaigns and Featured Drives give you an edge.',
    number: '04',
    color: 'slate',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-10 md:py-24 section-elevated relative overflow-hidden transition-colors duration-500 border-y border-slate-200/50 dark:border-slate-800/50">
      {/* Faint background dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025] dark:opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-10 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <Zap size={12} />
            How It Works
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3 md:mb-4"
          >
            Your path to <span className="text-gradient-emerald">success</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-xl mx-auto"
          >
            Four simple steps between you and your next career move.
          </motion.p>
        </div>

        <div className="relative">
          {/* Desktop connecting line */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700/50 to-transparent z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Ghost number watermark */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-8xl font-black text-slate-900/[0.04] dark:text-white/[0.04] pointer-events-none group-hover:-translate-y-2 transition-transform duration-500">
                  {step.number}
                </div>

                {/* Icon container */}
                <div className={`w-20 h-20 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-center mb-6 relative z-10 text-${step.color}-500 group-hover:-translate-y-2 transition-all duration-300`}>
                  <div className={`absolute inset-0 bg-${step.color}-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                  {step.icon}
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 tracking-tight">{step.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed px-2">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
