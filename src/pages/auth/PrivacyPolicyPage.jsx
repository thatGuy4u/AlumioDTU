import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  return (
    <div className="auth-layout" style={{ overflow: 'auto' }}>
      <div className="auth-bg">
        <div className="auth-bg-gradient" />
        <div className="auth-bg-grid" />
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 800, margin: '0 auto', padding: '60px 24px 80px' }}>
        <Link to="/" style={{ color: 'var(--accent, #F5C842)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, marginBottom: 16, display: 'inline-block' }}>
          ← Back to Home
        </Link>

        <motion.div className="privacy-page" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Privacy Policy</h1>
          <p className="privacy-date">Last updated: July 2026</p>

          <p>
            At AlumioDTU, we are committed to protecting your privacy and ensuring the security of your personal information.
            This Privacy Policy describes how we collect, use, and safeguard your data when you use our platform.
          </p>

          <h2>1. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, password (encrypted), and role (student/alumni) provided during registration.</li>
            <li><strong>Profile Information:</strong> Branch, graduation year, skills, bio, career goals, resume, company, designation, and other professional details you voluntarily provide.</li>
            <li><strong>Avatar &amp; Media:</strong> Profile pictures and uploaded files stored securely via Cloudinary.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with the platform — pages visited, features used, mentorship requests, job applications, event registrations, community posts, and comments.</li>
            <li><strong>Communication Data:</strong> Messages sent through our messaging system and contact form submissions.</li>
            <li><strong>Device Information:</strong> Browser type, IP address, and device information collected automatically for security and analytics.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>Your information is used to:</p>
          <ul>
            <li>Create and manage your account on the platform</li>
            <li>Facilitate mentorship connections between students and alumni</li>
            <li>Enable job posting, applications, and recruitment features</li>
            <li>Organize and manage community events and discussions</li>
            <li>Send email notifications for account activity, mentorship requests, and password changes</li>
            <li>Improve and personalize your experience on the platform</li>
            <li>Ensure platform security and prevent abuse</li>
            <li>Generate anonymized analytics for platform improvement</li>
          </ul>

          <h2>3. Data Sharing</h2>
          <p>
            We do <strong>not</strong> sell your personal data to third parties. Your information may be shared in the following limited circumstances:
          </p>
          <ul>
            <li><strong>Other Users:</strong> Your profile information (name, avatar, bio, skills) is visible to other registered users of the platform to facilitate networking and mentorship.</li>
            <li><strong>Service Providers:</strong> We use trusted third-party services for email delivery (Resend), file storage (Cloudinary), and database hosting (PostgreSQL) — all subject to their own privacy policies.</li>
            <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect the rights and safety of our users.</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data:
          </p>
          <ul>
            <li>Passwords are hashed using bcrypt with a salt factor of 12</li>
            <li>All API communications use HTTPS encryption</li>
            <li>JWT tokens with short expiry are used for authentication</li>
            <li>Rate limiting protects against brute-force attacks</li>
            <li>Input validation and sanitization prevent injection attacks</li>
          </ul>

          <h2>5. Data Retention</h2>
          <p>
            Your account data is retained as long as your account is active. You can request deletion of your account at any time through the Settings page, which will permanently remove all your associated data from our systems.
          </p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and download your personal data</li>
            <li>Update or correct your profile information at any time</li>
            <li>Delete your account and all associated data</li>
            <li>Opt out of non-essential email notifications</li>
          </ul>

          <h2>7. Cookies</h2>
          <p>
            We use essential cookies (httpOnly refresh tokens) for authentication. We do not use third-party tracking cookies or advertising cookies.
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify users of significant changes through email or platform notifications.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact us at{' '}
            <a href="mailto:alumiodtu@gmail.com" style={{ color: 'var(--accent, #F5C842)', fontWeight: 600 }}>alumiodtu@gmail.com</a>.
          </p>

          <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              © 2026 AlumioDTU — Delhi Technological University
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
