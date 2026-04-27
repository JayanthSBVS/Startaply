import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const JobsContext = createContext();

export const useJobs = () => useContext(JobsContext);

// Works both locally (Vite proxy) and on Vercel (relative /api)
const API = '/api';

// ── Cache helpers ────────────────────────────────────────────────────────────
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes stale threshold

function readCache(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { data: fallback, stale: true };
    const parsed = JSON.parse(raw);
    // Support both plain arrays (legacy) and stamped objects
    if (Array.isArray(parsed)) return { data: parsed, stale: true }; // legacy – treat as stale
    const stale = !parsed.ts || (Date.now() - parsed.ts) > CACHE_TTL_MS;
    return { data: Array.isArray(parsed.data) ? parsed.data : fallback, stale };
  } catch {
    return { data: fallback, stale: true };
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // Storage quota exceeded — try sessionStorage
    try { sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch { /* silent */ }
  }
}

function readHeroCache() {
  try {
    const raw = localStorage.getItem('cache_hero_data') || sessionStorage.getItem('cache_hero_data');
    if (!raw) return { images: [], stale: true };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Legacy format: array of banner objects
      return { images: parsed.map(c => c.image).filter(Boolean), stale: true };
    }
    const stale = !parsed.ts || (Date.now() - parsed.ts) > CACHE_TTL_MS;
    return { images: Array.isArray(parsed.images) ? parsed.images : [], stale };
  } catch {
    return { images: [], stale: true };
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────
export const JobsProvider = ({ children }) => {
  const jobsCache     = readCache('cache_jobs');
  const companiesCache = readCache('cache_companies');
  const melasCache    = readCache('cache_melas');
  const prepCache     = readCache('cache_prep');
  const heroCache     = readHeroCache();

  const [jobs,       setJobs]       = useState(jobsCache.data);
  const [companies,  setCompanies]  = useState(companiesCache.data);
  const [heroImages, setHeroImages] = useState(heroCache.images);
  const [melas,      setMelas]      = useState(melasCache.data);
  const [prepData,   setPrepData]   = useState(prepCache.data);

  // Expose loading so components can show skeletons
  const [loading, setLoading] = useState(
    jobsCache.stale || companiesCache.stale || melasCache.stale
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    // Skip full refetch if everything is fresh
    const allFresh =
      !jobsCache.stale && !companiesCache.stale &&
      !melasCache.stale && !prepCache.stale && !heroCache.stale;

    if (allFresh) {
      setLoading(false);
      return;
    }

    const fetchPublicData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch core data in parallel — use limit=100 to cap data volume
        const [jobsRes, compRes, melasRes, prepRes] = await Promise.all([
          axios.get(`${API}/jobs?limit=100`).catch(err => ({ error: true, err })),
          axios.get(`${API}/companies?limit=50`).catch(err => ({ error: true, err })),
          axios.get(`${API}/job-mela`).catch(err => ({ error: true, err })),
          axios.get(`${API}/prep-data`).catch(err => ({ error: true, err })),
        ]);

        if (!jobsRes.error) {
          const finalJobs = Array.isArray(jobsRes.data) ? jobsRes.data : [];
          setJobs(finalJobs);
          writeCache('cache_jobs', finalJobs);
        }

        if (!compRes.error) {
          const finalComps = Array.isArray(compRes.data) ? compRes.data : [];
          setCompanies(finalComps);
          writeCache('cache_companies', finalComps);
        }

        if (!melasRes.error) {
          const finalMelas = Array.isArray(melasRes.data) ? melasRes.data : [];
          setMelas(finalMelas);
          writeCache('cache_melas', finalMelas);
        }

        if (!prepRes.error) {
          const finalPrep = Array.isArray(prepRes.data) ? prepRes.data : [];
          setPrepData(finalPrep);
          writeCache('cache_prep', finalPrep);
        }

      } catch (err) {
        console.error('Public API Error:', err);
        setError('Failed to load data. Showing cached results.');
      } finally {
        setLoading(false);
      }
    };

    const fetchHeroBanners = async () => {
      try {
        const res = await axios.get(`${API}/hero-banners`).catch(err => ({ error: true, err }));
        if (res.error) return;
        const banners = Array.isArray(res.data) ? res.data : [];
        const imagesOnly = banners.map(b => b.image).filter(Boolean);
        setHeroImages(imagesOnly);

        // Store with TTL stamp — cap at first 3 to stay within localStorage limits
        const toStore = { images: imagesOnly.slice(0, 3), ts: Date.now() };
        try {
          localStorage.setItem('cache_hero_data', JSON.stringify(toStore));
        } catch {
          try { sessionStorage.setItem('cache_hero_data', JSON.stringify({ images: imagesOnly.slice(0, 1), ts: Date.now() })); } catch { /* silent */ }
        }
      } catch (err) {
        console.error('Hero Fetch Error:', err);
      }
    };

    fetchPublicData();
    fetchHeroBanners();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addFeedback = async (form) => {
    try {
      await axios.post(`${API}/feedback`, form);
    } catch (err) {
      console.error('Feedback Submission Error:', err);
      throw err;
    }
  };

  return (
    <JobsContext.Provider value={{
      jobs, companies, heroImages, melas, prepData,
      loading, error,
      addFeedback,
    }}>
      {children}
    </JobsContext.Provider>
  );
};