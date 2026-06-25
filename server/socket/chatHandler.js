import prisma from '../config/db.js';

export function chatHandler(io, socket, onlineUsers) {
  socket.on('join_conversation', (conversationId) => { socket.join(`chat_${conversationId}`); });
  socket.on('leave_conversation', (conversationId) => { socket.leave(`chat_${conversationId}`); });

  socket.on('send_message', async (data) => {
    try {
      const { conversationId, content, attachments = [] } = data;
      const userId = socket.handshake.auth?.userId;
      if (!userId || !conversationId || !content) return;

      const message = await prisma.message.create({
        data: { conversationId, senderId: userId, content, attachments, readBy: [userId] },
        include: { sender: { select: { id: true, name: true, avatar: true } } },
      });

      await prisma.conversation.update({ where: { id: conversationId }, data: { lastContent: content, lastSenderId: userId, lastMsgAt: new Date() } });
      await prisma.conversationParticipant.updateMany({ where: { conversationId, userId: { not: userId } }, data: { unreadCount: { increment: 1 } } });

      io.to(`chat_${conversationId}`).emit('new_message', message);

      const participants = await prisma.conversationParticipant.findMany({ where: { conversationId }, select: { userId: true } });
      participants.forEach(p => {
        if (p.userId !== userId) io.to(`user_${p.userId}`).emit('message_notification', { conversationId, message });
      });
    } catch (err) {
      console.error('Socket send_message error:', err);
    }
  });

  socket.on('typing', (conversationId) => {
    socket.to(`chat_${conversationId}`).emit('user_typing', { conversationId, userId: socket.handshake.auth?.userId });
  });
  socket.on('stop_typing', (conversationId) => {
    socket.to(`chat_${conversationId}`).emit('user_stop_typing', { conversationId, userId: socket.handshake.auth?.userId });
  });

  socket.on('mark_read', async (conversationId) => {
    const userId = socket.handshake.auth?.userId;
    if (!userId) return;
    await prisma.conversationParticipant.updateMany({ where: { conversationId, userId }, data: { unreadCount: 0 } });
    socket.to(`chat_${conversationId}`).emit('messages_read', { conversationId, userId });
  });
}
