import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sanitizeUser } from '../utils/sanitize.js';
import {
  generateAccessToken, generateRefreshToken, generateRandomToken, setRefreshTokenCookie,
} from '../services/token.service.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service.js';
import jwt from 'jsonwebtoken';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Guard: never allow admin self-registration
  const safeRole = role === 'alumni' ? 'alumni' : 'student';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(400, 'An account with this email already exists');

  const verificationToken = generateRandomToken();
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name, email, password: hashedPassword, role: safeRole,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  // Create empty profile
  if (safeRole === 'student') {
    await prisma.studentProfile.create({ data: { userId: user.id } });
  } else {
    await prisma.alumniProfile.create({ data: { userId: user.id } });
  }

  sendVerificationEmail(email, name, verificationToken).catch(e => console.error('Email error:', e.message));

  const accessToken = generateAccessToken(user.id);
  const refreshTk = generateRefreshToken(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: refreshTk } });
  setRefreshTokenCookie(res, refreshTk);

  res.status(201).json({ success: true, message: 'Account created! Check your email to verify.', data: { user: sanitizeUser(user), accessToken } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, 'Invalid email or password');
  if (user.isBanned) throw new ApiError(403, 'Your account has been suspended. Contact admin.');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  const accessToken = generateAccessToken(user.id);
  const refreshTk = generateRefreshToken(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: refreshTk, lastLogin: new Date() } });
  setRefreshTokenCookie(res, refreshTk);

  res.json({ success: true, message: 'Login successful', data: { user: sanitizeUser(user), accessToken } });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user) await prisma.user.update({ where: { id: req.user.id }, data: { refreshToken: null } });
  res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out' });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'No refresh token');

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || user.refreshToken !== token) throw new ApiError(401, 'Invalid refresh token');

  const newAccess = generateAccessToken(user.id);
  const newRefresh = generateRefreshToken(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefresh } });
  setRefreshTokenCookie(res, newRefresh);
  res.json({ success: true, data: { accessToken: newAccess } });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await prisma.user.findFirst({
    where: { emailVerificationToken: req.params.token, emailVerificationExpires: { gt: new Date() } },
  });
  if (!user) throw new ApiError(400, 'Invalid or expired verification link');

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, emailVerificationToken: null, emailVerificationExpires: null },
  });
  res.json({ success: true, message: 'Email verified successfully!' });
});

export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw new ApiError(404, 'User not found');
  if (user.isEmailVerified) {
    return res.json({ success: true, message: 'Email is already verified.' });
  }

  const verificationToken = generateRandomToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  sendVerificationEmail(user.email, user.name, verificationToken).catch(e => console.error('Email error:', e.message));
  res.json({ success: true, message: 'Verification email resent! Check your inbox.' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (user) {
    const resetToken = generateRandomToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: resetToken, passwordResetExpires: new Date(Date.now() + 3600000) },
    });
    sendPasswordResetEmail(user.email, user.name, resetToken).catch(e => console.error('Email error:', e.message));
  }
  res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await prisma.user.findFirst({
    where: { passwordResetToken: req.params.token, passwordResetExpires: { gt: new Date() } },
  });
  if (!user) throw new ApiError(400, 'Invalid or expired reset link');

  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, passwordResetToken: null, passwordResetExpires: null },
  });
  res.json({ success: true, message: 'Password reset successfully.' });
});

export const getMe = asyncHandler(async (req, res) => {
  let profile = null;
  if (req.user.role === 'student') profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
  else if (req.user.role === 'alumni') profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });

  res.json({ success: true, data: { user: sanitizeUser(req.user), profile } });
});
