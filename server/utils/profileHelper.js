import prisma from '../config/db.js';

/**
 * Fetch a user's role-specific profile (student or alumni).
 * Eliminates the duplicated if/else role-check pattern.
 */
export async function getProfileByRole(userId, role) {
  if (role === 'student') {
    return prisma.studentProfile.findUnique({ where: { userId } });
  }
  if (role === 'alumni') {
    return prisma.alumniProfile.findUnique({ where: { userId } });
  }
  return null;
}
