import Joi from 'joi';

// ─── Community / Posts ───

export const createPostSchema = Joi.object({
  title: Joi.string().trim().min(3).max(300).required().messages({
    'string.min': 'Title must be at least 3 characters',
    'any.required': 'Title is required',
  }),
  content: Joi.string().trim().min(1).max(10000).required().messages({
    'any.required': 'Content is required',
  }),
  category: Joi.string().valid('placements', 'internships', 'higher_studies', 'startups', 'general').default('general'),
  tags: Joi.array().items(Joi.string().trim().lowercase().max(50)).max(10).default([]),
});

export const updatePostSchema = Joi.object({
  title: Joi.string().trim().min(3).max(300),
  content: Joi.string().trim().min(1).max(10000),
  category: Joi.string().valid('placements', 'internships', 'higher_studies', 'startups', 'general'),
  tags: Joi.array().items(Joi.string().trim().lowercase().max(50)).max(10),
});

export const createCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(5000).required().messages({
    'any.required': 'Comment content is required',
  }),
  parentCommentId: Joi.string().allow(null, '').optional(),
});

export const reportSchema = Joi.object({
  reason: Joi.string().valid('spam', 'harassment', 'inappropriate', 'misinformation', 'other').required(),
  description: Joi.string().trim().max(1000).allow(null, '').optional(),
  contentType: Joi.string().valid('post', 'comment', 'user').required(),
  contentId: Joi.string().required(),
});

// ─── Jobs ───

export const createJobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  company: Joi.string().trim().min(1).max(200).required(),
  type: Joi.string().valid('internship', 'full_time', 'part_time', 'contract').required(),
  workMode: Joi.string().valid('remote', 'onsite', 'hybrid').required(),
  location: Joi.string().trim().max(200).allow(null, '').optional(),
  description: Joi.string().trim().min(10).max(10000).required(),
  requirements: Joi.array().items(Joi.string().trim().max(500)).max(20).default([]),
  skills: Joi.array().items(Joi.string().trim().max(100)).max(20).default([]),
  stipendMin: Joi.number().integer().min(0).allow(null).optional(),
  stipendMax: Joi.number().integer().min(0).allow(null).optional(),
  salaryMin: Joi.number().integer().min(0).allow(null).optional(),
  salaryMax: Joi.number().integer().min(0).allow(null).optional(),
  currency: Joi.string().default('INR'),
  experienceMin: Joi.number().integer().min(0).default(0),
  experienceMax: Joi.number().integer().min(0).allow(null).optional(),
  applicationDeadline: Joi.date().iso().allow(null).optional(),
});

export const updateJobSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200),
  company: Joi.string().trim().min(1).max(200),
  type: Joi.string().valid('internship', 'full_time', 'part_time', 'contract'),
  workMode: Joi.string().valid('remote', 'onsite', 'hybrid'),
  location: Joi.string().trim().max(200).allow(null, ''),
  description: Joi.string().trim().min(10).max(10000),
  requirements: Joi.array().items(Joi.string().trim().max(500)).max(20),
  skills: Joi.array().items(Joi.string().trim().max(100)).max(20),
  stipendMin: Joi.number().integer().min(0).allow(null),
  stipendMax: Joi.number().integer().min(0).allow(null),
  salaryMin: Joi.number().integer().min(0).allow(null),
  salaryMax: Joi.number().integer().min(0).allow(null),
  currency: Joi.string(),
  experienceMin: Joi.number().integer().min(0),
  experienceMax: Joi.number().integer().min(0).allow(null),
  applicationDeadline: Joi.date().iso().allow(null),
  isActive: Joi.boolean(),
});

export const applicationStatusSchema = Joi.object({
  status: Joi.string().valid('applied', 'reviewed', 'shortlisted', 'rejected', 'hired').required(),
});

// ─── Events ───

export const createEventSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().min(10).max(10000).required(),
  type: Joi.string().valid('alumni_talk', 'webinar', 'networking', 'workshop', 'meetup').required(),
  date: Joi.date().iso().required(),
  endDate: Joi.date().iso().allow(null).optional(),
  location: Joi.string().trim().max(300).default('Online'),
  meetingLink: Joi.string().uri().allow(null, '').optional(),
  coverImage: Joi.string().allow(null, '').optional(),
  maxAttendees: Joi.number().integer().min(1).max(10000).default(100),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(10).default([]),
});

export const updateEventSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200),
  description: Joi.string().trim().min(10).max(10000),
  type: Joi.string().valid('alumni_talk', 'webinar', 'networking', 'workshop', 'meetup'),
  date: Joi.date().iso(),
  endDate: Joi.date().iso().allow(null),
  location: Joi.string().trim().max(300),
  meetingLink: Joi.string().uri().allow(null, ''),
  coverImage: Joi.string().allow(null, ''),
  maxAttendees: Joi.number().integer().min(1).max(10000),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(10),
  isActive: Joi.boolean(),
});

// ─── Mentorship ───

export const mentorshipRequestSchema = Joi.object({
  mentorId: Joi.string().required(),
  message: Joi.string().trim().min(10).max(2000).required().messages({
    'string.min': 'Please write at least 10 characters explaining why you want mentorship',
  }),
});

export const mentorshipSessionSchema = Joi.object({
  mentorshipRequestId: Joi.string().required(),
  scheduledAt: Joi.date().iso().required(),
  duration: Joi.number().integer().min(15).max(180).default(30),
  topic: Joi.string().trim().min(3).max(300).required(),
  meetingLink: Joi.string().uri().allow(null, '').optional(),
});

export const mentorshipFeedbackSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().max(2000).allow(null, '').optional(),
});

// ─── Chat ───

export const createMessageSchema = Joi.object({
  content: Joi.string().trim().min(1).max(5000).required(),
  attachments: Joi.array().items(Joi.object()).max(5).default([]),
});

// ─── Users / Profile ───

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required().messages({
    'string.min': 'New password must be at least 8 characters',
  }),
});

export const contactFormSchema = Joi.object({
  name: Joi.string().trim().max(200).allow(null, '').optional(),
  email: Joi.string().email().allow(null, '').optional(),
  subject: Joi.string().trim().min(1).max(300).required(),
  message: Joi.string().trim().min(1).max(5000).required(),
});

// ─── Admin ───

export const broadcastSchema = Joi.object({
  title: Joi.string().trim().min(1).max(300).required(),
  message: Joi.string().trim().min(1).max(5000).required(),
  audience: Joi.string().valid('all', 'students', 'alumni').required(),
  link: Joi.string().allow(null, '').optional(),
});
