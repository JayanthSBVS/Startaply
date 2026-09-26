import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, HelpCircle, FileText, ArrowRight, Monitor, GraduationCap, Cpu } from 'lucide-react';

const CATEGORIES = [
  { id: 'IT Jobs', icon: Monitor, color: 'brand', desc: 'Tech interview prep & coding Q&As' },
  { id: 'Non-IT Jobs', icon: GraduationCap, color: 'blue', desc: 'HR rounds, soft skills & guides' },
  { id: 'Aptitude & Core', icon: Cpu, color: 'indigo', desc: 'Quantitative, logical reasoning & core concepts' },
];

const InterviewPrep = () => {
  const [counts, setCounts] = useState({ IT: 0, NonIT: 0, Aptitude: 0, total: 0 });

  useEffect(() => {
    axios.get('/api/prep-data')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        const IT = data.filter(d => (d.jobType || d.jobtype) === 'IT Jobs').length;
        const NonIT = data.filter(d => (d.jobType || d.jobtype) === 'Non-IT Jobs').length;
        const Aptitude = data.filter(d => (d.jobType || d.jobtype) === 'Aptitude & Core' || (d.category || '').includes('Aptitude')).length;
        setCounts({ IT, NonIT, Aptitude, total: data.length });
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-14 md:py-20 bg-slate-50 dark:bg-[#0b0f14] transition-colors">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-brand bg-brand-soft border border-brand/20 px-3 py-1 rounded-full">
              Preparation Hub
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-3 leading-tight">
              Ace Your Next<br className="sm:hidden" /> <span className="text-brand">Interview & Assessment</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2">
              Curated articles, Q&As and interview prep materials.
            </p>
          </div>
          <Link
            to="/preparation"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-on-brand text-sm font-black px-5 py-3 rounded-full transition-all shadow-lg flex-shrink-0 group"
          >
            View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Cards - always stacked on mobile, 3-col on md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CATEGORIES.map((cat, i) => {
            const count = i === 0 ? counts.IT : i === 1 ? counts.NonIT : counts.Aptitude;
            const colorMap = {
              brand:  { bg: 'bg-brand-soft', border: 'border-brand/20', icon: 'bg-brand/10 text-brand', badge: 'bg-brand', hover: 'hover:border-brand/40 hover:shadow-brand/10' },
              blue:   { bg: 'bg-blue-50 dark:bg-blue-500/10',    border: 'border-blue-200 dark:border-blue-500/20',    icon: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',    badge: 'bg-blue-600',    hover: 'hover:border-blue-400 hover:shadow-blue-100' },
              indigo: { bg: 'bg-indigo-50 dark:bg-indigo-500/10',border: 'border-indigo-200 dark:border-indigo-500/20',icon: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',badge: 'bg-indigo-500',  hover: 'hover:border-indigo-400 hover:shadow-indigo-100' },
            }[cat.color];

            return (
              <Link
                key={cat.id}
                to="/preparation"
                className={`${colorMap.bg} border ${colorMap.border} rounded-2xl p-5 md:p-6 flex items-start gap-4 hover:shadow-xl ${colorMap.hover} transition-all group`}
              >
                <div className={`w-11 h-11 rounded-xl ${colorMap.icon} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <cat.icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-extrabold text-slate-900 text-sm md:text-base leading-snug">{cat.id}</h3>
                    {count > 0 && (
                      <span className={`text-white text-[10px] font-black px-2 py-0.5 rounded-full ${colorMap.badge}`}>
                        {count}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">{cat.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs font-black text-slate-700 group-hover:gap-2 transition-all">
                    Start Learning <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Stats Row */}
        {counts.total > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:gap-8 py-4 border-t border-slate-200 dark:border-slate-800">
            {[
              { icon: FileText, label: 'Articles', val: counts.total, color: 'text-brand' },
              { icon: HelpCircle, label: 'Q&As', val: counts.total, color: 'text-blue-600 dark:text-blue-400' },
              { icon: BookOpen, label: 'Resources', val: counts.total, color: 'text-indigo-600 dark:text-indigo-400' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <s.icon size={14} className={s.color} />
                <span>{s.val}+</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default InterviewPrep;
