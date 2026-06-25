import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) throw new ApiError(401, 'Not authorized — no token provided');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) throw new ApiError(401, 'User no longer exists');
    if (user.isBanned) throw new ApiError(403, 'Your account has been suspended');
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') throw new ApiError(401, 'Token expired');
    if (error.name === 'JsonWebTokenError') throw new ApiError(401, 'Invalid token');
    throw error;
  }
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) token = req.headers.authorization.split(' ')[1];
  else if (req.cookies?.accessToken) token = req.cookies.accessToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await prisma.user.findUnique({ where: { id: decoded.id } });
    } catch { /* silent */ }
  }
  next();
});
