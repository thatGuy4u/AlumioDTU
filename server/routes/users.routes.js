import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { roleGuard } from '../middleware/roleGuard.js';
import { uploadAvatar, uploadResume, uploadToCloudinary } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sanitizeUser } from '../utils/sanitize.js';
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import { sendNotificationEmail } from '../services/email.service.js';

const router = Router();
router.use(protect);

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

// PUT /onboarding — deduplicated student/alumni logic
router.put('/onboarding', asyncHandler(async (req, res) => {
  const { role } = req.user;
  const { name, socialLinks, avatar, ...profileFields } = req.body;

  // Update role-specific profile
  let profile;
  if (role === 'student') {
    profile = await prisma.studentProfile.update({ where: { userId: req.user.id }, data: profileFields });
  } else if (role === 'alumni') {
    profile = await prisma.alumniProfile.update({ where: { userId: req.user.id }, data: profileFields });
  }

  // Update common user fields
  const userUpdate = { isProfileComplete: true };
  if (name) userUpdate.name = name;
  if (avatar) userUpdate.avatar = avatar;
  if (socialLinks) userUpdate.socialLinks = socialLinks;
  await prisma.user.update({ where: { id: req.user.id }, data: userUpdate });

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json({ success: true, message: 'Onboarding complete!', data: { user: sanitizeUser(user), profile } });
}));

// POST /convert-to-alumni — Graduate transition: student → alumni
router.post('/convert-to-alumni', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Verify user is a student
  if (req.user.role !== 'student') {
    throw new ApiError(400, 'Only student accounts can be converted to alumni');
  }

  // Get existing student profile
  const studentProfile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!studentProfile) {
    throw new ApiError(404, 'Student profile not found');
  }

  // Verify graduation year has arrived
  const currentYear = new Date().getFullYear();
  if (studentProfile.graduationYear && studentProfile.graduationYear > currentYear) {
    throw new ApiError(400, `You cannot convert before your graduation year (${studentProfile.graduationYear})`);
  }

  // Extract new alumni fields from request body
  const { company, designation, industry, location, experience, linkedinProfile, mentorshipAvailability, mentorshipCapacity } = req.body;

  if (!company || !designation || !industry || !location) {
    throw new ApiError(400, 'Company, designation, industry, and location are required');
  }

  // Perform the transition in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create AlumniProfile with migrated + new data
    const alumniProfile = await tx.alumniProfile.create({
      data: {
        userId,
        branch: studentProfile.branch,
        graduationYear: studentProfile.graduationYear,
        bio: studentProfile.bio || '',
        skills: studentProfile.skills || [],
        company,
        designation,
        industry,
        location,
        experience: experience ? parseInt(experience) : 0,
        linkedinProfile: linkedinProfile || '',
        mentorshipAvailability: mentorshipAvailability || false,
        mentorshipCapacity: mentorshipCapacity ? parseInt(mentorshipCapacity) : 3,
      },
    });

    // 2. Delete old StudentProfile
    await tx.studentProfile.delete({ where: { userId } });

    // 3. Update User role to alumni
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: { role: 'alumni', isProfileComplete: true },
    });

    return { user: updatedUser, profile: alumniProfile };
  });

  // Send a welcome-to-alumni notification
  try {
    const { createNotification } = await import('../services/notification.service.js');
    await createNotification({
      recipientId: userId,
      type: 'system_notification',
      title: '🎉 Welcome to the Alumni Network!',
      message: 'Your account has been successfully converted. You can now mentor students, post jobs, and more!',
      link: '/app/dashboard',
      io: req.app.get('io'),
    });
  } catch { /* non-critical */ }

  res.json({
    success: true,
    message: 'Account successfully converted to alumni!',
    data: { user: sanitizeUser(result.user), profile: result.profile },
  });
}));

// GET /directory — fixed search to use database-level filtering
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

  // Search by user name at the database level (not client-side filtering)
  if (search) {
    where.user = { name: { contains: search, mode: 'insensitive' } };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [profiles, total] = await prisma.$transaction([
    prisma.alumniProfile.findMany({
      where, skip, take, orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true, avatar: true, isVerified: true, socialLinks: true } } },
    }),
    prisma.alumniProfile.count({ where }),
  ]);

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

// PUT /change-password
router.put('/change-password', asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new ApiError(400, 'Both current and new password are required');
  if (newPassword.length < 8) throw new ApiError(400, 'New password must be at least 8 characters');

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new ApiError(400, 'Current password is incorrect');

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: req.user.id }, data: { password: hashedPassword } });

  // Send confirmation email
  sendNotificationEmail(
    user.email,
    'Your AlumioDTU password was changed',
    user.name,
    '<p>Your password was changed successfully. If you did not make this change, please reset your password immediately or contact support.</p>'
  ).catch(e => console.error('Password change email error:', e.message));

  res.json({ success: true, message: 'Password changed successfully' });
}));

// DELETE /account — sends deletion request to admin instead of immediate delete
router.delete('/account', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Notify all admins about the account deletion request
  const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } });
  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map(admin => ({
        recipientId: admin.id,
        type: 'system_notification',
        title: 'Account Deletion Request',
        message: `${req.user.name} (${req.user.email}) has requested to delete their account.`,
        link: '/app/admin/users',
        relatedId: userId,
      })),
    });
  }

  res.json({ success: true, message: 'Account deletion request sent to admin' });
}));

// GET /dashboard-stats — aggregated stats for the logged-in user's dashboard
router.get('/dashboard-stats', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  if (role === 'student') {
    const [conversations, mentors, applications, registeredEvents] = await prisma.$transaction([
      prisma.conversationParticipant.count({ where: { userId } }),
      prisma.mentorshipRequest.count({ where: { menteeId: userId, status: 'accepted' } }),
      prisma.jobApplication.count({ where: { applicantId: userId } }),
      prisma.eventRegistration.count({ where: { userId } }),
    ]);
    res.json({ success: true, data: { connections: conversations, mentors, applications, events: registeredEvents } });
  } else if (role === 'alumni') {
    const [activeMentees, jobsPosted, eventsOrganized, studentsHelped] = await prisma.$transaction([
      prisma.mentorshipRequest.count({ where: { mentorId: userId, status: 'accepted' } }),
      prisma.job.count({ where: { postedById: userId } }),
      prisma.event.count({ where: { organizerId: userId } }),
      prisma.mentorshipRequest.count({ where: { mentorId: userId, status: { in: ['accepted', 'completed'] } } }),
    ]);
    res.json({ success: true, data: { activeMentees, jobsPosted, eventsOrganized, studentsHelped } });
  } else {
    // Admin stats are served by /api/admin/stats
    res.json({ success: true, data: {} });
  }
}));

// POST /contact — authenticated user contact form
router.post('/contact', asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!subject || !message) throw new ApiError(400, 'Subject and message are required');

  const { sendMail } = await import('../config/email.js');
  await sendMail({
    from: process.env.EMAIL_FROM,
    to: 'alumiodtu@gmail.com',
    subject: `[AlumioDTU Contact] ${subject}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f2e; color: #e8eaf6; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #F5C842; font-size: 28px; margin: 0;">Alumio<span style="color: #00d4c8;">DTU</span></h1>
        </div>
        <h2 style="color: #fff; margin-bottom: 8px;">New Contact Message</h2>
        <p style="color: rgba(232,234,246,0.7);"><strong>From:</strong> ${name || req.user.name} (${email || req.user.email})</p>
        <p style="color: rgba(232,234,246,0.7);"><strong>Subject:</strong> ${subject}</p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 16px 0;" />
        <div style="color: rgba(232,234,246,0.7); line-height: 1.7;">${message.replace(/\n/g, '<br>')}</div>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
        <p style="color: rgba(232,234,246,0.3); font-size: 12px; text-align: center;">AlumioDTU — Contact Form Submission</p>
      </div>
    `,
  });

  res.json({ success: true, message: 'Message sent successfully' });
}));

export default router;
