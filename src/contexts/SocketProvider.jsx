import { createContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { selectToken, selectIsAuthenticated } from '../store/slices/authSlice';
import { SOCKET_URL } from '../utils/constants';

/**
 * SocketContext — provides a single, shared Socket.io connection for the
 * entire app. Any component that needs the socket should call useSocket().
 */
export const SocketContext = createContext({ socket: null, isConnected: false });

export function SocketProvider({ children }) {
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Don't connect if user isn't authenticated
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Avoid creating duplicate connections
    if (socketRef.current) return;

    // Create a single socket connection with auth token
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token, isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
