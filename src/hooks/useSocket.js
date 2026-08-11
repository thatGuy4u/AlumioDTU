import { useContext, useEffect, useRef } from 'react';
import { SocketContext } from '../contexts/SocketProvider';

/**
 * Custom hook to access the shared Socket.io connection.
 *
 * Returns { socket, isConnected }.
 * - `socket` is null until authentication succeeds.
 * - The connection is managed by SocketProvider (single instance app-wide).
 */
export function useSocket() {
  return useContext(SocketContext);
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
