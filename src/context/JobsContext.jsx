import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const JobsContext = createContext();

export const useJobs = () => useContext(JobsContext);

export const JobsProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [qnas, setQnas] = useState([]);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [jobsRes, compRes, qnaRes] = await Promise.all([
          axios.get('http://localhost:5000/api/jobs').catch(() => ({ data: [] })),
          axios.get('http://localhost:5000/api/companies').catch(() => ({ data: [] })),
          axios.get('http://localhost:5000/api/qna').catch(() => ({ data: [] }))
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