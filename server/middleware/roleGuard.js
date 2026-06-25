import { ApiError } from '../utils/ApiError.js';

/**
 * Restrict routes to specific roles.
 * Usage: roleGuard('admin') or roleGuard('alumni', 'admin')
 */
export const roleGuard = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Access denied. Required role(s): ${roles.join(', ')}`);
    }

    next();
  };
};

/**
 * Ensure email is verified before accessing certain routes.
 */
export const requireVerifiedEmail = (req, res, next) => {
  if (!req.user?.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email address first');
  }
  next();
};

/**
 * Ensure profile onboarding is complete.
 */
export const requireCompleteProfile = (req, res, next) => {
  if (!req.user?.isProfileComplete) {
    throw new ApiError(403, 'Please complete your profile onboarding first');
  }
  next();
};
