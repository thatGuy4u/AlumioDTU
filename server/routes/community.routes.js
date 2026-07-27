import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import prisma from '../config/db.js';

const router = Router();
router.use(protect);

// GET /posts
router.get('/posts', asyncHandler(async (req, res) => {
  const { category, search, tags, sort = 'newest', page = 1, limit = 15 } = req.query;
  const where = { isModerated: false };
  if (category && category !== 'all') where.category = category;
  if (tags) where.tags = { hasSome: tags.split(',').map(t => t.trim().toLowerCase()) };
  if (search) where.title = { contains: search, mode: 'insensitive' };

  const orderBy = sort === 'trending' ? [{ upvoteCount: 'desc' }, { createdAt: 'desc' }] : sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({ where, skip, take: parseInt(limit), orderBy, include: { author: { select: { id: true, name: true, avatar: true, role: true } } } }),
    prisma.post.count({ where }),
  ]);
  res.json({ success: true, data: { posts, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } } });
}));

// GET /posts/:id
router.get('/posts/:id', asyncHandler(async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id }, include: { author: { select: { id: true, name: true, avatar: true, role: true } } } });
  if (!post) throw new ApiError(404, 'Post not found');
  const comments = await prisma.comment.findMany({ where: { postId: post.id }, orderBy: { createdAt: 'asc' }, include: { author: { select: { id: true, name: true, avatar: true, role: true } } } });
  const hasUpvoted = !!(await prisma.postUpvote.findUnique({ where: { postId_userId: { postId: post.id, userId: req.user.id } } }));
  res.json({ success: true, data: { post, comments, hasUpvoted } });
}));

// POST /posts
router.post('/posts', asyncHandler(async (req, res) => {
  const post = await prisma.post.create({ data: { ...req.body, authorId: req.user.id }, include: { author: { select: { id: true, name: true, avatar: true, role: true } } } });
  res.status(201).json({ success: true, data: post });
}));

// PUT /posts/:id
router.put('/posts/:id', asyncHandler(async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) throw new ApiError(404, 'Post not found');
  if (post.authorId !== req.user.id) throw new ApiError(403, 'Not your post');
  const { title, content, category, tags } = req.body;
  const updated = await prisma.post.update({ where: { id: req.params.id }, data: { title, content, category, tags } });
  res.json({ success: true, data: updated });
}));

// DELETE /posts/:id
router.delete('/posts/:id', asyncHandler(async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) throw new ApiError(404, 'Post not found');
  if (post.authorId !== req.user.id && req.user.role !== 'admin') throw new ApiError(403, 'Not authorized');
  await prisma.post.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Post deleted' });
}));

// POST /posts/:id/upvote (toggle)
router.post('/posts/:id/upvote', asyncHandler(async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) throw new ApiError(404, 'Post not found');
  const existing = await prisma.postUpvote.findUnique({ where: { postId_userId: { postId: post.id, userId: req.user.id } } });
  if (existing) {
    await prisma.postUpvote.delete({ where: { id: existing.id } });
    await prisma.post.update({ where: { id: post.id }, data: { upvoteCount: { decrement: 1 } } });
    res.json({ success: true, data: { upvoteCount: post.upvoteCount - 1, upvoted: false } });
  } else {
    await prisma.postUpvote.create({ data: { postId: post.id, userId: req.user.id } });
    await prisma.post.update({ where: { id: post.id }, data: { upvoteCount: { increment: 1 } } });
    res.json({ success: true, data: { upvoteCount: post.upvoteCount + 1, upvoted: true } });
  }
}));

// POST /posts/:id/comments
router.post('/posts/:id/comments', asyncHandler(async (req, res) => {
  const { content, parentCommentId } = req.body;
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) throw new ApiError(404, 'Post not found');
  const comment = await prisma.comment.create({ data: { postId: post.id, authorId: req.user.id, content, parentCommentId: parentCommentId || null }, include: { author: { select: { id: true, name: true, avatar: true, role: true } } } });
  await prisma.post.update({ where: { id: post.id }, data: { commentCount: { increment: 1 } } });
  res.status(201).json({ success: true, data: comment });
}));

// DELETE /comments/:id — Reddit-style soft-delete
router.delete('/comments/:id', asyncHandler(async (req, res) => {
  const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
  if (!comment) throw new ApiError(404, 'Comment not found');
  if (comment.authorId !== req.user.id && req.user.role !== 'admin') throw new ApiError(403, 'Not authorized');

  const deletedByAdmin = comment.authorId !== req.user.id && req.user.role === 'admin';

  // Check if the comment has any child replies
  const childCount = await prisma.comment.count({ where: { parentCommentId: comment.id } });

  if (childCount > 0) {
    // Soft-delete: preserve thread hierarchy, blank out content
    const deletedContent = deletedByAdmin ? '[deleted by admin]' : '[deleted]';
    await prisma.comment.update({
      where: { id: req.params.id },
      data: { isDeleted: true, content: deletedContent },
    });
    await prisma.post.update({ where: { id: comment.postId }, data: { commentCount: { decrement: 1 } } });
    res.json({ success: true, message: 'Comment deleted', data: { softDeleted: true, deletedByAdmin } });
  } else {
    // Hard-delete: no children, safe to remove completely
    await prisma.post.update({ where: { id: comment.postId }, data: { commentCount: { decrement: 1 } } });
    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Comment deleted', data: { softDeleted: false, deletedByAdmin } });
  }
}));

// GET /trending
router.get('/trending', asyncHandler(async (req, res) => {
  const posts = await prisma.post.findMany({ where: { isModerated: false }, orderBy: [{ upvoteCount: 'desc' }, { commentCount: 'desc' }], take: 10, include: { author: { select: { id: true, name: true, avatar: true, role: true } } } });
  res.json({ success: true, data: posts });
}));

// GET /tags
router.get('/tags', asyncHandler(async (req, res) => {
  const posts = await prisma.post.findMany({ select: { tags: true } });
  const tagCounts = {};
  posts.forEach(p => p.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const tags = Object.entries(tagCounts).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count).slice(0, 30);
  res.json({ success: true, data: tags });
}));

// POST /reports — submit a report and notify admins
router.post('/reports', asyncHandler(async (req, res) => {
  const { reason, description, contentType, contentId } = req.body;
  if (!reason || !contentType || !contentId) {
    throw new ApiError(400, 'Reason, contentType, and contentId are required');
  }

  // Look up the owner of the reported content to set reportedUserId
  let reportedUserId = null;
  if (contentType === 'post') {
    const post = await prisma.post.findUnique({ where: { id: contentId }, select: { authorId: true } });
    if (post) reportedUserId = post.authorId;
  } else if (contentType === 'comment') {
    const comment = await prisma.comment.findUnique({ where: { id: contentId }, select: { authorId: true } });
    if (comment) reportedUserId = comment.authorId;
  } else if (contentType === 'user') {
    reportedUserId = contentId;
  }

  // Prevent self-reporting
  if (reportedUserId === req.user.id) {
    throw new ApiError(400, 'You cannot report your own content');
  }

  // Create the report
  const report = await prisma.report.create({
    data: {
      reporterId: req.user.id,
      reportedUserId,
      contentId,
      contentType,
      reason,
      description: description || null,
    },
  });

  // Notify all admin users
  const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } });
  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map(admin => ({
        recipientId: admin.id,
        type: 'system_notification',
        title: `New ${contentType} report`,
        message: `${req.user.name} reported a ${contentType} for ${reason}${description ? ': ' + description.slice(0, 100) : ''}`,
        link: '/app/admin/moderation',
        relatedId: report.id,
      })),
    });
  }

  res.status(201).json({ success: true, message: 'Report submitted successfully' });
}));

export default router;
