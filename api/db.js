const { Pool } = require('pg');

// ── Fail fast if JWT_SECRET is missing ──
if (!process.env.JWT_SECRET) {
  console.warn('[SECURITY WARNING] JWT_SECRET env var is not set. Set JWT_SECRET in Vercel environment variables.');
}

// ── Database Pool ────────────────────────────────────────────────────────────
let globalPool = null;

const getPool = () => {
  if (!globalPool) {
    const connectionString = process.env.DATABASE_URL || 
                             process.env.POSTGRES_URL || 
                             process.env.POSTGRES_PRISMA_URL || 
                             process.env.POSTGRES_URL_NON_POOLING;

    if (!connectionString) {
      console.warn('[DB WARNING] No DATABASE_URL or POSTGRES_URL environment variable found.');
    }

    globalPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      min: 0,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    globalPool.on('error', (err) => {
      console.error('[DB Pool Error]', err.message);
    });
  }
  return globalPool;
};

// ── LRU-capped in-memory cache ───────────────────────────────────────────────
const MAX_CACHE_SIZE = 200;
const memoryCache    = new Map();

function getMemCache(key, maxAgeSeconds) {
  const item = memoryCache.get(key);
  if (!item) return null;
  const ageSec = (Date.now() - item.ts) / 1000;
  if (ageSec < maxAgeSeconds) return item.data;
  memoryCache.delete(key);
  return null;
}

function setMemCache(key, data) {
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

function dbHandler(req, res) {
  if (res && typeof res.status === 'function') {
    res.status(404).json({ error: 'DB helper module is not an API endpoint' });
  }
}
dbHandler.getPool = getPool;
dbHandler.getMemCache = getMemCache;
dbHandler.setMemCache = setMemCache;
dbHandler.clearMemCachePrefix = clearMemCachePrefix;
dbHandler.setEdgeCache = setEdgeCache;

module.exports = dbHandler;
