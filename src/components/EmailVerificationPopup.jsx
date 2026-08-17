import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectCurrentUser, selectToken } from '../store/slices/authSlice';
import axios from 'axios';
import { API_URL } from '../utils/constants';
import toast from 'react-hot-toast';
import {
  HiOutlineEnvelope, HiOutlineExclamationTriangle,
  HiOutlineArrowPath, HiOutlineCheckCircle,
} from 'react-icons/hi2';

const COOLDOWN_SECONDS = 60;

/**
 * EmailVerificationPopup — beautiful modal shown on onboarding when email is unverified.
 * Shows once per session (tracked via sessionStorage).
 */
export default function EmailVerificationPopup() {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);
  const [isOpen, setIsOpen] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!user || user.isEmailVerified) return;
    const key = `alumiodtu_email_popup_shown_${user.id}`;
    if (sessionStorage.getItem(key)) return;
    // Small delay so onboarding page renders first
    const timer = setTimeout(() => setIsOpen(true), 600);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleClose = () => {
    setIsOpen(false);
    if (user) {
      sessionStorage.setItem(`alumiodtu_email_popup_shown_${user.id}`, 'true');
    }
  };

  const handleResend = async () => {
    if (resending || cooldown > 0) return;
    setResending(true);
    try {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      await axios.post(`${API_URL}/auth/resend-verification`, { email: user?.email }, { headers });
      toast.success('Verification email resent! Check your inbox.');
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend email');
    }
    setResending(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!user || user.isEmailVerified) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="report-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="modal-content email-verify-popup"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
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
                <HiOutlineEnvelope size={36} />
              </motion.div>
              <div className="email-verify-icon-ring" />
              <div className="email-verify-icon-ring ring-2" />
            </div>

            {/* Title */}
            <motion.h2
              className="email-verify-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Verify Your Email
            </motion.h2>

            {/* Message */}
            <motion.p
              className="email-verify-message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              A verification link has been sent to your registered email address:
            </motion.p>

            <motion.div
              className="email-verify-email-badge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 }}
            >
              <HiOutlineEnvelope size={14} />
              <span>{user.email}</span>
            </motion.div>

            {/* Warning */}
            <motion.div
              className="email-verify-warning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <HiOutlineExclamationTriangle size={18} />
              <p>
                Please verify your email within <strong>7 days</strong>. Unverified accounts may be
                deleted by the admin.
              </p>
            </motion.div>

            {/* Actions */}
            <motion.div
              className="email-verify-actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
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
              <button className="email-verify-continue-btn" onClick={handleClose}>
                <HiOutlineCheckCircle size={16} />
                Got it, Continue
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
