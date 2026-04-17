import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const JobsContext = createContext();

export const useJobs = () => useContext(JobsContext);

// Works both locally (Vite proxy) and on Vercel (relative /api)
const API = '/api';

export const JobsProvider = ({ children }) => {
  const [jobs, setJobs] = useState(() => JSON.parse(localStorage.getItem('cache_jobs') || '[]'));
  const [companies, setCompanies] = useState(() => JSON.parse(localStorage.getItem('cache_companies') || '[]'));
  const [heroImages, setHeroImages] = useState([]);
  const [melas, setMelas] = useState(() => JSON.parse(localStorage.getItem('cache_melas') || '[]'));
  const [prepData, setPrepData] = useState(() => JSON.parse(localStorage.getItem('cache_prep') || '[]'));

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [jobsRes, compRes, melasRes, prepRes] = await Promise.all([
          axios.get(`${API}/jobs`).catch(() => ({ data: [] })),
          axios.get(`${API}/companies`).catch(() => ({ data: [] })),
          axios.get(`${API}/job-mela`).catch(() => ({ data: [] })),
          axios.get(`${API}/prep-data`).catch(() => ({ data: [] }))
        ]);

        const finalJobs = Array.isArray(jobsRes.data) ? jobsRes.data : [];
        const finalComps = Array.isArray(compRes.data) ? compRes.data : [];
        const finalMelas = Array.isArray(melasRes.data) ? melasRes.data : [];
        const finalPrep = Array.isArray(prepRes.data) ? prepRes.data : [];

        setJobs(finalJobs);
        setCompanies(finalComps);
        setMelas(finalMelas);
        setPrepData(finalPrep);

        try {
          localStorage.setItem('cache_jobs', JSON.stringify(finalJobs));
          localStorage.setItem('cache_companies', JSON.stringify(finalComps));
          localStorage.setItem('cache_melas', JSON.stringify(finalMelas));
          localStorage.setItem('cache_prep', JSON.stringify(finalPrep));
          localStorage.removeItem('cache_hero'); // Explicitly clear any old heavy cache
        } catch (e) {
          console.warn("Storage quota reached", e);
        }
      } catch (err) {
        console.error("Public API Fetch Error:", err);
      }
    };

    const fetchHeroBanners = async () => {
      try {
        const res = await axios.get(`${API}/hero-banners`).catch(() => ({ data: [] }));
        const banners = Array.isArray(res.data) ? res.data.map(b => b.image) : [];
        setHeroImages(banners);
      } catch (err) {
        console.error("Hero Banner Fetch Error:", err);
      }
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