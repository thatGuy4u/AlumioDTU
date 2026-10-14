import { escapeHtml } from './escapeHtml.js';

/**
 * Build the contact form email HTML.
 * Shared by both the public (server.js) and authenticated (users.routes.js) contact endpoints.
 *
 * @param {object} params
 * @param {string} params.name - Sender name (user-supplied, will be escaped)
 * @param {string} params.email - Sender email (user-supplied, will be escaped)
 * @param {string} params.subject - Email subject (user-supplied, will be escaped)
 * @param {string} params.message - Message body (user-supplied, will be escaped)
 * @param {boolean} [params.isPublic=false] - Whether this is the public (unauthenticated) form
 */
export function buildContactEmailHtml({ name, email, subject, message, isPublic = false }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  const label = isPublic ? 'Public Contact Form' : 'Contact Form Submission';

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f2e; color: #e8eaf6; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #F5C842; font-size: 28px; margin: 0;">Alumio<span style="color: #00d4c8;">DTU</span></h1>
      </div>
      <h2 style="color: #fff; margin-bottom: 8px;">New Contact Message${isPublic ? ' (Public)' : ''}</h2>
      <p style="color: rgba(232,234,246,0.7);"><strong>From:</strong> ${safeName} (${safeEmail})</p>
      <p style="color: rgba(232,234,246,0.7);"><strong>Subject:</strong> ${safeSubject}</p>
      <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 16px 0;" />
      <div style="color: rgba(232,234,246,0.7); line-height: 1.7;">${safeMessage}</div>
      <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
      <p style="color: rgba(232,234,246,0.3); font-size: 12px; text-align: center;">AlumioDTU — ${label}</p>
    </div>
  `;
}
