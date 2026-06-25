import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { roleGuard } from '../middleware/roleGuard.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import prisma from '../config/db.js';

const router = Router();
router.use(protect);
router.use(roleGuard('admin'));

router.get('/users', asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const where = {};
  if (role) where.role = role;
  if (search) where.name = { contains: search, mode: 'insensitive' };
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, role: true, avatar: true, isEmailVerified: true, isVerified: true, isBanned: true, isProfileComplete: true, createdAt: true, lastLogin: true } }),
    prisma.user.count({ where }),
  ]);
  res.json({ success: true, data: { users, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } } });
}));

router.put('/users/:id/verify', asyncHandler(async (req, res) => {
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { isVerified: true } });
  res.json({ success: true, data: user });
}));

router.put('/users/:id/ban', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new ApiError(404, 'User not found');
  const updated = await prisma.user.update({ where: { id: req.params.id }, data: { isBanned: !user.isBanned } });
  res.json({ success: true, data: updated, message: updated.isBanned ? 'User banned' : 'User unbanned' });
}));

router.delete('/users/:id', asyncHandler(async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'User deleted' });
}));

router.get('/stats', asyncHandler(async (req, res) => {
  const [totalUsers, students, alumni, posts, jobs, events, mentorships] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'student' } }),
    prisma.user.count({ where: { role: 'alumni' } }),
    prisma.post.count(),
    prisma.job.count(),
    prisma.event.count(),
    prisma.mentorshipRequest.count(),
  ]);
  res.json({ success: true, data: { totalUsers, students, alumni, posts, jobs, events, mentorships } });
}));

router.get('/pending-verifications', asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({ where: { role: 'alumni', isVerified: false, isBanned: false }, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, avatar: true, createdAt: true } });
  res.json({ success: true, data: users });
}));

router.get('/growth', asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const users = await prisma.user.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true, role: true } });
  const growth = {};
  users.forEach(u => {
    const date = u.createdAt.toISOString().split('T')[0];
    const key = `${date}_${u.role}`;
    growth[key] = (growth[key] || 0) + 1;
  });
  const data = Object.entries(growth).map(([key, count]) => {
    const [date, role] = key.split('_');
    return { date, role, count };
  }).sort((a, b) => a.date.localeCompare(b.date));
  res.json({ success: true, data });
}));

router.get('/engagement', asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [activeUsers, newPosts, newJobs, newMentorships] = await prisma.$transaction([
    prisma.user.count({ where: { lastLogin: { gte: sevenDaysAgo } } }),
    prisma.post.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.job.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.mentorshipRequest.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]);
  res.json({ success: true, data: { activeUsers, newPosts, newJobs, newMentorships, period: '7d' } });
}));

router.put('/posts/:id/moderate', asyncHandler(async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) throw new ApiError(404, 'Post not found');
  const updated = await prisma.post.update({ where: { id: req.params.id }, data: { isModerated: !post.isModerated } });
  res.json({ success: true, data: updated });
}));

router.get('/reports', asyncHandler(async (req, res) => {
  const { status = 'pending', page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [reports, total] = await prisma.$transaction([
    prisma.report.findMany({ where: { status }, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' }, include: { reporter: { select: { id: true, name: true, avatar: true } }, reportedUser: { select: { id: true, name: true, avatar: true } } } }),
    prisma.report.count({ where: { status } }),
  ]);
  res.json({ success: true, data: { reports, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } } });
}));

export default router;
