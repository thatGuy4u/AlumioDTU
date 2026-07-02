import jwt from 'jsonwebtoken';
import { chatHandler } from '../socket/chatHandler.js';
import { notificationHandler } from '../socket/notificationHandler.js';
import { presenceHandler } from '../socket/presenceHandler.js';

// Track online users: Map<userId, Set<socketId>>
const onlineUsers = new Map();

export function initializeSocket(io) {
  // Verify JWT on connection — reject unauthenticated sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    // Track user presence
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast online status
    io.emit('online_status', { userId, status: 'online' });
    console.log(`🟢 User ${userId} connected (socket: ${socket.id})`);

    // Register event handlers
    chatHandler(io, socket, onlineUsers);
    notificationHandler(io, socket);
    presenceHandler(io, socket, onlineUsers);

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('online_status', { userId, status: 'offline' });
        }
      }
      console.log(`🔴 User ${userId} disconnected (socket: ${socket.id})`);
    });
  });
}

export function getOnlineUsers() {
  return onlineUsers;
}

export function isUserOnline(userId) {
  return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
}
