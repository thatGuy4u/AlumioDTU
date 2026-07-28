import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { selectCurrentUser, clearCredentials } from '../../store/slices/authSlice';
import { selectTheme, toggleTheme } from '../../store/slices/uiSlice';
import api from '../../utils/apiClient';
import {
  HiOutlineSun, HiOutlineMoon, HiOutlineBell,
  HiOutlineShieldCheck, HiOutlineLockClosed,
  HiOutlineTrash, HiOutlineArrowLeft,
  HiOutlineEye, HiOutlineEyeSlash,
  HiOutlinePaintBrush, HiOutlineExclamationTriangle,
} from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function SettingsPage() {
  const user = useSelector(selectCurrentUser);
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/users/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
    setChangingPassword(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    setDeletingAccount(true);
    try {
      await api.delete('/users/account');
      toast.success('Your account deletion request has been sent to admin and will be processed soon.', { duration: 5000 });
      setDeleteConfirm('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send deletion request');
    }
    setDeletingAccount(false);
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-header">
        <button className="onboarding-back-btn" onClick={() => navigate(-1)}>
          <HiOutlineArrowLeft size={18} /> Back
        </button>
        <h1>⚙️ <span className="text-gold">Settings</span></h1>
      </div>

      <motion.div className="edit-profile-grid" variants={container} initial="hidden" animate="show">
        {/* Appearance */}
        <motion.section className="edit-section" variants={item}>
          <h3><HiOutlinePaintBrush size={18} /> Appearance</h3>
          <div className="settings-option">
            <div className="settings-option-info">
              <strong>Theme</strong>
              <span>Switch between dark and light mode</span>
            </div>
            <button
              className="settings-theme-toggle"
              onClick={() => dispatch(toggleTheme())}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <span className={`settings-theme-pill ${theme === 'dark' ? 'active' : ''}`}>
                <HiOutlineMoon size={16} /> Dark
              </span>
              <span className={`settings-theme-pill ${theme === 'light' ? 'active' : ''}`}>
                <HiOutlineSun size={16} /> Light
              </span>
            </button>
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section className="edit-section" variants={item}>
          <h3><HiOutlineBell size={18} /> Notifications</h3>
          <div className="settings-option">
            <div className="settings-option-info">
              <strong>Email Notifications</strong>
              <span>Receive email alerts for messages, mentorship requests, and events</span>
            </div>
            <label className="onboarding-toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="settings-option">
            <div className="settings-option-info">
              <strong>Push Notifications</strong>
              <span>Get browser notifications for real-time updates</span>
            </div>
            <label className="onboarding-toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider" />
            </label>
          </div>
        </motion.section>

        {/* Account Security */}
        <motion.section className="edit-section" variants={item}>
          <h3><HiOutlineLockClosed size={18} /> Change Password</h3>
          <div className="settings-password-form">
            <div className="edit-field">
              <label>Current Password</label>
              <div className="auth-input-wrapper">
                <HiOutlineLockClosed className="auth-input-icon" size={16} />
                <input
                  className="onboarding-input"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  style={{ paddingLeft: 38 }}
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? <HiOutlineEyeSlash size={16} /> : <HiOutlineEye size={16} />}
                </button>
              </div>
            </div>
            <div className="edit-fields-row">
              <div className="edit-field">
                <label>New Password</label>
                <div className="auth-input-wrapper">
                  <HiOutlineLockClosed className="auth-input-icon" size={16} />
                  <input
                    className="onboarding-input"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    style={{ paddingLeft: 38 }}
                  />
                  <button
                    type="button"
                    className="auth-toggle-password"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <HiOutlineEyeSlash size={16} /> : <HiOutlineEye size={16} />}
                  </button>
                </div>
              </div>
              <div className="edit-field">
                <label>Confirm New Password</label>
                <input
                  className="onboarding-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <button
              className="auth-submit-btn"
              onClick={handleChangePassword}
              disabled={changingPassword}
              style={{ width: 'auto', padding: '10px 28px', marginTop: 8 }}
            >
              {changingPassword ? <span className="auth-spinner" /> : 'Update Password'}
            </button>
          </div>
        </motion.section>

        {/* Account Info */}
        <motion.section className="edit-section" variants={item}>
          <h3><HiOutlineShieldCheck size={18} /> Account Info</h3>
          <div className="settings-info-grid">
            <div className="settings-info-item">
              <span className="settings-info-label">Email</span>
              <span className="settings-info-value">{user?.email}</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Role</span>
              <span className={`topbar-role-badge role-${user?.role}`} style={{ fontSize: '0.75rem' }}>
                {user?.role}
              </span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Email Verified</span>
              <span className={`settings-info-value ${user?.isEmailVerified ? 'text-green' : 'text-warning'}`}>
                {user?.isEmailVerified ? '✓ Verified' : '✗ Not verified'}
              </span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Account Status</span>
              <span className="settings-info-value text-green">Active</span>
            </div>
          </div>
        </motion.section>

        {/* Danger Zone */}
        <motion.section className="edit-section settings-danger-zone" variants={item}>
          <h3><HiOutlineExclamationTriangle size={18} /> Danger Zone</h3>
          <div className="settings-danger-content">
            <div className="settings-option-info">
              <strong>Request Account Deletion</strong>
              <span>Submit a request to permanently delete your account. An admin will review and process your request.</span>
            </div>
            <div className="settings-danger-confirm">
              <input
                className="onboarding-input"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder='Type "DELETE" to confirm'
                style={{ maxWidth: 280 }}
              />
              <button
                className="settings-delete-btn"
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirm !== 'DELETE'}
              >
                <HiOutlineTrash size={16} />
                {deletingAccount ? 'Sending...' : 'Request Deletion'}
              </button>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
