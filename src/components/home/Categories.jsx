import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Landmark, Building2, Settings2, GraduationCap, ArrowRight } from 'lucide-react';

const iconComponents = { Landmark, Building2, Settings2, GraduationCap };

const Categories = ({ categoriesData, onCategoryFilter }) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (!categoriesData) return null;

  return (
    <section className="relative py-24 px-4 sm:px-6 overflow-hidden bg-slate-900 border-b border-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div ref={sectionRef} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Explore Categories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
            Your Path, <span className="text-emerald-400">Your Choice</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base font-medium">
            Explore thousands of opportunities across every sector and career stage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoriesData.map((cat, index) => {
            const IconComp = iconComponents[cat.iconName] || Building2;
            return (
              <motion.div
                key={cat.id || index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => onCategoryFilter(cat.title)}
                className="relative cursor-pointer group rounded-[2rem] p-6 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 hover:border-emerald-500/50 overflow-hidden transition-all duration-300"
              >
                {/* Glow */}
                <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${cat.color}20, transparent 70%)` }}></div>

                {/* 3D Icon */}
                <div className="relative z-10 mb-6 mt-2">
                  <div
                    className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}05)`,
                      border: `1px solid ${cat.color}30`,
                    }}
                  >
                    <IconComp size={26} strokeWidth={1.5} style={{ color: cat.color }} />
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">{cat.title}</h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">{cat.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="text-sm font-bold" style={{ color: cat.color }}>{cat.count} jobs</div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
                      style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}40` }}
                    >
                      <ArrowRight size={14} strokeWidth={2} style={{ color: cat.color }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;