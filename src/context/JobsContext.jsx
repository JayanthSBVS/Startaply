import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { subscribeToFreshness } from '../utils/dataFreshness';

const JobsContext = createContext();

export const useJobs = () => useContext(JobsContext);

// Works both locally (Vite proxy) and on Vercel (relative /api)
const API = '/api';

// ── Cache helpers ────────────────────────────────────────────────────────────
// IMPORTANT: We use a SHORT TTL (30s) so that admin changes to isFeatured/isToday
// reflect quickly on the public site after a page refresh.
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

function readCache(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { data: fallback, stale: true };
    const parsed = JSON.parse(raw);
    // Support both plain arrays (legacy) and stamped objects
    if (Array.isArray(parsed)) return { data: parsed, stale: true }; // legacy - treat as stale
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
    // Storage quota exceeded - try sessionStorage
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
  const companiesCache = readCache('cache_companies');
  const melasCache    = readCache('cache_melas');
  const prepCache     = readCache('cache_prep');
  const heroCache     = readHeroCache();

  // Freshness-critical Jobs State
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);
  const [isRefreshingJobs, setIsRefreshingJobs] = useState(false);
  const [jobsLastUpdated, setJobsLastUpdated] = useState(0);


  // Other Domain State (Legacy Cache)
  const [companies,  setCompanies]  = useState(companiesCache.data);
  const [heroImages, setHeroImages] = useState(heroCache.images);
  const [melas,      setMelas]      = useState(melasCache.data);
  const [prepData,   setPrepData]   = useState(prepCache.data);

  // Expose loading so components can show skeletons (Legacy for non-jobs)
  const [otherLoading, setOtherLoading] = useState(
    companiesCache.stale || melasCache.stale
  );
  const [otherError, setOtherError] = useState(null);
  // Refs for request concurrency and deduplication
  const requestSequenceRef = useRef(0);
  const abortControllerRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // ── JOBS FRESHNESS ──────────────────────────────────────────────────────────
  const refreshJobs = useCallback(async (isBackground = false) => {
    // Cancel any previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Increment sequence exactly once for the new request
    const currentSequence = ++requestSequenceRef.current;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (!isBackground && isInitialLoadRef.current) {
        setJobsLoading(true);
      }
      setIsRefreshingJobs(true);

      const res = await axios.get(`${API}/jobs?limit=100`, {
        signal: controller.signal
      });

      // Only apply if this is still the active request and not aborted
      if (!controller.signal.aborted && requestSequenceRef.current === currentSequence) {
        const finalJobs = Array.isArray(res.data) ? res.data : [];
        setJobs(finalJobs);
        setJobsError(null);
        setJobsLastUpdated(Date.now());
        isInitialLoadRef.current = false;
      }
    } catch (err) {
      if (!axios.isCancel(err) && !controller.signal.aborted && requestSequenceRef.current === currentSequence) {
        console.error('Jobs API Error:', err);
        setJobsError('Failed to load jobs. Check network connection.');
      }
    } finally {
      if (requestSequenceRef.current === currentSequence) {
        setJobsLoading(false);
        setIsRefreshingJobs(false);
        abortControllerRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    // 1. One-time cleanup of legacy jobs payload cache
    try {
      localStorage.removeItem('cache_jobs');
      sessionStorage.removeItem('cache_jobs');
    } catch (e) {}

    // 2. Initial fetch for Jobs
    refreshJobs(false);

    // 3. Listen for cross-tab mutations
    const unsubscribe = subscribeToFreshness('jobs', () => {
      refreshJobs(true); // background refresh
    });

    // 4. Listen for reconnect and focus
    const handleFocus = () => refreshJobs(true);
    const handleOnline = () => refreshJobs(true);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      if (abortControllerRef.current) {
        requestSequenceRef.current++;
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [refreshJobs]);

  // ── NON-JOBS FRESHNESS FETCH ──────────────────────────────────────────────
  const fetchPublicData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setOtherLoading(true);
      setOtherError(null);
      const t = Date.now();

      const [compRes, melasRes, prepRes] = await Promise.all([
        axios.get(`${API}/companies?limit=100&_t=${t}`).catch(err => ({ error: true, err })),
        axios.get(`${API}/job-mela?_t=${t}`).catch(err => ({ error: true, err })),
        axios.get(`${API}/prep-data?_t=${t}`).catch(err => ({ error: true, err })),
      ]);

      if (!compRes.error) {
        const finalComps = Array.isArray(compRes.data) ? compRes.data : [];
        setCompanies(finalComps);
      }

      if (!melasRes.error) {
        const finalMelas = Array.isArray(melasRes.data) ? melasRes.data : [];
        setMelas(finalMelas);
      }

      if (!prepRes.error) {
        const finalPrep = Array.isArray(prepRes.data) ? prepRes.data : [];
        setPrepData(finalPrep);
      }
    } catch (err) {
      console.error('Public API Error (Non-Jobs):', err);
      setOtherError('Failed to load data.');
    } finally {
      setOtherLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. One-time cleanup of legacy local storage caches
    try {
      localStorage.removeItem('cache_melas');
      localStorage.removeItem('cache_companies');
      localStorage.removeItem('cache_prep');
      sessionStorage.removeItem('cache_melas');
    } catch (e) {}

    // 2. Fetch fresh public data on mount
    fetchPublicData(false);

    // 3. Listen for freshness events on melas, companies, prep
    const unSubMela = subscribeToFreshness('mela', () => fetchPublicData(true));
    const unSubComp = subscribeToFreshness('companies', () => fetchPublicData(true));
    const unSubPrep = subscribeToFreshness('prep', () => fetchPublicData(true));

    const fetchHeroBanners = async () => {
      try {
        const res = await axios.get(`${API}/hero-banners?_t=${Date.now()}`).catch(err => ({ error: true, err }));
        if (res.error) return;
        const banners = Array.isArray(res.data) ? res.data : [];
        const imagesOnly = banners.map(b => b.image).filter(Boolean);
        setHeroImages(imagesOnly);
      } catch (err) {
        console.error('Hero Fetch Error:', err);
      }
    };

    fetchHeroBanners();

    return () => {
      unSubMela();
      unSubComp();
      unSubPrep();
    };
  }, [fetchPublicData]);

  const fetchCompanyById = async (id) => {
    try {
      const res = await axios.get(`${API}/companies/${id}`);
      return res.data;
    } catch (err) {
      console.error('Fetch Company Error:', err);
      throw err;
    }
  };

  const fetchJobsByCompanyId = async (id) => {
    try {
      const res = await axios.get(`${API}/companies/${id}/jobs`);
      return res.data;
    } catch (err) {
      console.error('Fetch Company Jobs Error:', err);
      throw err;
    }
  };

  const refreshPublicData = async () => {
    // Legacy full-page refresh for non-job data
    localStorage.removeItem('cache_companies');
    localStorage.removeItem('cache_melas');
    localStorage.removeItem('cache_prep');
    window.location.reload();
  };

  // Provide memoized value for identity stability
  const contextValue = useMemo(() => ({
    jobs, companies, heroImages, melas, prepData,
    loading: jobsLoading || otherLoading,
    error: jobsError || otherError,
    jobsLoading,
    jobsError,
    isRefreshingJobs,
    jobsLastUpdated,
    refreshJobs,
    fetchCompanyById,
    fetchJobsByCompanyId,
    refreshPublicData,
  }), [
    jobs, companies, heroImages, melas, prepData,
    jobsLoading, otherLoading, jobsError, otherError,
    isRefreshingJobs, jobsLastUpdated, refreshJobs
  ]);

  return (
    <JobsContext.Provider value={contextValue}>
      {children}
    </JobsContext.Provider>
  );
};
