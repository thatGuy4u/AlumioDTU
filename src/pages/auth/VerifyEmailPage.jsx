import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useVerifyEmailMutation } from '../../store/api/authApi';
import { updateUser, selectCurrentUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import { HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi2';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    const verify = async () => {
      try {
        await verifyEmail(token).unwrap();
        setStatus('success');
        // Update local user state so guards pick it up
        if (isAuthenticated) {
          dispatch(updateUser({ isEmailVerified: true }));
        }
      } catch {
        setStatus('error');
      }
    };
    if (token) verify();
  }, [token, verifyEmail, dispatch, isAuthenticated]);

  // Auto-redirect after successful verification if logged in
  useEffect(() => {
    if (status !== 'success' || !isAuthenticated) return;
    const timer = setTimeout(() => {
      if (!user?.isProfileComplete) {
        navigate('/app/onboarding', { replace: true });
      } else {
        navigate('/app/dashboard', { replace: true });
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [status, isAuthenticated, user, navigate]);

  return (
    <motion.div
      className="auth-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {status === 'verifying' && (
        <>
          <div className="auth-spinner-large" />
          <h2 style={{ textAlign: 'center', marginTop: 20 }}>Verifying your email...</h2>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="auth-success-icon"><HiOutlineCheckCircle size={56} /></div>
          <h2 style={{ textAlign: 'center', marginBottom: 12 }}>Email Verified! 🎉</h2>
          <p style={{ textAlign: 'center', color: 'rgba(232,234,246,0.6)', lineHeight: 1.7 }}>
            {isAuthenticated
              ? 'Redirecting you to complete your profile…'
              : 'Your email has been verified successfully. You can now log in.'}
          </p>
          {!isAuthenticated && (
            <Link to="/auth/login" className="auth-submit-btn" style={{ display: 'block', textAlign: 'center', marginTop: 24, textDecoration: 'none' }}>
              Go to Login →
            </Link>
          )}
        </>
      )}
      {status === 'error' && (
        <>
          <div className="auth-error-icon"><HiOutlineExclamationCircle size={56} /></div>
          <h2 style={{ textAlign: 'center', marginBottom: 12 }}>Verification Failed</h2>
          <p style={{ textAlign: 'center', color: 'rgba(232,234,246,0.6)', lineHeight: 1.7 }}>
            This verification link is invalid or has expired. Please request a new one.
          </p>
          <Link to="/auth/login" className="auth-submit-btn" style={{ display: 'block', textAlign: 'center', marginTop: 24, textDecoration: 'none' }}>
            Back to Login
          </Link>
        </>
      )}
    </motion.div>
  );
}
