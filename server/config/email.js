import nodemailer from 'nodemailer';

let transporter = null;
let isConfigured = false;

// Only create transporter if SMTP credentials are provided
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    && !process.env.SMTP_USER.includes('your_')) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Verify connection on startup (non-blocking)
  transporter.verify().then(() => {
    isConfigured = true;
    console.log('Email transporter ready');
  }).catch((err) => {
    console.warn('⚠️  Email transporter failed verification:', err.message);
  });
} else {
  console.warn('⚠️  Email not configured — SMTP credentials missing or still set to placeholder values. Emails will be skipped.');
}

/**
 * Send an email. Returns silently if SMTP is not configured.
 */
export async function sendMail(options) {
  if (!transporter || !isConfigured) {
    console.log(`[SKIPPED] Email to ${options.to}: ${options.subject}`);
    return null;
  }
  return transporter.sendMail(options);
}

export default transporter;
export { isConfigured };
