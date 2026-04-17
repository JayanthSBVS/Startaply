import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { title: 'Free to Use', desc: 'No hidden fees or premium gates for job seekers. Complete access at zero cost.' },
  { title: 'Verified Listings', desc: 'Every company and job posting is manually reviewed to eliminate spam and fraud.' },
  { title: 'One-Click Application', desc: 'Save time by applying to multiple relevant jobs instantly with a unified profile.' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { ease: "easeOut", duration: 0.4 } }
};

const WhySection = () => {
  return (
    <section className="py-20 bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden border-b border-slate-200 dark:border-slate-900 transition-colors duration-300">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 dark:bg-teal-900/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="relative z-10 max-w-7xl mx-auto px-4"
      >
        <div className="text-center mb-14">
          <motion.h2 variants={cardVariants} className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
            Why Choose <span className="text-emerald-400">Strataply?</span>
          </motion.h2>
          <motion.p variants={cardVariants} className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            Built specifically for speed, clarity, and successful hiring outcomes.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -6 }}
              key={f.title}
              className="bg-slate-50 dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-2xl hover:shadow-emerald-900/10 dark:hover:shadow-emerald-900/30 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-[1.25rem] flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/40 group-hover:border-emerald-500/30 transition-colors">
                <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={28} />
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">{f.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default WhySection;