import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://hiring-dev.internal.kloudspot.com';

export const useSocketIO = ({ onAlert, onLiveOccupancy, enabled = true }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const storedUser = localStorage.getItem('cms_user');
    const token = storedUser ? JSON.parse(storedUser).token : '';

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socketRef.current.on('alert', (data) => onAlert?.(data));
    socketRef.current.on('liveOccupancy', (data) => onLiveOccupancy?.(data));

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [enabled, onAlert, onLiveOccupancy]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
  };
};
