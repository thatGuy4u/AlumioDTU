import { Resend } from 'resend';

let resend = null;
let isConfigured = false;
let isInitialized = false;

/**
 * Initialize the Resend client (called lazily on first use).
 * This avoids the ESM import-hoisting problem where env vars
 * aren't loaded yet when the module's top-level code runs.
 */
function init() {
  if (isInitialized) return;
  isInitialized = true;

  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('your_')) {
    resend = new Resend(process.env.RESEND_API_KEY);
    isConfigured = true;
    console.log('✅ Resend email client ready');
  } else {
    console.warn('⚠️  Email not configured — RESEND_API_KEY missing or still set to placeholder. Emails will be skipped.');
  }
}

/**
 * Send an email via Resend. Returns silently if not configured.
 * @param {{ from: string, to: string, subject: string, html: string }} options
 */
export async function sendMail(options) {
  init();

  if (!resend || !isConfigured) {
    console.log(`[SKIPPED] Email to ${options.to}: ${options.subject}`);
    return null;
  }

  const { data, error } = await resend.emails.send({
    from: options.from || process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    throw new Error(`Resend email error: ${error.message}`);
  }

  return data;
}

export default resend;
export { isConfigured };
