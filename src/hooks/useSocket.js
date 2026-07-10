import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { selectToken, selectIsAuthenticated } from '../store/slices/authSlice';
import { SOCKET_URL } from '../utils/constants';

/**
 * Custom hook to manage a single Socket.io connection for the current user.
 *
 * Returns { socket, isConnected }.
 * - `socket` is null until authentication succeeds.
 * - Auto-disconnects on logout or unmount.
 */
export function useSocket() {
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

    // Create socket connection with auth token
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

  return { socket: socketRef.current, isConnected };
}

/**
 * Utility hook: listen for a specific socket event and call a handler.
 * Automatically subscribes/unsubscribes when socket or handler changes.
 */
export function useSocketEvent(socket, event, handler) {
  const savedHandler = useRef(handler);
  savedHandler.current = handler;

  useEffect(() => {
    if (!socket || !event) return;

    const listener = (...args) => savedHandler.current(...args);
    socket.on(event, listener);
    return () => socket.off(event, listener);
  }, [socket, event]);
}
