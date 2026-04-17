import { useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('/', {
  autoConnect: false,
  transports: ['polling', 'websocket']
});

export const useSocket = (onUpdate) => {
  useEffect(() => {
    socket.connect();

    socket.on('connect', () => console.log('WebSocket Connected to Port 5000'));
    socket.on('connect_error', (err) => {
      // Avoid spamming logs in production (Vercel) as WebSockets are not supported there.
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.error('WebSocket Error details:', err.message);
      }
    });

    socket.on('DATA_UPDATED', (data) => {
      console.log('Real-time update received:', data);
      if (onUpdate) onUpdate(data);
    });

    return () => {
      socket.off('DATA_UPDATED');
      socket.disconnect();
    };
  }, [onUpdate]);

  return socket;
};
