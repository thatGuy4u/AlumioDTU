import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { selectCurrentUser, selectToken, selectIsAuthenticated, updateUser } from '../../store/slices/authSlice';
import { useGetMeQuery } from '../../store/api/authApi';
import { BYPASS_AUTH_FOR_TESTING } from '../../utils/constants';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import toast from 'react-hot-toast';
import {
  HiOutlineEnvelope, HiOutlineArrowPath,
  HiOutlineExclamationTriangle, HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2';
import { useLogoutMutation } from '../../store/api/authApi';

const COOLDOWN_SECONDS = 60;
const POLL_INTERVAL = 5000;

export default function PendingVerificationPage() {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Poll for email verification status (only if we have a valid session)
  const { data: meData, error: meError } = useGetMeQuery(undefined, {
    skip: !isAuthenticated || BYPASS_AUTH_FOR_TESTING || sessionExpired,
    pollingInterval: POLL_INTERVAL,
  });

  // Detect expired session from polling errors — stop hammering the server
  useEffect(() => {
    if (meError && (meError.status === 401 || meError.status === 403)) {
      setSessionExpired(true);
    }
  }, [meError]);

  // When the polled data shows email is verified, redirect
  useEffect(() => {
    if (meData?.success && meData.data.user?.isEmailVerified) {
      dispatch(updateUser({ isEmailVerified: true }));
      toast.success('Email verified! Let\'s set up your profile.');
      if (!meData.data.user?.isProfileComplete) {
        navigate('/app/onboarding', { replace: true });
      } else {
        navigate('/app/dashboard', { replace: true });
      }
    }
  }, [meData, dispatch, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // If not authenticated at all, redirect to login
  if (!BYPASS_AUTH_FOR_TESTING && !isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // If already verified, redirect forward
  if (user?.isEmailVerified) {
    if (!user.isProfileComplete) {
      return <Navigate to="/app/onboarding" replace />;
    }
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleResend = async () => {
    if (resending || cooldown > 0) return;
    setResending(true);
    try {
      const headers = {};
      if (token && !sessionExpired) headers.Authorization = `Bearer ${token}`;
      await axios.post(`${API_URL}/auth/resend-verification`, { email: user?.email }, { headers });
      toast.success('Verification email resent! Check your inbox.');
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend email');
    }
    setResending(false);
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch { /* ignore */ }
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="pending-verify-page">
      <motion.div
        className="pending-verify-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
      >
        {/* Animated envelope icon */}
        <div className="email-verify-icon-wrap">
          <motion.div
            className="email-verify-icon"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
          >
            <HiOutlineEnvelope size={40} />
          </motion.div>
          <div className="email-verify-icon-ring" />
          <div className="email-verify-icon-ring ring-2" />
        </div>

        {/* Title */}
        <motion.h1
          className="pending-verify-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Verify Your Email
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="pending-verify-subtitle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          We've sent a verification link to your email. Please click the link to verify your account and continue.
        </motion.p>

        {/* Email badge */}
        <motion.div
          className="email-verify-email-badge"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
        >
          <HiOutlineEnvelope size={14} />
          <span>{user?.email}</span>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="pending-verify-steps"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="pending-verify-step">
            <span className="pending-verify-step-num">1</span>
            <span>Open your email inbox</span>
          </div>
          <div className="pending-verify-step">
            <span className="pending-verify-step-num">2</span>
            <span>Click the verification link</span>
          </div>
          <div className="pending-verify-step">
            <span className="pending-verify-step-num">3</span>
            <span>{sessionExpired ? 'Log in again to continue' : 'Come back and complete your profile'}</span>
          </div>
        </motion.div>

        {/* Status indicator */}
        <motion.div
          className="pending-verify-status"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          {sessionExpired ? (
            <>
              <HiOutlineExclamationTriangle size={16} style={{ color: '#ff9800' }} />
              <span>Session expired — verify your email, then <Link to="/auth/login" style={{ color: '#7c4dff', textDecoration: 'underline' }}>log in again</Link></span>
            </>
          ) : (
            <>
              <span className="pending-verify-pulse" />
              <span>Waiting for verification…</span>
            </>
          )}
        </motion.div>

        {/* Warning */}
        <motion.div
          className="email-verify-warning"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <HiOutlineExclamationTriangle size={18} />
          <p>
            Please verify your email within <strong>24 hours</strong>. Check your spam folder if you don't see the email.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="pending-verify-actions"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <button
            className="email-verify-resend-btn"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
          >
            {resending ? (
              <span className="auth-spinner" />
            ) : cooldown > 0 ? (
              <>
                <HiOutlineArrowPath size={16} />
                Resend in {cooldown}s
              </>
            ) : (
              <>
                <HiOutlineArrowPath size={16} />
                Resend Email
              </>
            )}
          </button>
          <button className="pending-verify-logout-btn" onClick={handleLogout}>
            <HiOutlineArrowRightOnRectangle size={16} />
            Sign Out
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
