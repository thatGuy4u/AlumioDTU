import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLoginMutation } from '../../store/api/authApi';
import { BYPASS_AUTH_FOR_TESTING } from '../../utils/constants';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

export default function LoginPage() {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (BYPASS_AUTH_FOR_TESTING) {
      navigate('/app/dashboard');
      return;
    }

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();
      if (result.success) {
        const loggedInUser = result.data.user;
        if (!loggedInUser.isProfileComplete) {
          navigate('/app/onboarding');
        } else {
          navigate('/app/dashboard');
        }
      }
    } catch (err) {
      setError(err.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <h1>Welcome Back</h1>
        <p>Sign in to your AlumioDTU account</p>
        {BYPASS_AUTH_FOR_TESTING && (
          <p style={{ marginTop: 8, fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
            Auth bypass active — click Sign In to enter the app
          </p>
        )}
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

        <div className="auth-field">
          <label htmlFor="login-email">EMAIL</label>
          <div className="auth-input-wrapper">
            <HiOutlineEnvelope className="auth-input-icon" size={18} />
            <input
              id="login-email"
              type="email"
              placeholder="you@dtu.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">PASSWORD</label>
          <div className="auth-input-wrapper">
            <HiOutlineLockClosed className="auth-input-icon" size={18} />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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

        <div className="auth-extras">
          <Link to="/auth/forgot-password" className="auth-forgot-link">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="auth-spinner" />
          ) : (
            'Sign In →'
          )}
        </button>
      </form>

      <div className="auth-footer">
        <p>Don&apos;t have an account?{' '}
          <Link to="/auth/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
