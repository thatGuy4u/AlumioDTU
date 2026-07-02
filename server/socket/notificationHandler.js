export function notificationHandler(io, socket) {
  const userId = socket.userId;

  if (userId) {
    // Join user-specific room for targeted notifications
    socket.join(`user_${userId}`);
  }
}
