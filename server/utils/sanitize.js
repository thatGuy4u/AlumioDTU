/**
 * Strip sensitive fields from a user object before sending to the client.
 */
export const sanitizeUser = (user) => {
  const {
    password,
    refreshToken,
    emailVerificationToken,
    emailVerificationExpires,
    passwordResetToken,
    passwordResetExpires,
    ...safe
  } = user;
  return safe;
};
