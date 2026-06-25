import { chatHandler } from '../socket/chatHandler.js';
import { notificationHandler } from '../socket/notificationHandler.js';
import { presenceHandler } from '../socket/presenceHandler.js';

// Track online users: Map<userId, Set<socketId>>
const onlineUsers = new Map();

export function initializeSocket(io) {
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId;

    if (userId) {
      // Track user presence
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);

      // Broadcast online status
      io.emit('online_status', { userId, status: 'online' });
      console.log(`🟢 User ${userId} connected (socket: ${socket.id})`);
    }

    // Register event handlers
    chatHandler(io, socket, onlineUsers);
    notificationHandler(io, socket);
    presenceHandler(io, socket, onlineUsers);

    socket.on('disconnect', () => {
      if (userId) {
        const sockets = onlineUsers.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            onlineUsers.delete(userId);
            io.emit('online_status', { userId, status: 'offline' });
          }
        }
        console.log(`🔴 User ${userId} disconnected (socket: ${socket.id})`);
      }
    });
  });
}

export function getOnlineUsers() {
  return onlineUsers;
}

export function isUserOnline(userId) {
  return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
}
