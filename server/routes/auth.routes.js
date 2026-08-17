import { Router } from 'express';
import {
  register, login, logout, refreshToken,
  verifyEmail, resendVerificationEmail, forgotPassword, resetPassword, getMe,
} from '../controllers/auth.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter, resendLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendLimiter, optionalAuth, resendVerificationEmail);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);
router.get('/me', protect, getMe);

export default router;
