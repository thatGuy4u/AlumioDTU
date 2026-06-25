import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { roleGuard } from '../middleware/roleGuard.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import prisma from '../config/db.js';

const router = Router();
router.use(protect);

// GET /
router.get('/', asyncHandler(async (req, res) => {
  const { type, upcoming, page = 1, limit = 12 } = req.query;
  const where = { isActive: true };
  if (type) where.type = type;
  if (upcoming === 'true') where.date = { gte: new Date() };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [events, total] = await prisma.$transaction([
    prisma.event.findMany({ where, skip, take: parseInt(limit), orderBy: { date: 'asc' }, include: { organizer: { select: { id: true, name: true, avatar: true } } } }),
    prisma.event.count({ where }),
  ]);
  res.json({ success: true, data: { events, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } } });
}));

// GET /calendar
router.get('/calendar', asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  const events = await prisma.event.findMany({ where: { date: { gte: startDate, lte: endDate }, isActive: true }, orderBy: { date: 'asc' }, include: { organizer: { select: { name: true, avatar: true } } } });
  res.json({ success: true, data: events });
}));

// GET /:id
router.get('/:id', asyncHandler(async (req, res) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id }, include: { organizer: { select: { id: true, name: true, avatar: true, email: true } } } });
  if (!event) throw new ApiError(404, 'Event not found');
  const registration = await prisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId: event.id, userId: req.user.id } } });
  res.json({ success: true, data: { event, isRegistered: !!registration, registration } });
}));

// POST /
router.post('/', roleGuard('alumni', 'admin'), asyncHandler(async (req, res) => {
  const event = await prisma.event.create({ data: { ...req.body, organizerId: req.user.id, date: new Date(req.body.date), endDate: req.body.endDate ? new Date(req.body.endDate) : null } });
  res.status(201).json({ success: true, data: event });
}));

// PUT /:id
router.put('/:id', roleGuard('alumni', 'admin'), asyncHandler(async (req, res) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) throw new ApiError(404, 'Event not found');
  if (event.organizerId !== req.user.id && req.user.role !== 'admin') throw new ApiError(403, 'Not authorized');
  const updated = await prisma.event.update({ where: { id: req.params.id }, data: { ...req.body, date: req.body.date ? new Date(req.body.date) : undefined } });
  res.json({ success: true, data: updated });
}));

// DELETE /:id
router.delete('/:id', roleGuard('admin'), asyncHandler(async (req, res) => {
  await prisma.event.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Event deleted' });
}));

// POST /:id/register
router.post('/:id/register', asyncHandler(async (req, res) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) throw new ApiError(404, 'Event not found');
  if (event.registeredCount >= event.maxAttendees) throw new ApiError(400, 'Event is full');
  const existing = await prisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId: event.id, userId: req.user.id } } });
  if (existing) throw new ApiError(400, 'Already registered');
  const registration = await prisma.eventRegistration.create({ data: { eventId: event.id, userId: req.user.id } });
  await prisma.event.update({ where: { id: event.id }, data: { registeredCount: { increment: 1 } } });
  res.status(201).json({ success: true, data: registration });
}));

// DELETE /:id/register
router.delete('/:id/register', asyncHandler(async (req, res) => {
  const reg = await prisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId: req.params.id, userId: req.user.id } } });
  if (reg) {
    await prisma.eventRegistration.delete({ where: { id: reg.id } });
    await prisma.event.update({ where: { id: req.params.id }, data: { registeredCount: { decrement: 1 } } });
  }
  res.json({ success: true, message: 'Registration cancelled' });
}));

// GET /:id/attendees
router.get('/:id/attendees', asyncHandler(async (req, res) => {
  const attendees = await prisma.eventRegistration.findMany({ where: { eventId: req.params.id }, include: { user: { select: { id: true, name: true, avatar: true, role: true } } } });
  res.json({ success: true, data: attendees });
}));

export default router;
