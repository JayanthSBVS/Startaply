import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Landmark, Building2, Settings2, GraduationCap, ArrowRight } from 'lucide-react';
import { jobsData } from '../../data/jobsData';

const iconComponents = { Landmark, Building2, Settings2, GraduationCap };

const Categories = ({ onCategoryFilter }) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-10"></div>
      <div className="absolute -right-10 top-20 w-40 h-40 rounded-full border border-primary/10 pointer-events-none" style={{ animation: 'spin 40s linear infinite' }}></div>

      <div className="max-w-7xl mx-auto">
        <div ref={sectionRef} className="section-fade-in text-center mb-14">
          <div className="inline-flex items-center gap-2 glass neon-border rounded-full px-4 py-1.5 mb-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Explore Categories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            Your Path, <span className="gradient-text">Your Choice</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Explore thousands of opportunities across every sector and career stage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoriesData.map((cat, index) => {
            const IconComp = iconComponents[cat.iconName] || Building2;
            return (
              <motion.div
                key={cat.id}
                id={`category-card-${cat.id}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, rotateY: 5, rotateX: -3, scale: 1.02 }}
                onClick={() => onCategoryFilter(cat.title)}
                className="relative cursor-pointer group rounded-3xl p-6 glass overflow-hidden transition-all duration-300"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Hover gradient bg */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`}></div>

                {/* Glow */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: `inset 0 0 30px ${cat.color}20, 0 0 40px ${cat.color}15` }}></div>

                {/* Border */}
                <div className="absolute inset-0 rounded-3xl border" style={{ borderColor: `${cat.color}20` }}></div>
                <div className="absolute inset-0 rounded-3xl border opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ borderColor: `${cat.color}50` }}></div>

                {/* 3D Icon */}
                <div className="relative z-10 mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      background: `linear-gradient(135deg, ${cat.color}25, ${cat.color}10)`,
                      border: `1px solid ${cat.color}30`,
                      boxShadow: `0 8px 24px ${cat.color}20`,
                      transform: 'perspective(300px) translateZ(10px)',
                    }}
                  >
                    <IconComp size={26} strokeWidth={1.5} style={{ color: cat.color }} />
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-2">{cat.title}</h3>
                  <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors leading-relaxed mb-4">{cat.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold" style={{ color: cat.color }}>{cat.count} jobs</div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
                      style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}40` }}
                    >
                      <ArrowRight size={14} strokeWidth={2} style={{ color: cat.color }} />
                    </div>
                  </div>
                </div>

                {/* Accent dots */}
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full opacity-40 group-hover:opacity-100 transition-opacity" style={{ background: cat.color }}></div>
                <div className="absolute top-8 right-8 w-1 h-1 rounded-full opacity-20 group-hover:opacity-60 transition-opacity" style={{ background: cat.color }}></div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
