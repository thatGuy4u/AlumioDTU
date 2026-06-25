import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

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

const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
initializeSocket(io);

app.set('io', io);
app.set('prisma', prisma);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
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
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { app, io };
