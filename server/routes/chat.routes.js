import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import prisma from '../config/db.js';

const router = Router();
router.use(protect);

// GET /conversations
router.get('/conversations', asyncHandler(async (req, res) => {
  const participantRecords = await prisma.conversationParticipant.findMany({
    where: { userId: req.user.id },
    include: {
      conversation: {
        include: {
          participants: {
            include: { user: { select: { id: true, name: true, avatar: true, role: true, onlineStatus: true, lastSeen: true, studentProfile: { select: { rollNumber: true, graduationYear: true } }, alumniProfile: { select: { graduationYear: true, company: true } } } } },
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: 'desc' } },
  });
  const conversations = participantRecords.map(p => ({
    ...p.conversation,
    myUnreadCount: p.unreadCount,
  }));
  res.json({ success: true, data: conversations });
}));

// POST /conversations
router.post('/conversations', asyncHandler(async (req, res) => {
  const { recipientId } = req.body;
  if (!recipientId) throw new ApiError(400, 'Recipient ID is required');

  // Block messaging admin users
  const recipient = await prisma.user.findUnique({ where: { id: recipientId }, select: { role: true } });
  if (!recipient) throw new ApiError(404, 'User not found');
  if (recipient.role === 'admin') throw new ApiError(403, 'You cannot send messages to administrators');

  // Check if conversation already exists
  const existingParticipants = await prisma.conversationParticipant.findMany({
    where: { userId: req.user.id },
    select: { conversationId: true },
  });
  const myConvoIds = existingParticipants.map(p => p.conversationId);

  let existingConvo = null;
  if (myConvoIds.length > 0) {
    const recipientParticipant = await prisma.conversationParticipant.findFirst({
      where: { conversationId: { in: myConvoIds }, userId: recipientId },
      include: {
        conversation: {
          include: {
            participants: {
              include: { user: { select: { id: true, name: true, avatar: true, role: true, onlineStatus: true, lastSeen: true, studentProfile: { select: { rollNumber: true, graduationYear: true } }, alumniProfile: { select: { graduationYear: true, company: true } } } } },
            },
          },
        },
      },
    });
    if (recipientParticipant) existingConvo = recipientParticipant.conversation;
  }

  if (existingConvo) return res.json({ success: true, data: existingConvo });

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: req.user.id },
          { userId: recipientId },
        ],
      },
    },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, avatar: true, role: true, onlineStatus: true, lastSeen: true, studentProfile: { select: { rollNumber: true, graduationYear: true } }, alumniProfile: { select: { graduationYear: true, company: true } } } } },
      },
    },
  });
  res.json({ success: true, data: conversation });
}));

// GET /conversations/:id/messages
router.get('/conversations/:id/messages', asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: req.params.id, userId: req.user.id } },
  });
  if (!participant) throw new ApiError(403, 'Not a participant');

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [messages, total] = await prisma.$transaction([
    prisma.message.findMany({
      where: { conversationId: req.params.id },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      skip, take: parseInt(limit),
    }),
    prisma.message.count({ where: { conversationId: req.params.id } }),
  ]);

  res.json({ success: true, data: { messages: messages.reverse(), pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } } });
}));

// POST /conversations/:id/messages
router.post('/conversations/:id/messages', asyncHandler(async (req, res) => {
  const { content, attachments } = req.body;
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: req.params.id, userId: req.user.id } },
  });
  if (!participant) throw new ApiError(403, 'Not a participant');

  const message = await prisma.message.create({
    data: {
      conversationId: req.params.id,
      senderId: req.user.id,
      content,
      attachments: attachments || [],
      readBy: [req.user.id],
    },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });

  // Update conversation
  await prisma.conversation.update({ where: { id: req.params.id }, data: { lastContent: content, lastSenderId: req.user.id, lastMsgAt: new Date() } });

  // Increment unread for others
  await prisma.conversationParticipant.updateMany({
    where: { conversationId: req.params.id, userId: { not: req.user.id } },
    data: { unreadCount: { increment: 1 } },
  });

  res.status(201).json({ success: true, data: message });
}));

// PUT /conversations/:id/read
router.put('/conversations/:id/read', asyncHandler(async (req, res) => {
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId: req.params.id, userId: req.user.id } },
    data: { unreadCount: 0 },
  });
  res.json({ success: true, message: 'Marked as read' });
}));

export default router;
