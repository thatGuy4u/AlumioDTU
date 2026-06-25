import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVerifyEmailMutation } from '../../store/api/authApi';
import { HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi2';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    const verify = async () => {
      try {
        await verifyEmail(token).unwrap();
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };
    if (token) verify();
  }, [token, verifyEmail]);

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
            Your email has been verified successfully. You now have full access to AlumioDTU.
          </p>
          <Link to="/app/dashboard" className="auth-submit-btn" style={{ display: 'block', textAlign: 'center', marginTop: 24, textDecoration: 'none' }}>
            Go to Dashboard →
          </Link>
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
