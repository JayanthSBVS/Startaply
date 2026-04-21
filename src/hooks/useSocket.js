import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

// Singleton socket — created once, shared across hook calls
const socketUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/' : 'http://localhost:5000');
const socket = io(socketUrl, {
  autoConnect: false,
  transports: ['polling', 'websocket'],
  reconnectionAttempts: 3,
  reconnectionDelay: 5000,
  timeout: 10000
});

export const useSocket = (onUpdate) => {
  // Use a ref so the effect doesn't re-run when onUpdate changes identity
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    // Only connect if there's a valid token (avoids 401 storms on reconnect)
    const token = localStorage.getItem('strataply_token');
    if (!token || token === 'null' || token === 'undefined') return;

    socket.connect();

    const handleConnect = () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('WebSocket Connected');
      }
    };

    const handleError = (err) => {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.warn('WebSocket unavailable (expected on Vercel):', err.message);
      }
    };

    const handleUpdate = (data) => {
      if (onUpdateRef.current) onUpdateRef.current(data);
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleError);
    socket.on('DATA_UPDATED', handleUpdate);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleError);
      socket.off('DATA_UPDATED', handleUpdate);
      socket.disconnect();
    };
  // Empty deps: runs once on mount, uses ref for callback — no reconnect storm
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return socket;
};
