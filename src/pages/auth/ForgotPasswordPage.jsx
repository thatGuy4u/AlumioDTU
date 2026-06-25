import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForgotPasswordMutation } from '../../store/api/authApi';
import { HiOutlineEnvelope, HiOutlineCheckCircle } from 'react-icons/hi2';

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email'); return; }

    try {
      await forgotPassword({ email }).unwrap();
      setSent(true);
    } catch (err) {
      setError(err.data?.message || 'Something went wrong');
    }
  };

  if (sent) {
    return (
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="auth-success-icon">
          <HiOutlineCheckCircle size={56} />
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: 12 }}>Check Your Email</h2>
        <p style={{ textAlign: 'center', color: 'rgba(232,234,246,0.6)', lineHeight: 1.7 }}>
          If an account with <strong>{email}</strong> exists, we've sent a password reset link. Please check your inbox.
        </p>
        <Link to="/auth/login" className="auth-submit-btn" style={{ display: 'block', textAlign: 'center', marginTop: 24, textDecoration: 'none' }}>
          Back to Login
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <h1>Reset Password</h1>
        <p>Enter your email and we'll send you a reset link</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {error && (
          <motion.div className="auth-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {error}
          </motion.div>
        )}

        <div className="auth-field">
          <label htmlFor="forgot-email">EMAIL</label>
          <div className="auth-input-wrapper">
            <HiOutlineEnvelope className="auth-input-icon" size={18} />
            <input
              id="forgot-email"
              type="email"
              placeholder="you@dtu.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="auth-submit-btn" disabled={isLoading}>
          {isLoading ? <span className="auth-spinner" /> : 'Send Reset Link →'}
        </button>
      </form>

      <div className="auth-footer">
        <p>Remember your password?{' '}
          <Link to="/auth/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
