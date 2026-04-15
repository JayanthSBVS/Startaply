import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, HelpCircle, FileText, ArrowRight, Monitor, GraduationCap, Building2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'IT Jobs', icon: Monitor, color: 'emerald', desc: 'Tech interview prep & coding Q&As' },
  { id: 'Non-IT Jobs', icon: GraduationCap, color: 'blue', desc: 'HR rounds, soft skills & guides' },
  { id: 'Government Jobs', icon: Building2, color: 'amber', desc: 'Previous year papers & syllabus' },
];

const InterviewPrep = () => {
  const [counts, setCounts] = useState({ IT: 0, NonIT: 0, Gov: 0, total: 0 });

  useEffect(() => {
    axios.get('/api/prep-data')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        const IT = data.filter(d => (d.jobType || d.jobtype) === 'IT Jobs').length;
        const NonIT = data.filter(d => (d.jobType || d.jobtype) === 'Non-IT Jobs').length;
        const Gov = data.filter(d => (d.jobType || d.jobtype) === 'Government Jobs').length;
        setCounts({ IT, NonIT, Gov, total: data.length });
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-14 md:py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Preparation Hub
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-3 leading-tight">
              Ace Your Next<br className="sm:hidden" /> <span className="text-emerald-600">Interview & Exam</span>
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-2">
              Curated articles, Q&As and downloadable papers.
            </p>
          </div>
          <Link
            to="/interview-prep"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white text-sm font-black px-5 py-3 rounded-full transition-all shadow-lg flex-shrink-0 group"
          >
            View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Cards — always stacked on mobile, 3-col on md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CATEGORIES.map((cat, i) => {
            const count = i === 0 ? counts.IT : i === 1 ? counts.NonIT : counts.Gov;
            const colorMap = {
              emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-600', hover: 'hover:border-emerald-400 hover:shadow-emerald-100' },
              blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    icon: 'bg-blue-100 text-blue-600',    badge: 'bg-blue-600',    hover: 'hover:border-blue-400 hover:shadow-blue-100' },
              amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   icon: 'bg-amber-100 text-amber-600',  badge: 'bg-amber-500',   hover: 'hover:border-amber-400 hover:shadow-amber-100' },
            }[cat.color];

            return (
              <Link
                key={cat.id}
                to="/interview-prep"
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
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:gap-8 py-4 border-t border-slate-200">
            {[
              { icon: FileText, label: 'Articles', val: counts.total, color: 'text-emerald-600' },
              { icon: HelpCircle, label: 'Q&As', val: counts.total, color: 'text-blue-600' },
              { icon: BookOpen, label: 'Resources', val: counts.total, color: 'text-amber-600' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-500">
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