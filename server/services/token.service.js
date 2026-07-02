import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Generate access token (short-lived).
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  });
};

/**
 * Generate refresh token (long-lived).
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  });
};

/**
 * Generate a cryptographically secure random hex token for email verification / password reset.
 */
export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Set refresh token as httpOnly cookie.
 * Uses 'none' sameSite in production for cross-origin deployments (e.g. Vercel frontend + Render backend).
 */
export const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
