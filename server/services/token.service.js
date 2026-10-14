import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Generate access token (short-lived).
 * Uses a dedicated access-token secret and includes a `type` claim
 * to prevent token confusion attacks.
 */
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'access' },
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' },
  );
};

/**
 * Generate refresh token (long-lived).
 * Uses a dedicated refresh-token secret and includes a `type` claim
 * to prevent token confusion attacks.
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' },
  );
};

/**
 * Verify an access token and return the decoded payload.
 * Rejects tokens that don't have type: 'access'.
 */
export const verifyAccessToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET);
  if (decoded.type !== 'access') throw new jwt.JsonWebTokenError('Invalid token type');
  return decoded;
};

/**
 * Verify a refresh token and return the decoded payload.
 * Rejects tokens that don't have type: 'refresh'.
 */
export const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  if (decoded.type !== 'refresh') throw new jwt.JsonWebTokenError('Invalid token type');
  return decoded;
};

/**
 * Generate a cryptographically secure random hex token for email verification / password reset.
 */
export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a token with SHA-256 for secure storage.
 * Used for refresh tokens, email verification tokens, and password reset tokens.
 * SHA-256 is appropriate because the tokens are already high-entropy,
 * so a fast hash suffices (no need for bcrypt).
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
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
