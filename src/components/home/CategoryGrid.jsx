import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Building2, TrendingUp, Briefcase, Zap, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { name: 'IT & Non-IT', path: 'IT & Non-IT Jobs', desc: 'Developer, Design, Sales & Operations', icon: <Monitor size={28} />, link: false },
  { name: 'Government Jobs', path: 'Government Jobs', desc: 'Central & State govt opportunities', icon: <Building2 size={28} />, link: false },
  { name: 'Freshers', path: '/jobs?fresh=true', desc: '0–1 yr experience welcome', icon: <GraduationCap size={28} />, link: true },
  { name: 'Private Jobs', path: 'Private Jobs', desc: 'Corporate and enterprise roles', icon: <Briefcase size={28} />, link: false },
  { name: 'Gig & Services', path: 'Gig & Services', desc: 'Warehouse, Delivery, Plumber & Urban roles', icon: <Zap size={28} />, link: false },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

const CategoryGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4"
      >
        <div className="text-center mb-10">
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
            Explore Top Categories
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
            Find the right opportunities based on your specific career path.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((cat) => (
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              key={cat.name}
              onClick={() => cat.link ? navigate(cat.path) : navigate(`/category/${encodeURIComponent(cat.path)}`)}
              className="cursor-pointer bg-white dark:bg-slate-900 p-7 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 border border-slate-100 dark:border-slate-800 rounded-[1.25rem] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/40 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:border-emerald-100 dark:group-hover:border-emerald-800 transition-all duration-300">
                {cat.icon}
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{cat.name}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{cat.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default CategoryGrid;