import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { qnaData } from '../data/jobsData'; // Keeping Q&A data local for now
import { parsePostedTime } from '../utils/timeAgo';

const JobsContext = createContext(null);

function computeExpiryDate(expiryDays) {
  const d = new Date();
  d.setDate(d.getDate() + parseInt(expiryDays, 10));
  return d.toISOString();
}

function isJobActive(job) {
  if (!job.expiryDate) return true;
  return new Date(job.expiryDate) > new Date();
}

// Ensure api matches your local backend URL
const API_URL = 'http://localhost:5000/api/jobs';

export const JobsProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [qnas, setQnas] = useState(qnaData || []);
  const [companies, setCompanies] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(API_URL);
      const formattedJobs = data.map(job => ({
        ...job,
        expiryDate: computeExpiryDate(job.expiryDays || 30),
      }));
      setJobs(formattedJobs);
    } catch (err) {
      console.error('Failed to fetch jobs from backend', err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/companies');
      setCompanies(data);
    } catch (err) {
      console.error('Failed to fetch companies', err);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/feedback');
      setFeedbacks(data);
    } catch (err) {
      console.error('Failed to fetch feedback', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
    fetchFeedbacks();
  }, []);

  const activeJobs = jobs.filter(isJobActive);

  const addJob = async (formData) => {
    try {
      const newJobPayload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        requiredSkills: formData.requiredSkills
          ? formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean).join(', ')
          : formData.requiredSkills,
        techStack: formData.techStack
          ? formData.techStack.split(',').map((t) => t.trim()).filter(Boolean).join(', ')
          : formData.techStack,
        benefits: formData.benefits
          ? formData.benefits.split(',').map((b) => b.trim()).filter(Boolean).join(', ')
          : formData.benefits,
      };
      
      const { data } = await axios.post(API_URL, newJobPayload);
      const addedJob = {
        ...data,
        expiryDate: computeExpiryDate(data.expiryDays || 30)
      };
      setJobs((prev) => [addedJob, ...prev]);
      return addedJob;
    } catch (err) {
      console.error('Failed to add job', err);
      throw err;
    }
  };

  const deleteJob = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setJobs((prev) => prev.filter((j) => j.id !== String(id)));
    } catch (err) {
      console.error('Failed to delete job', err);
      throw err;
    }
  };

  const updateJob = async (id, updatedData) => {
    try {
      const { data } = await axios.put(`${API_URL}/${id}`, updatedData);
      setJobs((prev) =>
        prev.map((j) =>
          j.id === String(id)
            ? {
                ...j,
                ...data,
                expiryDate: data.expiryDays
                  ? computeExpiryDate(data.expiryDays)
                  : j.expiryDate,
              }
            : j
        )
      );
    } catch (err) {
      console.error('Failed to update job', err);
      throw err;
    }
  };

  // Keep local for Q&A unless they want it in DB
  const addQna = (qna) => {
    setQnas((prev) => [{ ...qna, id: Date.now() }, ...prev]);
  };

  const deleteQna = (id) => {
    setQnas((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQna = (id, updated) => {
    setQnas((prev) => prev.map((q) => (q.id === id ? { ...q, ...updated } : q)));
  };

  const addCompany = async (companyData) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/companies', companyData);
      setCompanies((prev) => [data, ...prev]);
    } catch (err) {
      console.error('Failed to add company', err);
    }
  };

  const deleteCompany = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/companies/${id}`);
      setCompanies((prev) => prev.filter((c) => c.id !== String(id)));
    } catch (err) {
      console.error('Failed to delete company', err);
    }
  };

  const addFeedback = async (formData) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/feedback', formData);
      setFeedbacks((prev) => [data, ...prev]);
    } catch (err) {
      console.error('Failed to submit feedback', err);
      throw err;
    }
  };

  const deleteFeedback = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/feedback/${id}`);
      setFeedbacks((prev) => prev.filter((f) => f.id !== String(id)));
    } catch (err) {
      console.error('Failed to delete feedback', err);
    }
  };

  const trackJobView = async (jobId) => {
    try {
      await axios.post(`${API_URL}/${jobId}/view`);
    } catch (err) {
      console.error('Failed to track job view', err);
    }
  };

  return (
    <JobsContext.Provider value={{
      jobs: activeJobs, allJobs: jobs, addJob, deleteJob, updateJob, trackJobView,
      qnas, addQna, deleteQna, updateQna,
      companies, addCompany, deleteCompany,
      feedbacks, addFeedback, deleteFeedback
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
