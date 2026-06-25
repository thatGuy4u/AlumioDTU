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
  const { search, type, workMode, skills, company, page = 1, limit = 12, sort = 'newest' } = req.query;
  const where = { isActive: true };
  if (type) where.type = type;
  if (workMode) where.workMode = workMode;
  if (company) where.company = { contains: company, mode: 'insensitive' };
  if (skills) where.skills = { hasSome: skills.split(',').map(s => s.trim()) };
  if (search) where.title = { contains: search, mode: 'insensitive' };

  const orderBy = sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [jobs, total] = await prisma.$transaction([
    prisma.job.findMany({ where, skip, take: parseInt(limit), orderBy, include: { postedBy: { select: { id: true, name: true, avatar: true } } } }),
    prisma.job.count({ where }),
  ]);
  res.json({ success: true, data: { jobs, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } } });
}));

// GET /my/applications (student)
router.get('/my/applications', roleGuard('student'), asyncHandler(async (req, res) => {
  const applications = await prisma.jobApplication.findMany({ where: { applicantId: req.user.id }, orderBy: { createdAt: 'desc' }, include: { job: { include: { postedBy: { select: { name: true } } } } } });
  res.json({ success: true, data: applications });
}));

// GET /my/saved (student)
router.get('/my/saved', roleGuard('student'), asyncHandler(async (req, res) => {
  const saved = await prisma.savedJob.findMany({ where: { userId: req.user.id }, include: { job: { include: { postedBy: { select: { name: true, avatar: true } } } } } });
  res.json({ success: true, data: saved.map(s => s.job) });
}));

// GET /my/posted (alumni)
router.get('/my/posted', roleGuard('alumni'), asyncHandler(async (req, res) => {
  const jobs = await prisma.job.findMany({ where: { postedById: req.user.id }, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: jobs });
}));

// GET /:id
router.get('/:id', asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id }, include: { postedBy: { select: { id: true, name: true, avatar: true, email: true } } } });
  if (!job) throw new ApiError(404, 'Job not found');
  let hasApplied = false;
  if (req.user.role === 'student') {
    hasApplied = !!(await prisma.jobApplication.findUnique({ where: { jobId_applicantId: { jobId: job.id, applicantId: req.user.id } } }));
  }
  let isSaved = false;
  if (req.user.role === 'student') {
    isSaved = !!(await prisma.savedJob.findUnique({ where: { userId_jobId: { userId: req.user.id, jobId: job.id } } }));
  }
  res.json({ success: true, data: { job, hasApplied, isSaved } });
}));

// POST /
router.post('/', roleGuard('alumni'), asyncHandler(async (req, res) => {
  const job = await prisma.job.create({ data: { ...req.body, postedById: req.user.id, applicationDeadline: req.body.applicationDeadline ? new Date(req.body.applicationDeadline) : null } });
  res.status(201).json({ success: true, data: job });
}));

// PUT /:id
router.put('/:id', roleGuard('alumni'), asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) throw new ApiError(404, 'Job not found');
  if (job.postedById !== req.user.id) throw new ApiError(403, 'Not your job posting');
  const updated = await prisma.job.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: updated });
}));

// DELETE /:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) throw new ApiError(404, 'Job not found');
  if (job.postedById !== req.user.id && req.user.role !== 'admin') throw new ApiError(403, 'Not authorized');
  await prisma.job.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Job deleted' });
}));

// POST /:id/apply
router.post('/:id/apply', roleGuard('student'), asyncHandler(async (req, res) => {
  const { resume, coverLetter } = req.body;
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job || !job.isActive) throw new ApiError(400, 'Job not available');

  const existing = await prisma.jobApplication.findUnique({ where: { jobId_applicantId: { jobId: job.id, applicantId: req.user.id } } });
  if (existing) throw new ApiError(400, 'Already applied');

  let resumeUrl = resume;
  if (!resumeUrl) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    resumeUrl = profile?.resume;
    if (!resumeUrl) throw new ApiError(400, 'Please upload a resume first');
  }

  const application = await prisma.jobApplication.create({ data: { jobId: job.id, applicantId: req.user.id, resume: resumeUrl, coverLetter } });
  await prisma.job.update({ where: { id: job.id }, data: { applicantCount: { increment: 1 } } });
  res.status(201).json({ success: true, data: application });
}));

// GET /:id/applications
router.get('/:id/applications', roleGuard('alumni'), asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job) throw new ApiError(404, 'Job not found');
  if (job.postedById !== req.user.id) throw new ApiError(403, 'Not your job');
  const applications = await prisma.jobApplication.findMany({ where: { jobId: job.id }, orderBy: { createdAt: 'desc' }, include: { applicant: { select: { id: true, name: true, email: true, avatar: true } } } });
  res.json({ success: true, data: applications });
}));

// PUT /applications/:id/status
router.put('/applications/:id/status', roleGuard('alumni'), asyncHandler(async (req, res) => {
  const app = await prisma.jobApplication.update({ where: { id: req.params.id }, data: { status: req.body.status } });
  res.json({ success: true, data: app });
}));

// POST /my/saved (toggle)
router.post('/my/saved', roleGuard('student'), asyncHandler(async (req, res) => {
  const { jobId } = req.body;
  const existing = await prisma.savedJob.findUnique({ where: { userId_jobId: { userId: req.user.id, jobId } } });
  if (existing) {
    await prisma.savedJob.delete({ where: { id: existing.id } });
    res.json({ success: true, data: { saved: false } });
  } else {
    await prisma.savedJob.create({ data: { userId: req.user.id, jobId } });
    res.json({ success: true, data: { saved: true } });
  }
}));

export default router;
