import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap, Building2, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJobs } from '../../context/JobsContext';

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80"
];

const Hero = () => {
  const navigate = useNavigate();
  const { heroImages } = useJobs();
  const [query, setQuery] = useState('');
  const [currentImg, setCurrentImg] = useState(0);

  const images = (heroImages && heroImages.length >= 5) ? heroImages : DEFAULT_IMAGES;

  useEffect(() => {
    const img = new Image();
    img.src = images[(currentImg + 1) % images.length];

    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentImg, images]);

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/jobs?company=${encodeURIComponent(query.trim())}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
  };

  return (
    <section className="relative bg-slate-900 border-b border-slate-800 pt-16 pb-12 md:pt-24 md:pb-20 overflow-hidden min-h-[70vh] md:min-h-[85vh] flex items-center">

      {/* Background Image Carousel */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-900">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentImg}
            src={images[currentImg]}
            initial={{ opacity: currentImg === 0 ? 0.6 : 0, scale: 1.05 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-full h-full object-cover absolute inset-0"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-slate-900/70" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-5xl mx-auto px-4 text-center"
      >
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-8">
          <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-bold border border-emerald-500/30 backdrop-blur-md shadow-sm">
            <GraduationCap size={14} className="md:w-4 md:h-4" /> Freshers
          </span>
          <span className="flex items-center gap-1.5 bg-slate-500/30 text-slate-200 px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-bold border border-slate-500/40 backdrop-blur-md shadow-sm">
            <Building2 size={14} className="md:w-4 md:h-4" /> Govt Jobs
          </span>
          <span className="flex items-center gap-1.5 bg-teal-500/20 text-teal-300 px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-bold border border-teal-500/30 backdrop-blur-md shadow-sm">
            <Briefcase size={14} className="md:w-4 md:h-4" /> Private
          </span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-4xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-4 md:mb-6 drop-shadow-lg">
          Find Your Next Job. <br className="hidden md:block" />
          <span className="text-emerald-400 drop-shadow-md whitespace-nowrap md:whitespace-normal">Zero Fees. Zero Friction.</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-base md:text-xl text-slate-200 max-w-2xl mx-auto mb-8 md:mb-10 font-medium drop-shadow-md px-2">
          A 100% free platform. No login required. Browse verified opportunities across all sectors and apply instantly.
        </motion.p>

        <motion.div variants={itemVariants} className="max-w-2xl mx-auto flex bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl focus-within:ring-4 focus-within:ring-emerald-500/40 focus-within:border-emerald-400 transition-all mb-8 md:mb-12">
          <div className="flex items-center pl-4 md:pl-6">
            <Search size={20} className="text-emerald-400 md:w-6 md:h-6" />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Job title, skills, or company..."
            className="flex-1 px-3 md:px-4 py-4 md:py-5 text-base md:text-lg outline-none text-white placeholder-slate-300 font-medium bg-transparent"
          />
          <button
            onClick={handleSearch}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 md:px-10 font-bold transition-colors shadow-lg flex items-center justify-center shrink-0"
          >
            <span className="hidden sm:inline">Search</span>
            <Search size={20} className="sm:hidden" />
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-center gap-4 md:gap-6 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/jobs')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-xl shadow-emerald-600/40 transition-colors border border-emerald-500"
          >
            Apply Now
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/jobs')}
            className="bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 text-white border border-slate-600 px-8 md:px-10 py-3.5 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg transition-colors"
          >
            Browse Jobs
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;