import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const JobsContext = createContext();

export const useJobs = () => useContext(JobsContext);

// Works both locally (Vite proxy) and on Vercel (relative /api)
const API = '/api';

export const JobsProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [qnas, setQnas] = useState([]);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [jobsRes, compRes, qnaRes] = await Promise.all([
          axios.get(`${API}/jobs`).catch(() => ({ data: [] })),
          axios.get(`${API}/companies`).catch(() => ({ data: [] })),
          axios.get(`${API}/qna`).catch(() => ({ data: [] }))
        ]);
        setJobs(jobsRes.data);
        setCompanies(compRes.data);
        setQnas(qnaRes.data);
      } catch (err) {
        console.error("Public API Fetch Error:", err);
      }
    };
    fetchPublicData();
  }, []);

  return (
    <JobsContext.Provider value={{ jobs, companies, qnas }}>
      {children}
    </JobsContext.Provider>
  );
};