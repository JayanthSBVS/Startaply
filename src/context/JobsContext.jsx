import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const JobsContext = createContext();

export const useJobs = () => useContext(JobsContext);

// Works both locally (Vite proxy) and on Vercel (relative /api)
const API = '/api';

export const JobsProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [jobsRes, compRes] = await Promise.all([
          axios.get(`${API}/jobs`).catch(() => ({ data: [] })),
          axios.get(`${API}/companies`).catch(() => ({ data: [] }))
        ]);
        setJobs(jobsRes.data);
        setCompanies(compRes.data);
      } catch (err) {
        console.error("Public API Fetch Error:", err);
      }
    };
    fetchPublicData();
  }, []);

  return (
    <JobsContext.Provider value={{ jobs, companies }}>
      {children}
    </JobsContext.Provider>
  );
};