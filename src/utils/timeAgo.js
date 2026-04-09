import { useState, useEffect } from 'react';

export function parsePostedTime(postedTimeStr) {
  if (!postedTimeStr) return Date.now();
  const lower = postedTimeStr.toLowerCase();
  const match = lower.match(/(\d+)\s+(min|hour|day)/);
  if (!match) {
    if (lower.includes('just now')) return Date.now();
    return Date.now();
  }
  const val = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === 'min') return Date.now() - val * 60000;
  if (unit === 'hour') return Date.now() - val * 3600000;
  if (unit === 'day') return Date.now() - val * 86400000;
  return Date.now();
}

export function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Just now';
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function useTimeAgo(timestamp) {
  const [timeAgo, setTimeAgo] = useState(formatTimeAgo(timestamp));

  useEffect(() => {
    // Update every minute (60000 ms)
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(timestamp));
    }, 60000);
    
    // Also update immediately if timestamp changes
    setTimeAgo(formatTimeAgo(timestamp));

    return () => clearInterval(interval);
  }, [timestamp]);

  return timeAgo;
}
