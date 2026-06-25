import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useResetPasswordMutation } from '../../store/api/authApi';
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash, HiOutlineCheckCircle } from 'react-icons/hi2';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    try {
      await resetPassword({ token, password }).unwrap();
      setSuccess(true);
      setTimeout(() => navigate('/auth/login'), 3000);
    } catch (err) {
      setError(err.data?.message || 'Invalid or expired reset link');
    }
  };

  if (success) {
    return (
      <motion.div className="auth-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="auth-success-icon"><HiOutlineCheckCircle size={56} /></div>
        <h2 style={{ textAlign: 'center', marginBottom: 12 }}>Password Reset!</h2>
        <p style={{ textAlign: 'center', color: 'rgba(232,234,246,0.6)' }}>Redirecting to login...</p>
      </motion.div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <h1>Set New Password</h1>
        <p>Enter your new password below</p>
      </div>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <motion.div className="auth-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}
        <div className="auth-field">
          <label>NEW PASSWORD</label>
          <div className="auth-input-wrapper">
            <HiOutlineLockClosed className="auth-input-icon" size={18} />
            <input type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="auth-toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
            </button>
          </div>
        </div>
        <div className="auth-field">
          <label>CONFIRM PASSWORD</label>
          <div className="auth-input-wrapper">
            <HiOutlineLockClosed className="auth-input-icon" size={18} />
            <input type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="auth-submit-btn" disabled={isLoading}>
          {isLoading ? <span className="auth-spinner" /> : 'Reset Password →'}
        </button>
      </form>
      <div className="auth-footer">
        <p><Link to="/auth/login">Back to Login</Link></p>
      </div>
    </div>
  );
}
