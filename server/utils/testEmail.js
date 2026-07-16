/**
 * Quick test script to verify Resend email is working.
 * Run with: node utils/testEmail.js
 *
 * Usage:
 *   node utils/testEmail.js                     → sends to ADMIN_EMAIL from .env
 *   node utils/testEmail.js you@example.com     → sends to specified email
 */
import dotenv from 'dotenv';
dotenv.config();

import { sendMail } from '../config/email.js';

const to = process.argv[2] || process.env.ADMIN_EMAIL;

async function testEmail() {
  console.log('📧 Sending test email...');
  console.log(`   From: ${process.env.EMAIL_FROM}`);
  console.log(`   To:   ${to}`);
  console.log(`   API Key: ${process.env.RESEND_API_KEY?.slice(0, 8)}...`);
  console.log();

  try {
    const result = await sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: '✅ AlumioDTU — Email Test Successful!',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f2e; color: #e8eaf6; padding: 40px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #F5C842; font-size: 28px; margin: 0;">Alumio<span style="color: #00d4c8;">DTU</span></h1>
          </div>
          <h2 style="color: #fff; margin-bottom: 8px;">Email is working! 🎉</h2>
          <p style="color: rgba(232,234,246,0.7); line-height: 1.7;">
            This is a test email from AlumioDTU. If you're reading this, your Resend integration is set up correctly.
          </p>
          <p style="color: rgba(232,234,246,0.4); font-size: 13px; margin-top: 24px;">
            Sent at: ${new Date().toISOString()}
          </p>
        </div>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log('   Response:', JSON.stringify(result));
  } catch (error) {
    console.error('❌ Email failed:', error.message);
  }

  process.exit(0);
}

testEmail();
