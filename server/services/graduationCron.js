import prisma from '../config/db.js';
import { createNotification } from './notification.service.js';
import { sendNotificationEmail } from './email.service.js';

/**
 * Graduation Transition Cron Job
 *
 * Runs daily to handle two tasks:
 * 1. JUNE+ of graduation year: Send notification + email to graduating students
 * 2. OCTOBER+ (after Sept 30 deadline): Hard-delete unconverted student accounts
 */
export async function runGraduationCheck(io) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed (Jan=1, Jun=6, Sep=9, Oct=10)

  console.log(`🎓 Running graduation check: ${now.toISOString()} (month=${currentMonth}, year=${currentYear})`);

  try {
    // ── Phase 1: Send notifications (June+ of graduation year) ──
    if (currentMonth >= 6) {
      await sendGraduationNotifications(currentYear, currentMonth, io);
    }

    // Also notify students whose graduation year has already passed (e.g., missed last year)
    await sendGraduationNotifications(currentYear - 1, currentMonth, io);

    // ── Phase 2: Delete unconverted accounts (after September 30) ──
    if (currentMonth >= 10) {
      await deleteUnconvertedAccounts(currentYear);
    }

    // Also purge any that slipped through from previous years
    await deleteUnconvertedAccounts(currentYear - 1);

  } catch (err) {
    console.error('❌ Graduation check error:', err);
  }
}

/**
 * Send graduation transition notifications to eligible students.
 */
async function sendGraduationNotifications(graduationYear, currentMonth, io) {
  const studentsToNotify = await prisma.studentProfile.findMany({
    where: {
      graduationYear: graduationYear,
      graduationTransitionNotified: false,
      user: { role: 'student', isBanned: false },
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (studentsToNotify.length === 0) return;

  console.log(`📢 Found ${studentsToNotify.length} graduating students (class of ${graduationYear}) to notify`);

  const isUrgent = currentMonth >= 9; // September = urgent

  for (const profile of studentsToNotify) {
    const user = profile.user;

    // Create in-app notification
    const title = isUrgent
      ? '⚠️ URGENT: Convert your account before September 30!'
      : '🎓 Congratulations on graduating!';

    const message = isUrgent
      ? `Your student account will be deleted on September 30, ${graduationYear}. Convert to alumni now to keep all your data, connections, and achievements.`
      : `As a Class of ${graduationYear} graduate, please convert your account to alumni to continue using AlumioDTU. Your student account will be deleted on September 30 if not converted.`;

    await createNotification({
      recipientId: user.id,
      type: 'graduation_transition',
      title,
      message,
      link: '/app/transition',
      io,
    });

    // Send email notification
    try {
      const emailBody = `
        <p>As a proud member of DTU's Class of ${graduationYear}, it's time to transition your student account to an alumni account.</p>
        <h3 style="color: #F5C842;">What happens next?</h3>
        <ul style="color: rgba(232,234,246,0.7); line-height: 2;">
          <li>✅ All your data (posts, messages, achievements) will be preserved</li>
          <li>✅ You'll get access to alumni-exclusive features like mentoring & job posting</li>
          <li>✅ Your connections and conversations stay intact</li>
        </ul>
        <p style="color: #ff6b6b; font-weight: 600;">⚠️ If you don't convert by September 30, ${graduationYear}, your account will be permanently deleted.</p>
        <p>Click the button below to start your transition:</p>
      `;
      await sendNotificationEmail(
        user.email,
        isUrgent
          ? `⚠️ URGENT: Your AlumioDTU student account will be deleted soon`
          : `🎓 Congratulations! Time to become an AlumioDTU alumni`,
        user.name,
        emailBody,
      );
    } catch (emailErr) {
      console.warn(`Failed to send graduation email to ${user.email}:`, emailErr.message);
    }

    // Mark as notified
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { graduationTransitionNotified: true },
    });
  }

  console.log(`✅ Sent ${studentsToNotify.length} graduation notifications`);
}

/**
 * Delete student accounts that haven't converted after September 30.
 */
async function deleteUnconvertedAccounts(graduationYear) {
  // Find students whose graduation year has passed and who haven't converted
  const expiredStudents = await prisma.studentProfile.findMany({
    where: {
      graduationYear: graduationYear,
      user: { role: 'student' }, // Still a student = never converted
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (expiredStudents.length === 0) return;

  console.log(`🗑️ Deleting ${expiredStudents.length} unconverted student accounts (class of ${graduationYear})`);

  for (const profile of expiredStudents) {
    try {
      // Send a final goodbye email before deletion
      try {
        const emailBody = `
          <p>Your student account on AlumioDTU has been deactivated because you did not convert to an alumni account before the September 30, ${graduationYear} deadline.</p>
          <p>If you believe this is an error or would like to rejoin, please contact us at alumiodtu@gmail.com.</p>
          <p style="color: rgba(232,234,246,0.4);">We wish you all the best in your future endeavors. 🎓</p>
        `;
        await sendNotificationEmail(
          profile.user.email,
          'Your AlumioDTU account has been removed',
          profile.user.name,
          emailBody,
        );
      } catch {
        /* best-effort email */
      }

      // Hard-delete the user (cascades to profile, messages, etc.)
      await prisma.user.delete({ where: { id: profile.user.id } });
      console.log(`  🗑️ Deleted: ${profile.user.name} (${profile.user.email})`);
    } catch (err) {
      console.error(`  ❌ Failed to delete ${profile.user.email}:`, err.message);
    }
  }

  console.log(`✅ Cleanup complete for class of ${graduationYear}`);
}
