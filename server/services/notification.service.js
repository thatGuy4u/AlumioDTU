import prisma from '../config/db.js';

export const createNotification = async ({ recipientId, type, title, message, link, relatedId, io }) => {
  const notification = await prisma.notification.create({
    data: { recipientId, type, title, message, link, relatedId },
  });
  if (io) io.to(`user_${recipientId}`).emit('new_notification', notification);
  return notification;
};

export const getUnreadCount = async (userId) => {
  return prisma.notification.count({ where: { recipientId: userId, isRead: false } });
};
