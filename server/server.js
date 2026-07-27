import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// TODO [PRODUCTION]: In production, load env vars from hosting provider (e.g., Vercel, Render)
// rather than dotenv. Consider using dotenv-safe for validation.

import prisma from './config/db.js';
import { initializeSocket } from './config/socket.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import mentorshipRoutes from './routes/mentorship.routes.js';
import chatRoutes from './routes/chat.routes.js';
import jobRoutes from './routes/jobs.routes.js';
import eventRoutes from './routes/events.routes.js';
import communityRoutes from './routes/community.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Parse allowed origins from env (comma-separated) for CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [process.env.CLIENT_URL || 'http://localhost:5173'];

const io = new SocketServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
initializeSocket(io);

app.set('io', io);
app.set('prisma', prisma);

// TODO [PRODUCTION]: Tighten helmet settings, enable HSTS, configure CSP
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: allowedOrigins, credentials: true }));
// TODO [PRODUCTION]: Use a structured logger (e.g., pino, winston) instead of morgan
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// TODO [PRODUCTION]: Consider stricter rate limits and per-route limits for auth endpoints
app.use('/api/', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'AlumioDTU API', database: 'PostgreSQL' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Public contact form (no auth required) — for pre-login landing page
app.post('/api/contact', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const { sendMail } = await import('./config/email.js');
    await sendMail({
      from: process.env.EMAIL_FROM,
      to: 'alumiodtu@gmail.com',
      subject: `[AlumioDTU Contact] ${subject}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f2e; color: #e8eaf6; padding: 40px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #F5C842; font-size: 28px; margin: 0;">Alumio<span style="color: #00d4c8;">DTU</span></h1>
          </div>
          <h2 style="color: #fff; margin-bottom: 8px;">New Contact Message (Public)</h2>
          <p style="color: rgba(232,234,246,0.7);"><strong>From:</strong> ${name} (${email})</p>
          <p style="color: rgba(232,234,246,0.7);"><strong>Subject:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 16px 0;" />
          <div style="color: rgba(232,234,246,0.7); line-height: 1.7;">${message.replace(/\n/g, '<br>')}</div>
          <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
          <p style="color: rgba(232,234,246,0.3); font-size: 12px; text-align: center;">AlumioDTU — Public Contact Form</p>
        </div>
      `,
    });
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    next(err);
  }
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma');

    httpServer.listen(PORT, () => {
      console.log(`\n🚀 AlumioDTU API running on port ${PORT}`);
      console.log(`📡 Socket.io ready`);
      console.log(`🗄️  Database: PostgreSQL (Prisma ORM)`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
// TODO [PRODUCTION]: Add SIGTERM handler for container orchestration (Docker, Kubernetes)
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { app, io };
