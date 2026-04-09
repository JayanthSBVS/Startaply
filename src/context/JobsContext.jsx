import React, { createContext, useContext, useState, useEffect } from 'react';
import { jobsData as seedData, qnaData } from '../data/jobsData';
import { parsePostedTime } from '../utils/timeAgo';

const JobsContext = createContext(null);

// Helper: compute expiry date string from expiryDays
function computeExpiryDate(expiryDays) {
  const d = new Date();
  d.setDate(d.getDate() + parseInt(expiryDays, 10));
  return d.toISOString();
}

// Helper: check if job is still active (not expired)
function isJobActive(job) {
  if (!job.expiryDate) return true;
  return new Date(job.expiryDate) > new Date();
}

export const JobsProvider = ({ children }) => {
  const [jobs, setJobs] = useState(() => {
    try {
      const stored = localStorage.getItem('strataply_jobs');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse jobs from localStorage', e);
    }
    // Seed with data from jobsData.js, computing expiryDate for any that lack it
    return seedData.map((job) => ({
      ...job,
      createdAt: parsePostedTime(job.postedTime),
      expiryDate: job.expiryDate || computeExpiryDate(job.expiryDays || 30),
    }));
  });

  // Sync to local storage on change
  useEffect(() => {
    localStorage.setItem('strataply_jobs', JSON.stringify(jobs));
  }, [jobs]);

  // Auto-remove expired jobs every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs((prev) => prev.filter(isJobActive));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Active jobs (non-expired)
  const activeJobs = jobs.filter(isJobActive);

  const addJob = (formData) => {
    const newJob = {
      ...formData,
      id: Date.now(),
      createdAt: Date.now(),
      postedTime: 'Just now',
      expiryDate: computeExpiryDate(formData.expiryDays || 30),
      featured: false,
      hot: false,
      tags: formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      requiredSkills: formData.requiredSkills
        ? formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      techStack: formData.techStack
        ? formData.techStack.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      benefits: formData.benefits
        ? formData.benefits.split(',').map((b) => b.trim()).filter(Boolean)
        : [],
    };
    setJobs((prev) => [newJob, ...prev]);
    return newJob;
  };

  const deleteJob = (id) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const updateJob = (id, updatedData) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? {
              ...j,
              ...updatedData,
              expiryDate: updatedData.expiryDays
                ? computeExpiryDate(updatedData.expiryDays)
                : j.expiryDate,
            }
          : j
      )
    );
  };

  // Q&A state
  const [qnas, setQnas] = useState(() => {
    return qnaData || [];
  });

  const addQna = (qna) => {
    setQnas((prev) => [{ ...qna, id: Date.now() }, ...prev]);
  };

  const deleteQna = (id) => {
    setQnas((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQna = (id, updated) => {
    setQnas((prev) => prev.map((q) => (q.id === id ? { ...q, ...updated } : q)));
  };

  return (
    <JobsContext.Provider value={{
      jobs: activeJobs, allJobs: jobs, addJob, deleteJob, updateJob,
      qnas, addQna, deleteQna, updateQna
    }}>
      {children}
    </JobsContext.Provider>
  );
};

export const useJobs = () => {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error('useJobs must be used within a JobsProvider');
  return ctx;
};

export default JobsContext;
