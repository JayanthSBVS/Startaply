import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, User, Phone, MapPin, Linkedin, Briefcase, 
  GraduationCap, Monitor, Zap, Check, 
  Save, Loader2, SlidersHorizontal, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getCandidateProfile } from '../../utils/candidatePersonalization';
import toast from 'react-hot-toast';

const SUB_TRACK_PRESETS = {
  it_fresher: [
    'IT Fresher / Entry Tech',
    'Frontend / React Trainee',
    'Backend & API Intern (Node/Python)',
    'QA & Automation Testing Fresher',
    'Data Analytics / AI Graduate'
  ],
  it_experienced: [
    'IT Experienced Corporate',
    'Senior Frontend / Full Stack Engineer',
    'Backend & Cloud Architect (AWS/GCP)',
    'DevOps & Infrastructure Lead',
    'Mobile Application Engineer (React Native/Flutter)'
  ],
  nonit_fresher: [
    'Non-IT Fresher / Graduate Trainee',
    'HR & Talent Acquisition Trainee',
    'Sales & Business Development Entry',
    'Customer Experience & Support Trainee'
  ],
  nonit_experienced: [
    'Operations & Supply Chain Lead',
    'HR Specialist & Corporate Recruiter',
    'Corporate Sales & Account Executive',
    'Banking, Finance & Operations Specialist'
  ],
  gig: [
    'Contract UI/UX Product Designer',
    'Freelance Copywriter & Content Creator',
    'AI Data Evaluation & Prompt Specialist',
    'Independent Tech Consultant'
  ],
  others: [
    'General Career Trainee',
    'Creative & Media Specialist',
    'Healthcare & Logistics Associate'
  ]
};

const CITIES = ['Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi-NCR', 'Chennai', 'Remote'];

const ProfilePreferencesModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const candidateProfile = getCandidateProfile(user);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [careerTrack, setCareerTrack] = useState('it');
  const [level, setLevel] = useState('fresher');
  const [subTrack, setSubTrack] = useState('');
  const [skills, setSkills] = useState('');
  const [workMode, setWorkMode] = useState('All');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setCity(user.city || 'Bengaluru');
      setLinkedinUrl(user.linkedinUrl || user.linkedin_url || '');

      const track = (user.careerTrack || user.career_track || 'it').toLowerCase();
      setCareerTrack(track === 'nonit' ? 'non-it' : track);

      let prefs = {};
      if (user.preferences) {
        if (typeof user.preferences === 'object') prefs = user.preferences;
        else if (typeof user.preferences === 'string') {
          try { prefs = JSON.parse(user.preferences); } catch {}
        }
      }

      const userSub = user.subTrack || user.sub_track || '';
      const userLevel = prefs.level || (userSub.toLowerCase().includes('fresher') ? 'fresher' : (userSub.toLowerCase().includes('experienced') ? 'experienced' : 'fresher'));
      setLevel(userLevel);
      setSubTrack(userSub);
      setSkills(typeof user.skills === 'string' ? user.skills : Array.isArray(user.skills) ? user.skills.join(', ') : '');
      setWorkMode(prefs.workMode || 'All');
    }
  }, [user, isOpen]);

  // Adjust subTrack default if track/level changes
  const handleTrackChange = (newTrack) => {
    setCareerTrack(newTrack);
    const key = newTrack === 'gig' ? 'gig' : newTrack === 'others' ? 'others' : `${newTrack === 'non-it' ? 'nonit' : 'it'}_${level}`;
    const presets = SUB_TRACK_PRESETS[key] || [];
    if (presets.length > 0) {
      setSubTrack(presets[0]);
    }
  };

  const handleLevelChange = (newLevel) => {
    setLevel(newLevel);
    const key = careerTrack === 'gig' ? 'gig' : careerTrack === 'others' ? 'others' : `${careerTrack === 'non-it' ? 'nonit' : 'it'}_${newLevel}`;
    const presets = SUB_TRACK_PRESETS[key] || [];
    if (presets.length > 0) {
      setSubTrack(presets[0]);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        linkedin_url: linkedinUrl.trim(),
        careerTrack,
        subTrack: subTrack.trim(),
        skills: skills.trim(),
        preferences: {
          category: careerTrack === 'it' ? 'IT / Tech' : careerTrack === 'non-it' ? 'Non-IT' : careerTrack === 'gig' ? 'Gig Works' : 'Others',
          level: careerTrack === 'gig' ? 'flexible' : level,
          workMode
        }
      };

      const result = await updateProfile(payload);
      if (result.success) {
        toast.success('Preferences updated! Your personalized job feed is now active.', {
          icon: '🎯',
          duration: 3500
        });
        onClose();
      } else {
        toast.error(result.error || 'Failed to update preferences');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentPresetKey = careerTrack === 'gig' ? 'gig' : careerTrack === 'others' ? 'others' : `${careerTrack === 'non-it' ? 'nonit' : 'it'}_${level}`;
  const currentPresets = SUB_TRACK_PRESETS[currentPresetKey] || [];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          {/* Deep Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !isSaving && onClose()}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] z-10 overflow-hidden"
          >
            {/* ── Fixed Header ── */}
            <div className="px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-slate-50/80 dark:bg-neutral-900/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Career Profile & Job Preferences
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Customize your profile to instantly calibrate matching jobs platform-wide.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isSaving}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Scrollable Form Body ── */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 overscroll-contain">

              {/* ── 1. PRIMARY CAREER TRACK ── */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2.5">
                  1. Primary Career Track
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'it', label: 'IT & Software', icon: Monitor, desc: 'Frontend, Backend & Cloud' },
                    { id: 'non-it', label: 'Non-IT & Ops', icon: Briefcase, desc: 'Operations, HR & Sales' },
                    { id: 'gig', label: 'Gig & Freelance', icon: Zap, desc: 'Design, Writing & Contracts' },
                    { id: 'others', label: 'Multi-Sector', icon: Layers, desc: 'Cross-industry roles' }
                  ].map(t => {
                    const Icon = t.icon;
                    const selected = careerTrack === t.id;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => handleTrackChange(t.id)}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 min-h-[84px] active:scale-95 ${
                          selected
                            ? 'bg-brand text-white border-transparent shadow-md shadow-brand/20 ring-2 ring-brand/30'
                            : 'bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <Icon size={16} />
                          {selected && <Check size={14} className="stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight mt-1.5">{t.label}</div>
                          <div className={`text-[10px] mt-0.5 line-clamp-1 ${selected ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                            {t.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── 2. EXPERIENCE LEVEL (IF NOT GIG) ── */}
              {careerTrack !== 'gig' && (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2.5">
                    2. Experience Level
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleLevelChange('fresher')}
                      className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        level === 'fresher'
                          ? 'bg-brand/10 border-brand text-brand dark:text-brand-hover shadow-xs'
                          : 'bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <GraduationCap size={18} />
                        <div>
                          <div className="text-xs font-bold">Fresher / Graduate Trainee</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">0 - 1 years experience</div>
                        </div>
                      </div>
                      {level === 'fresher' && <Check size={16} className="text-brand stroke-[3]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLevelChange('experienced')}
                      className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        level === 'experienced'
                          ? 'bg-brand/10 border-brand text-brand dark:text-brand-hover shadow-xs'
                          : 'bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Briefcase size={18} />
                        <div>
                          <div className="text-xs font-bold">Experienced Professional</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">1+ years industry experience</div>
                        </div>
                      </div>
                      {level === 'experienced' && <Check size={16} className="text-brand stroke-[3]" />}
                    </button>
                  </div>
                </div>
              )}

              {/* ── 3. SUB-TRACK / SPECIALIZATION ── */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  3. Role Specialization
                </label>
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {currentPresets.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setSubTrack(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        subTrack === preset
                          ? 'bg-brand text-white border-brand shadow-xs'
                          : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700 hover:border-slate-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={subTrack}
                  onChange={(e) => setSubTrack(e.target.value)}
                  placeholder="Or enter custom role (e.g. Senior React Engineer, HR Recruiter)"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand"
                />
              </div>

              {/* ── 4. PERSONAL & CONTACT DETAILS ── */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2.5">
                  4. Candidate Details
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <User size={13} className="text-slate-400" /> Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Candidate Name"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-400" /> Target Location / City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bengaluru, Remote"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {CITIES.map(c => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setCity(c)}
                          className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium transition-colors ${
                            city === c
                              ? 'bg-brand/10 text-brand border-brand/30 font-bold'
                              : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Linkedin size={13} className="text-blue-500" /> LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>

              {/* ── 5. SKILLS & WORK MODE ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Skills / Tech Stack
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. React, Node.js, SQL, Tailwind"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Work Arrangement
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['All', 'Remote', 'On-site', 'Hybrid'].map(m => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setWorkMode(m)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all text-center ${
                          workMode === m
                            ? 'bg-brand text-white border-brand shadow-xs'
                            : 'bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-neutral-700 hover:border-slate-300'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </form>

            {/* ── Fixed Footer ── */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/80 dark:bg-neutral-900/80 backdrop-blur-md flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover active:scale-95 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-brand/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} /> Save & Update Feed
                  </>
                )}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ProfilePreferencesModal;
