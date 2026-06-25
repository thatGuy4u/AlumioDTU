import transporter from '../config/email.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Send email verification email.
 */
export const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${CLIENT_URL}/auth/verify-email/${token}`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f2e; color: #e8eaf6; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #F5C842; font-size: 28px; margin: 0;">Alumio<span style="color: #00d4c8;">DTU</span></h1>
      </div>
      <h2 style="color: #fff; margin-bottom: 8px;">Welcome, ${name}! 🎓</h2>
      <p style="color: rgba(232,234,246,0.7); line-height: 1.7;">
        Thank you for joining AlumioDTU. Please verify your email address to activate your account and start connecting with the DTU community.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyUrl}" 
           style="background: linear-gradient(135deg, #F5C842, #c9a227); color: #0a0f2e; padding: 14px 36px; border-radius: 50px; font-weight: 700; font-size: 16px; text-decoration: none; display: inline-block;">
          Verify Email Address →
        </a>
      </div>
      <p style="color: rgba(232,234,246,0.4); font-size: 13px;">
        This link expires in 24 hours. If you didn't create this account, please ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
      <p style="color: rgba(232,234,246,0.3); font-size: 12px; text-align: center;">
        AlumioDTU — Digital Bridges, Real Connections | Delhi Technological University
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '✉️ Verify your AlumioDTU account',
    html,
  });
};

/**
 * Send password reset email.
 */
export const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${CLIENT_URL}/auth/reset-password/${token}`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f2e; color: #e8eaf6; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #F5C842; font-size: 28px; margin: 0;">Alumio<span style="color: #00d4c8;">DTU</span></h1>
      </div>
      <h2 style="color: #fff; margin-bottom: 8px;">Password Reset Request</h2>
      <p style="color: rgba(232,234,246,0.7); line-height: 1.7;">
        Hi ${name}, we received a request to reset your password. Click the button below to set a new password.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" 
           style="background: linear-gradient(135deg, #F5C842, #c9a227); color: #0a0f2e; padding: 14px 36px; border-radius: 50px; font-weight: 700; font-size: 16px; text-decoration: none; display: inline-block;">
          Reset Password →
        </a>
      </div>
      <p style="color: rgba(232,234,246,0.4); font-size: 13px;">
        This link expires in 1 hour. If you didn't request this, please ignore this email — your password will remain unchanged.
      </p>
      <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
      <p style="color: rgba(232,234,246,0.3); font-size: 12px; text-align: center;">
        AlumioDTU — Digital Bridges, Real Connections | Delhi Technological University
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '🔐 Reset your AlumioDTU password',
    html,
  });
};

/**
 * Send generic notification email.
 */
export const sendNotificationEmail = async (email, subject, name, body) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f2e; color: #e8eaf6; padding: 40px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #F5C842; font-size: 28px; margin: 0;">Alumio<span style="color: #00d4c8;">DTU</span></h1>
      </div>
      <h2 style="color: #fff; margin-bottom: 8px;">Hi ${name},</h2>
      <div style="color: rgba(232,234,246,0.7); line-height: 1.7;">
        ${body}
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${CLIENT_URL}/app/dashboard" 
           style="background: linear-gradient(135deg, #F5C842, #c9a227); color: #0a0f2e; padding: 14px 36px; border-radius: 50px; font-weight: 700; font-size: 16px; text-decoration: none; display: inline-block;">
          Open Dashboard →
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
      <p style="color: rgba(232,234,246,0.3); font-size: 12px; text-align: center;">
        AlumioDTU — Digital Bridges, Real Connections
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    html,
  });
};
