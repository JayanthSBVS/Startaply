const { Pool } = require('pg');

let globalPool = null;

const getPool = () => {
  if (!globalPool) {
    globalPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5, // Keep connection count strictly low for Vercel
      idleTimeoutMillis: 30000,
    });
  }
  return globalPool;
};

// Extremely lightweight memory cache for Vercel lambdas
const memoryCache = {};

function getMemCache(key, maxAgeSeconds) {
  const item = memoryCache[key];
  if (!item) return null;
  const ageSec = (Date.now() - item.ts) / 1000;
  if (ageSec < maxAgeSeconds) return item.data;
  return null;
}

function setMemCache(key, data) {
  memoryCache[key] = {
    data,
    ts: Date.now()
  };
}

function clearMemCachePrefix(prefix) {
  Object.keys(memoryCache).forEach(k => {
    if (k.startsWith(prefix)) {
      delete memoryCache[k];
    }
  });
}

const setEdgeCache = (res, sMaxAge = 60, stale = 300) => {
  res.setHeader('Cache-Control', `public, s-maxage=${sMaxAge}, stale-while-revalidate=${stale}`);
};

module.exports = {
  getPool,
  getMemCache,
  setMemCache,
  clearMemCachePrefix,
  setEdgeCache
};
