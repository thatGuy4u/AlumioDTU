import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import prisma from '../config/db.js';

const router = Router();
router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;
  const where = { recipientId: req.user.id };
  if (type) where.type = type;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [notifications, total, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { recipientId: req.user.id, isRead: false } }),
  ]);
  res.json({ success: true, data: { notifications, unreadCount, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } } });
}));

router.get('/unread-count', asyncHandler(async (req, res) => {
  const count = await prisma.notification.count({ where: { recipientId: req.user.id, isRead: false } });
  res.json({ success: true, data: { count } });
}));

router.put('/:id/read', asyncHandler(async (req, res) => {
  await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
  res.json({ success: true });
}));

router.put('/read-all', asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({ where: { recipientId: req.user.id, isRead: false }, data: { isRead: true } });
  res.json({ success: true, message: 'All marked as read' });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await prisma.notification.deleteMany({ where: { id: req.params.id, recipientId: req.user.id } });
  res.json({ success: true });
}));

export default router;
