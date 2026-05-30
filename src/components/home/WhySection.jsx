import React from 'react';
import { ShieldCheck, Zap, Target, Star, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <ShieldCheck size={28} />,
    title: '100% Verified Opportunities',
    desc: 'Every job is manually vetted by our team. No fake listings, no scams, no consulting fees.',
    accent: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-l-emerald-500'
  },
  {
    icon: <Zap size={28} />,
    title: 'Direct HR Access',
    desc: 'Apply directly to company portals or connect with recruiters. We cut out the middlemen entirely.',
    accent: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    border: 'border-l-indigo-500'
  },
  {
    icon: <Target size={28} />,
    title: 'Smart Matching Engine',
    desc: 'Our platform learns your preferences and highlights roles where you have the highest chance of success.',
    accent: 'text-cyan-500',
    bg: 'bg-cyan-50 dark:bg-cyan-500/10',
    border: 'border-l-cyan-500'
  }
];

const WhySection = () => {
  return (
    <section className="py-24 section-light relative z-10 transition-colors duration-500 border-t border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
      {/* Background elements */}
      <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-slate-50 to-transparent dark:from-slate-900/50 dark:to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Star size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Platform Edge</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
              Why talent chooses <span className="text-gradient-indigo-emerald">Startaply</span>
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed mb-10 max-w-lg">
              We're not just a job board. We're a career acceleration platform designed to remove friction between great talent and top companies.
            </p>

            <button className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group">
              Learn more about our vision 
              <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </motion.div>

          <div className="flex flex-col gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`premium-surface p-8 rounded-3xl border-l-4 ${feature.border} hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-300 transform hover:-translate-y-1 group`}
              >
                <div className="flex gap-6 items-start">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${feature.bg} ${feature.accent} group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhySection;
