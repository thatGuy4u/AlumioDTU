import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
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
  console.log('📧 Email transporter ready');
}).catch((err) => {
  console.warn('⚠️  Email transporter not configured:', err.message);
});

export default transporter;
