import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Building2, TrendingUp, PieChart, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { name: 'IT & Software', path: 'IT Jobs', desc: 'Developer, Design & Tech roles', icon: <Monitor size={28} /> },
  { name: 'Government Jobs', path: 'Government Jobs', desc: 'Central & State govt opportunities', icon: <Building2 size={28} /> },
  { name: 'Marketing', path: 'Marketing', desc: 'Digital, SEO & Content roles', icon: <TrendingUp size={28} /> },
  { name: 'Finance', path: 'Finance', desc: 'Accounting & Banking roles', icon: <PieChart size={28} /> },
  { name: 'Gig Works', path: 'Gig Works', desc: 'Freelance & short-term tasks', icon: <Zap size={28} /> }, // Added Gig works
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
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4"
      >
        <div className="text-center mb-10">
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Explore Top Categories
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-slate-600 max-w-2xl mx-auto">
            Find the right opportunities based on your specific career path.
          </motion.p>
        </div>

        {/* Adjusted to 5 columns on desktop to fit Gig Works */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((cat) => (
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -6 }}
              key={cat.name}
              onClick={() => navigate(`/category/${encodeURIComponent(cat.path)}`)}
              className="cursor-pointer bg-white p-6 border border-slate-200 rounded-2xl hover:shadow-xl hover:border-emerald-400 hover:ring-1 hover:ring-emerald-400 transition-all group"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                {cat.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">{cat.name}</h3>
              <p className="text-sm font-medium text-slate-500">{cat.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default CategoryGrid;