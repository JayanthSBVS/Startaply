const { Pool } = require('pg');

// ── Fail fast if JWT_SECRET is missing (prevents silent insecure fallback) ──
if (!process.env.JWT_SECRET) {
  console.warn('[SECURITY WARNING] JWT_SECRET env var is not set. Using insecure fallback. Set JWT_SECRET in Vercel environment variables immediately.');
}

// ── Database Pool ────────────────────────────────────────────────────────────
let globalPool = null;

const getPool = () => {
  if (!globalPool) {
    globalPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,                    // Keep low for Vercel serverless
      min: 1,                    // Keep one connection warm to reduce cold-start latency
      idleTimeoutMillis: 30000,  // Release idle connections after 30s
      connectionTimeoutMillis: 10000, // Don't hang forever if DB is unreachable
    });

    globalPool.on('error', (err) => {
      console.error('[DB Pool Error]', err.message);
    });
  }
  return globalPool;
};

// ── LRU-capped in-memory cache ───────────────────────────────────────────────
// Prevents unbounded memory growth in long-lived Vercel instances.
const MAX_CACHE_SIZE = 200;
const memoryCache    = new Map(); // Map preserves insertion order for LRU

function getMemCache(key, maxAgeSeconds) {
  const item = memoryCache.get(key);
  if (!item) return null;
  const ageSec = (Date.now() - item.ts) / 1000;
  if (ageSec < maxAgeSeconds) return item.data;
  memoryCache.delete(key); // Expired — clean up
  return null;
}

function setMemCache(key, data) {
  // LRU eviction: remove oldest entry if at capacity
  if (memoryCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = memoryCache.keys().next().value;
    memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, { data, ts: Date.now() });
}

function clearMemCachePrefix(prefix) {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) memoryCache.delete(key);
  }
}

const setEdgeCache = (res, sMaxAge = 60, stale = 300) => {
  res.setHeader('Cache-Control', `public, s-maxage=${sMaxAge}, stale-while-revalidate=${stale}`);
};

module.exports = {
  getPool,
  getMemCache,
  setMemCache,
  clearMemCachePrefix,
  setEdgeCache,
};
