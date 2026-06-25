import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { roleGuard } from '../middleware/roleGuard.js';
import { uploadAvatar, uploadResume, uploadToCloudinary } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import prisma from '../config/db.js';

const router = Router();
router.use(protect);

const sanitizeUser = (u) => {
  const { password, refreshToken, emailVerificationToken, emailVerificationExpires, passwordResetToken, passwordResetExpires, ...safe } = u;
  return safe;
};

// GET /profile
router.get('/profile', asyncHandler(async (req, res) => {
  let profile = null;
  if (req.user.role === 'student') profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
  else if (req.user.role === 'alumni') profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });
  const achievements = await prisma.achievement.findMany({ where: { userId: req.user.id }, orderBy: { earnedAt: 'desc' } });
  res.json({ success: true, data: { user: sanitizeUser(req.user), profile, achievements } });
}));

// PUT /profile
router.put('/profile', asyncHandler(async (req, res) => {
  const { name, socialLinks, ...profileData } = req.body;
  const userData = {};
  if (name) userData.name = name;
  if (socialLinks) userData.socialLinks = socialLinks;
  if (Object.keys(userData).length) await prisma.user.update({ where: { id: req.user.id }, data: userData });

  let profile;
  if (req.user.role === 'student') {
    profile = await prisma.studentProfile.update({ where: { userId: req.user.id }, data: profileData });
  } else if (req.user.role === 'alumni') {
    profile = await prisma.alumniProfile.update({ where: { userId: req.user.id }, data: profileData });
  }
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json({ success: true, message: 'Profile updated', data: { user: sanitizeUser(user), profile } });
}));

// POST /profile/avatar
router.post('/profile/avatar', uploadAvatar.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const result = await uploadToCloudinary(req.file.buffer, { folder: 'alumiodtu/avatars', transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] });
  await prisma.user.update({ where: { id: req.user.id }, data: { avatar: result.secure_url } });
  res.json({ success: true, data: { avatar: result.secure_url } });
}));

// POST /profile/resume
router.post('/profile/resume', roleGuard('student'), uploadResume.single('resume'), asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const result = await uploadToCloudinary(req.file.buffer, { folder: 'alumiodtu/resumes', resource_type: 'raw' });
  await prisma.studentProfile.update({ where: { userId: req.user.id }, data: { resume: result.secure_url } });
  res.json({ success: true, data: { resume: result.secure_url } });
}));

// GET /profile/:userId
router.get('/profile/:userId', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
  if (!user) throw new ApiError(404, 'User not found');
  let profile = null;
  if (user.role === 'student') profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  else if (user.role === 'alumni') profile = await prisma.alumniProfile.findUnique({ where: { userId: user.id } });
  const achievements = await prisma.achievement.findMany({ where: { userId: user.id }, orderBy: { earnedAt: 'desc' } });
  res.json({ success: true, data: { user: sanitizeUser(user), profile, achievements } });
}));

// PUT /onboarding
router.put('/onboarding', asyncHandler(async (req, res) => {
  const { role } = req.user;
  const data = req.body;

  let profile;
  if (role === 'student') {
    const { name, socialLinks, avatar, ...profileFields } = data;
    profile = await prisma.studentProfile.update({ where: { userId: req.user.id }, data: profileFields });
    const userUpdate = { isProfileComplete: true };
    if (name) userUpdate.name = name;
    if (avatar) userUpdate.avatar = avatar;
    if (socialLinks) userUpdate.socialLinks = socialLinks;
    await prisma.user.update({ where: { id: req.user.id }, data: userUpdate });
  } else if (role === 'alumni') {
    const { name, socialLinks, avatar, ...profileFields } = data;
    profile = await prisma.alumniProfile.update({ where: { userId: req.user.id }, data: profileFields });
    const userUpdate = { isProfileComplete: true };
    if (name) userUpdate.name = name;
    if (avatar) userUpdate.avatar = avatar;
    if (socialLinks) userUpdate.socialLinks = socialLinks;
    await prisma.user.update({ where: { id: req.user.id }, data: userUpdate });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json({ success: true, message: 'Onboarding complete!', data: { user: sanitizeUser(user), profile } });
}));

// GET /directory
router.get('/directory', asyncHandler(async (req, res) => {
  const { search, company, industry, branch, graduationYear, location, skills, mentorshipAvailable, page = 1, limit = 12 } = req.query;
  const where = {};

  if (company) where.company = { contains: company, mode: 'insensitive' };
  if (industry) where.industry = industry;
  if (branch) where.branch = branch;
  if (graduationYear) where.graduationYear = parseInt(graduationYear);
  if (location) where.location = { contains: location, mode: 'insensitive' };
  if (skills) where.skills = { hasSome: skills.split(',').map(s => s.trim()) };
  if (mentorshipAvailable === 'true') where.mentorshipAvailability = true;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  let profiles, total;
  if (search) {
    profiles = await prisma.alumniProfile.findMany({
      where, skip, take, orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true, avatar: true, isVerified: true, socialLinks: true } } },
    });
    // filter by user name search
    profiles = profiles.filter(p => p.user.name.toLowerCase().includes(search.toLowerCase()));
    total = profiles.length;
  } else {
    [profiles, total] = await prisma.$transaction([
      prisma.alumniProfile.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true, email: true, avatar: true, isVerified: true, socialLinks: true } } } }),
      prisma.alumniProfile.count({ where }),
    ]);
  }

  res.json({ success: true, data: { profiles, pagination: { page: parseInt(page), limit: take, total, pages: Math.ceil(total / take) } } });
}));

// GET /search
router.get('/search', asyncHandler(async (req, res) => {
  const { q, role, page = 1, limit = 10 } = req.query;
  if (!q) throw new ApiError(400, 'Search query is required');
  const where = { name: { contains: q, mode: 'insensitive' }, isBanned: false };
  if (role) where.role = role;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({ where, skip, take: parseInt(limit), select: { id: true, name: true, email: true, avatar: true, role: true } }),
    prisma.user.count({ where }),
  ]);
  res.json({ success: true, data: { users, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } } });
}));

// GET /leaderboard
router.get('/leaderboard', asyncHandler(async (req, res) => {
  const { type = 'all', limit = 20 } = req.query;
  const userWhere = type !== 'all' ? { role: type } : {};
  const achievements = await prisma.achievement.groupBy({
    by: ['userId'], _sum: { points: true }, _count: { _all: true }, orderBy: { _sum: { points: 'desc' } }, take: parseInt(limit),
  });
  const userIds = achievements.map(a => a.userId);
  const users = await prisma.user.findMany({ where: { id: { in: userIds }, ...userWhere }, select: { id: true, name: true, avatar: true, role: true } });
  const leaderboard = achievements.map(a => {
    const user = users.find(u => u.id === a.userId);
    return user ? { userId: a.userId, totalPoints: a._sum.points, badgeCount: a._count._all, user } : null;
  }).filter(Boolean);
  res.json({ success: true, data: { leaderboard } });
}));

export default router;
