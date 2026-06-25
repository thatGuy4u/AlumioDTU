export function notificationHandler(io, socket) {
  const userId = socket.handshake.auth?.userId;

  if (userId) {
    // Join user-specific room for targeted notifications
    socket.join(`user_${userId}`);
  }

  // Client acknowledges reading a notification
  socket.on('notification_read', (notificationId) => {
    // This is handled via REST API, but we could add socket handling here
  });
}
