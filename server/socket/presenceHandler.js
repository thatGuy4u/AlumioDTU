export function presenceHandler(io, socket, onlineUsers) {
  const userId = socket.handshake.auth?.userId;

  // Client requests who's online
  socket.on('get_online_users', () => {
    const online = Array.from(onlineUsers.keys());
    socket.emit('online_users_list', online);
  });

  // Heartbeat to maintain presence
  socket.on('heartbeat', () => {
    if (userId) {
      io.emit('online_status', { userId, status: 'online' });
    }
  });
}
