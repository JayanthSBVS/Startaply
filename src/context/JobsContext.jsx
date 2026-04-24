import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const JobsContext = createContext();

export const useJobs = () => useContext(JobsContext);

// Works both locally (Vite proxy) and on Vercel (relative /api)
const API = '/api';

export const JobsProvider = ({ children }) => {
  const [jobs, setJobs] = useState(() => JSON.parse(localStorage.getItem('cache_jobs') || '[]'));
  const [companies, setCompanies] = useState(() => JSON.parse(localStorage.getItem('cache_companies') || '[]'));
  const [heroImages, setHeroImages] = useState(() => {
    // Initial load from cache for instant appearance
    try {
      const cached = JSON.parse(localStorage.getItem('cache_hero_data') || '[]');
      return cached.map(c => c.image);
    } catch (e) { return []; }
  });

  const [melas, setMelas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cache_melas') || '[]'); } catch (e) { return []; }
  });
  const [prepData, setPrepData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cache_prep') || '[]'); } catch (e) { return []; }
  });

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [jobsRes, compRes, melasRes, prepRes] = await Promise.all([
          axios.get(`${API}/jobs`).catch(err => ({ error: true, err })),
          axios.get(`${API}/companies`).catch(err => ({ error: true, err })),
          axios.get(`${API}/job-mela`).catch(err => ({ error: true, err })),
          axios.get(`${API}/prep-data`).catch(err => ({ error: true, err }))
        ]);

        if (!jobsRes.error) {
          const finalJobs = Array.isArray(jobsRes.data) ? jobsRes.data : [];
          setJobs(finalJobs);
          localStorage.setItem('cache_jobs', JSON.stringify(finalJobs));
        }
        
        if (!compRes.error) {
          const finalComps = Array.isArray(compRes.data) ? compRes.data : [];
          setCompanies(finalComps);
          localStorage.setItem('cache_companies', JSON.stringify(finalComps));
        }

        if (!melasRes.error) {
          const finalMelas = Array.isArray(melasRes.data) ? melasRes.data : [];
          setMelas(finalMelas);
          localStorage.setItem('cache_melas', JSON.stringify(finalMelas));
        }

        if (!prepRes.error) {
          const finalPrep = Array.isArray(prepRes.data) ? prepRes.data : [];
          setPrepData(finalPrep);
          localStorage.setItem('cache_prep', JSON.stringify(finalPrep));
        }

      } catch (err) { console.error("Public API Error:", err); }
    };

    const fetchHeroBanners = async () => {
      try {
        const res = await axios.get(`${API}/hero-banners`).catch(err => ({ error: true, err }));
        if (res.error) return; // Do not overwrite state if error
        const banners = Array.isArray(res.data) ? res.data : [];
        
        // SYNC & CLEANUP CACHE
        // We only cache the first 3 for performance
        const firstThree = banners.slice(0, 3);
        const imagesOnly = banners.map(b => b.image);
        setHeroImages(imagesOnly);

        try {
          // Store first 3 to localStorage for next visit speed
          localStorage.setItem('cache_hero_data', JSON.stringify(firstThree));
        } catch (e) {
          // If 3 is too much for localStorage, just store the first 1
          try { localStorage.setItem('cache_hero_data', JSON.stringify(firstThree.slice(0, 1))); } catch(e2) {}
        }
      } catch (err) { console.error("Hero Fetch Error:", err); }
    };

    fetchPublicData();
    fetchHeroBanners();
  }, []);

  const addFeedback = async (form) => {
    try {
      await axios.post(`${API}/feedback`, form);
    } catch (err) {
      console.error("Feedback Submission Error:", err);
      throw err;
    }
  };

  return (
    <JobsContext.Provider value={{ jobs, companies, heroImages, melas, prepData, addFeedback }}>
      {children}
    </JobsContext.Provider>
  );
};