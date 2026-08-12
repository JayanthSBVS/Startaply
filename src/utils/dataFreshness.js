const CHANNEL_NAME = 'startaply_data_freshness_v2';
const FALLBACK_KEY = 'startaply_freshness_fallback_v2';

const VALID_DOMAINS = new Set(['jobs', 'mela', 'companies', 'prep', 'permissions']);
const VALID_MUTATIONS = new Set(['create', 'update', 'delete', 'feature', 'today', 'visibility', 'refresh']);
const MAX_AGE_MS = 10000;
const FUTURE_TOLERANCE_MS = 10000;

export const SENDER_ID = generateId();

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function createFreshnessMessage(domain, mutationType, entityId = null) {
  return {
    version: 1,
    msgId: generateId(),
    senderId: SENDER_ID,
    domain,
    mutationType,
    entityId,
    timestamp: Date.now()
  };
}

export function isValidFreshnessMessage(data, now = Date.now()) {
  if (!data || typeof data !== 'object') return false;
  if (data.version !== 1) return false;
  if (!data.msgId || typeof data.msgId !== 'string') return false;
  if (!data.senderId || typeof data.senderId !== 'string') return false;
  if (!data.domain || !VALID_DOMAINS.has(data.domain)) return false;
  if (!data.mutationType || !VALID_MUTATIONS.has(data.mutationType)) return false;
  if (typeof data.timestamp !== 'number' || isNaN(data.timestamp)) return false;

  const age = now - data.timestamp;
  if (age > MAX_AGE_MS) return false; // Expired
  if (age < -FUTURE_TOLERANCE_MS) return false; // Too far in the future

  return true;
}

export function createMessageDeduper(maxMemory = 1000) {
  const seen = new Map();

  return {
    isDuplicate(msgId, timestamp) {
      if (seen.has(msgId)) return true;

      seen.set(msgId, timestamp);

      if (seen.size > maxMemory) {
        const oldestAllowed = Date.now() - MAX_AGE_MS;
        for (const [id, ts] of seen.entries()) {
          if (ts < oldestAllowed) {
            seen.delete(id);
          }
        }
        if (seen.size > maxMemory) {
          const sorted = Array.from(seen.entries()).sort((a, b) => a[1] - b[1]);
          const toRemove = sorted.slice(0, seen.size - (maxMemory / 2));
          for (const [id] of toRemove) {
            seen.delete(id);
          }
        }
      }
      return false;
    },
    _getSize() { return seen.size; }
  };
}

export function createFreshnessRouter(options = {}) {
  const deduper = options.deduper || createMessageDeduper();
  const listeners = new Set();

  return {
    subscribe(domain, callback) {
      const wrappedCallback = (data) => {
        if (data.domain === domain) {
          callback(data);
        }
      };

      listeners.add(wrappedCallback);

      let isUnsubscribed = false;
      return () => {
        if (isUnsubscribed) return;
        isUnsubscribed = true;
        listeners.delete(wrappedCallback);
      };
    },

    dispatch(data, allowSelf = false) {
      if (!isValidFreshnessMessage(data)) return false;

      if (!allowSelf && data.senderId === SENDER_ID) {
        return false;
      }

      if (deduper.isDuplicate(data.msgId, data.timestamp)) {
        return false;
      }

      for (const listener of listeners) {
        try {
          listener(data);
        } catch (err) {
          console.error('Freshness listener error:', err);
        }
      }
      return true;
    },

    _getListenerCount() {
      return listeners.size;
    }
  };
}

const globalRouter = createFreshnessRouter();

let channel = null;
let subscribers = 0;

function initTransport() {
  if (typeof window === 'undefined') return;
  if (subscribers > 0) return;

  if (window.BroadcastChannel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener('message', handleChannelMessage);
  }
  window.addEventListener('storage', handleStorageEvent);
}

function teardownTransport() {
  if (typeof window === 'undefined') return;
  if (subscribers > 0) return;

  if (channel) {
    channel.removeEventListener('message', handleChannelMessage);
    channel.close();
    channel = null;
  }
  window.removeEventListener('storage', handleStorageEvent);
}

function handleChannelMessage(event) {
  if (event.data) {
    globalRouter.dispatch(event.data, false);
  }
}

function handleStorageEvent(event) {
  if (event.key === FALLBACK_KEY && event.newValue) {
    try {
      const data = JSON.parse(event.newValue);
      globalRouter.dispatch(data, false);
    } catch (e) {
      // Ignore
    }
  }
}

export function subscribeToFreshness(domain, callback) {
  if (typeof window === 'undefined') return () => {};

  const unsubscribeRouter = globalRouter.subscribe(domain, callback);

  if (subscribers === 0) {
    initTransport();
  }
  subscribers++;

  let isUnsubscribed = false;
  return () => {
    if (isUnsubscribed) return;
    isUnsubscribed = true;
    unsubscribeRouter();
    subscribers--;
    if (subscribers === 0) {
      teardownTransport();
    }
  };
}

export function publishFreshness(domain, mutationType, entityId = null) {
  if (typeof window === 'undefined') return;

  const data = createFreshnessMessage(domain, mutationType, entityId);
  if (!isValidFreshnessMessage(data)) return;

  // 1. Dispatch locally with allowSelf=true
  globalRouter.dispatch(data, true);

  // 2. Publish to transports
  if (channel) {
    channel.postMessage(data);
  }

  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(data));
    localStorage.removeItem(FALLBACK_KEY);
  } catch (e) {
    // Ignore quota errors
  }
}

if (typeof window !== 'undefined') {
  window.subscribeToFreshness = subscribeToFreshness;
  window.publishFreshness = publishFreshness;
}
