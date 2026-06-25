import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { roleGuard } from '../middleware/roleGuard.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import prisma from '../config/db.js';
import { createNotification } from '../services/notification.service.js';

const router = Router();
router.use(protect);

router.post('/request', roleGuard('student'), asyncHandler(async (req, res) => {
  const { mentorId, message } = req.body;
  const existing = await prisma.mentorshipRequest.findFirst({ where: { menteeId: req.user.id, mentorId, status: { in: ['pending', 'accepted'] } } });
  if (existing) throw new ApiError(400, 'You already have an active request with this mentor');
  const request = await prisma.mentorshipRequest.create({ data: { menteeId: req.user.id, mentorId, message }, include: { mentee: { select: { name: true } } } });
  await createNotification({ recipientId: mentorId, type: 'mentorship_request', title: 'New Mentorship Request', message: `${req.user.name} wants to be your mentee`, link: '/app/mentorship', relatedId: request.id, io: req.app.get('io') });
  res.status(201).json({ success: true, data: request });
}));

router.get('/requests', asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const where = req.user.role === 'student' ? { menteeId: req.user.id } : { mentorId: req.user.id };
  if (status) where.status = status;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [requests, total] = await prisma.$transaction([
    prisma.mentorshipRequest.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' }, include: { mentee: { select: { id: true, name: true, email: true, avatar: true } }, mentor: { select: { id: true, name: true, email: true, avatar: true } } } }),
    prisma.mentorshipRequest.count({ where }),
  ]);
  res.json({ success: true, data: { requests, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } } });
}));

router.put('/requests/:id/accept', roleGuard('alumni'), asyncHandler(async (req, res) => {
  const request = await prisma.mentorshipRequest.findUnique({ where: { id: req.params.id } });
  if (!request) throw new ApiError(404, 'Not found');
  if (request.mentorId !== req.user.id) throw new ApiError(403, 'Not your request');
  if (request.status !== 'pending') throw new ApiError(400, 'Not pending');
  const updated = await prisma.mentorshipRequest.update({ where: { id: req.params.id }, data: { status: 'accepted' } });
  await prisma.alumniProfile.update({ where: { userId: req.user.id }, data: { activeMentees: { increment: 1 } } });
  await createNotification({ recipientId: request.menteeId, type: 'mentorship_accepted', title: 'Mentorship Accepted! 🎉', message: `${req.user.name} accepted your request`, link: '/app/mentorship', relatedId: request.id, io: req.app.get('io') });
  res.json({ success: true, data: updated });
}));

router.put('/requests/:id/reject', roleGuard('alumni'), asyncHandler(async (req, res) => {
  const request = await prisma.mentorshipRequest.findUnique({ where: { id: req.params.id } });
  if (!request) throw new ApiError(404, 'Not found');
  if (request.mentorId !== req.user.id) throw new ApiError(403, 'Not your request');
  const updated = await prisma.mentorshipRequest.update({ where: { id: req.params.id }, data: { status: 'rejected' } });
  await createNotification({ recipientId: request.menteeId, type: 'mentorship_rejected', title: 'Mentorship Update', message: 'Your request was declined', link: '/app/mentorship', relatedId: request.id, io: req.app.get('io') });
  res.json({ success: true, data: updated });
}));

router.post('/sessions', asyncHandler(async (req, res) => {
  const { mentorshipRequestId, scheduledAt, duration, topic, meetingLink } = req.body;
  const request = await prisma.mentorshipRequest.findUnique({ where: { id: mentorshipRequestId } });
  if (!request || request.status !== 'accepted') throw new ApiError(400, 'Invalid mentorship');
  const session = await prisma.mentorshipSession.create({ data: { mentorshipRequestId, menteeId: request.menteeId, mentorId: request.mentorId, scheduledAt: new Date(scheduledAt), duration: duration || 30, topic, meetingLink } });
  res.status(201).json({ success: true, data: session });
}));

router.get('/sessions', asyncHandler(async (req, res) => {
  const where = req.user.role === 'student' ? { menteeId: req.user.id } : { mentorId: req.user.id };
  const sessions = await prisma.mentorshipSession.findMany({ where, orderBy: { scheduledAt: 'desc' }, include: { mentee: { select: { name: true, avatar: true } }, mentor: { select: { name: true, avatar: true } } } });
  res.json({ success: true, data: sessions });
}));

router.post('/requests/:id/feedback', roleGuard('student'), asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const request = await prisma.mentorshipRequest.findUnique({ where: { id: req.params.id } });
  if (!request) throw new ApiError(404, 'Not found');
  const updated = await prisma.mentorshipRequest.update({ where: { id: req.params.id }, data: { feedbackRating: rating, feedbackComment: comment, feedbackAt: new Date(), status: 'completed' } });
  const profile = await prisma.alumniProfile.findUnique({ where: { userId: request.mentorId } });
  if (profile) {
    const newCount = profile.mentorRatingCount + 1;
    const newAvg = ((profile.mentorRatingAvg * profile.mentorRatingCount) + rating) / newCount;
    await prisma.alumniProfile.update({ where: { userId: request.mentorId }, data: { mentorRatingAvg: Math.round(newAvg * 10) / 10, mentorRatingCount: newCount, activeMentees: { decrement: 1 } } });
  }
  res.json({ success: true, data: updated });
}));

router.get('/mentors', asyncHandler(async (req, res) => {
  const { skill, industry, page = 1, limit = 12 } = req.query;
  const where = { mentorshipAvailability: true };
  if (skill) where.skills = { has: skill };
  if (industry) where.industry = industry;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [mentors, total] = await prisma.$transaction([
    prisma.alumniProfile.findMany({ where, skip, take: parseInt(limit), orderBy: { mentorRatingAvg: 'desc' }, include: { user: { select: { id: true, name: true, email: true, avatar: true, isVerified: true } } } }),
    prisma.alumniProfile.count({ where }),
  ]);
  res.json({ success: true, data: { mentors, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } } });
}));

export default router;
