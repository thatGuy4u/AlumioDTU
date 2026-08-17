import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRegisterMutation } from '../../store/api/authApi';
import {
  HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUser,
  HiOutlineEye, HiOutlineEyeSlash, HiOutlineAcademicCap, HiOutlineBriefcase,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';

export default function SignupPage() {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (role === 'student' && !/^[\w.-]+@dtu\.ac\.in$/.test(email)) {
      setError('Students must use a valid @dtu.ac.in email address');
      return;
    }
    if (role === 'alumni' && !/^[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!acceptedPolicy) {
      setError('Please accept the Privacy Policy to continue');
      return;
    }

    try {
      const result = await register({ name: name.trim(), email, password, role }).unwrap();
      if (result.success) {
        navigate('/app/pending-verification');
      }
    } catch (err) {
      setError(err.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <h1>Join AlumioDTU</h1>
        <p>Create your account and start connecting</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {error && (
          <motion.div
            className="auth-error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            {error}
          </motion.div>
        )}

        {/* Role Selector */}
        <div className="auth-role-selector">
          <button
            type="button"
            className={`auth-role-pill ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
          >
            <HiOutlineAcademicCap size={18} />
            <span>Student</span>
          </button>
          <button
            type="button"
            className={`auth-role-pill ${role === 'alumni' ? 'active' : ''}`}
            onClick={() => setRole('alumni')}
          >
            <HiOutlineBriefcase size={18} />
            <span>Alumni</span>
          </button>
          <motion.div
            className="auth-role-slider"
            animate={{ x: role === 'alumni' ? '100%' : '0%' }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, x: role === 'alumni' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: role === 'alumni' ? -20 : 20 }}
            transition={{ duration: 0.2 }}
          >
            <p className="auth-role-desc">
              {role === 'student'
                ? '🎓 Join as a current DTU student to find mentors, internships, and connect with alumni.'
                : '💼 Join as a DTU alumni to mentor students, post jobs, and give back to your community.'}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="auth-field">
          <label htmlFor="signup-name">FULL NAME</label>
          <div className="auth-input-wrapper">
            <HiOutlineUser className="auth-input-icon" size={18} />
            <input
              id="signup-name"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="signup-email">{role === 'student' ? 'DTU EMAIL' : 'EMAIL ADDRESS'}</label>
          <div className="auth-input-wrapper">
            <HiOutlineEnvelope className="auth-input-icon" size={18} />
            <input
              id="signup-email"
              type="email"
              placeholder={role === 'student' ? 'you@dtu.ac.in' : 'you@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <span className="auth-field-hint">
            {role === 'student'
              ? 'Only @dtu.ac.in emails accepted'
              : 'Any valid email address accepted'}
          </span>
        </div>

        <div className="auth-field">
          <label htmlFor="signup-password">PASSWORD</label>
          <div className="auth-input-wrapper">
            <HiOutlineLockClosed className="auth-input-icon" size={18} />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
            </button>
          </div>
        </div>

        <div className="auth-policy-check">
          <input
            type="checkbox"
            id="signup-policy"
            checked={acceptedPolicy}
            onChange={(e) => setAcceptedPolicy(e.target.checked)}
          />
          <label htmlFor="signup-policy">
            I accept the <Link to="/privacy-policy" target="_blank">Privacy Policy</Link> and agree to the collection and use of my data as described.
          </label>
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="auth-spinner" />
          ) : (
            'Create Account →'
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>Already have an account?{' '}
          <Link to="/auth/login">Sign in</Link>
        </p>
      </div>

      <AnimatePresence>
        {role === 'alumni' && (
          <motion.div
            className="auth-alumni-warning"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HiOutlineExclamationTriangle size={20} />
            <p>
              <strong>Warning:</strong> If you are a student and you sign up as alumni, your account will be <strong>banned permanently</strong> without prior notification.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
