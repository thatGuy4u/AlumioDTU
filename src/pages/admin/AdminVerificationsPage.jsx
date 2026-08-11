import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import { format } from 'date-fns';
import {
  HiOutlineShieldCheck, HiOutlineCheckBadge, HiOutlineXMark,
  HiOutlineEnvelope, HiOutlineTrash, HiOutlineExclamationTriangle,
} from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function AdminVerificationsPage() {
  const token = useSelector(selectToken);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [unverifiedEmailUsers, setUnverifiedEmailUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmails, setLoadingEmails] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/pending-verifications`, { headers: { Authorization: `Bearer ${token}` } });
        setPendingUsers(res.data.data);
      } catch { toast.error('Failed to load'); }
      setLoading(false);
    };
    const fetchUnverifiedEmails = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/unverified-emails`, { headers: { Authorization: `Bearer ${token}` } });
        setUnverifiedEmailUsers(res.data.data);
      } catch { toast.error('Failed to load unverified emails'); }
      setLoadingEmails(false);
    };
    fetchPending();
    fetchUnverifiedEmails();
  }, [token]);

  const handleVerify = async (userId) => {
    try {
      await axios.put(`${API_URL}/admin/users/${userId}/verify`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('Alumni verified! ✓');
    } catch { toast.error('Failed to verify'); }
  };

  const handleDeleteUnverified = async (userId) => {
    if (!confirm('Permanently delete this unverified user? This cannot be undone.')) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      setUnverifiedEmailUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('Unverified user deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  const getDaysBadgeClass = (days) => {
    if (days >= 7) return 'danger';
    if (days >= 4) return 'warning';
    return 'safe';
  };

  const roleColors = { student: 'role-student', alumni: 'role-alumni', admin: 'role-admin' };

  return (
    <div className="admin-page">
      {/* ===== Alumni Verification Queue ===== */}
      <div className="directory-header">
        <div>
          <h1><HiOutlineShieldCheck size={28} /> Verification <span className="text-gold">Queue</span></h1>
          <p>Alumni accounts awaiting verification</p>
        </div>
      </div>

      {loading ? <div className="page-loader"><span className="auth-spinner-large" /></div> : pendingUsers.length === 0 ? (
        <div className="coming-soon-page">
          <div className="coming-soon-icon">✅</div>
          <h2>All Clear!</h2>
          <p>No pending verification requests</p>
        </div>
      ) : (
        <motion.div className="verification-grid" variants={container} initial="hidden" animate="show">
          {pendingUsers.map(u => (
            <motion.div key={u.id} className="verification-card" variants={item}>
              <div className="verification-card-info">
                <div className="directory-card-avatar">
                  {u.avatar ? <img src={u.avatar} alt="" /> : <span>{u.name?.[0]}</span>}
                </div>
                <div>
                  <h3>{u.name}</h3>
                  <p className="poster-email">{u.email}</p>
                  <p className="admin-date">Joined {format(new Date(u.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <div className="verification-card-actions">
                <button className="auth-submit-btn" onClick={() => handleVerify(u.id)} style={{ width: 'auto', padding: '10px 20px' }}>
                  <HiOutlineCheckBadge size={18} /> Verify
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ===== Unverified Email Users ===== */}
      <hr className="admin-section-divider" />

      <div className="unverified-emails-header">
        <HiOutlineEnvelope size={22} />
        <h2>Email Unverified Users</h2>
        {unverifiedEmailUsers.length > 0 && (
          <span className="unverified-email-count">{unverifiedEmailUsers.length}</span>
        )}
      </div>
      <p className="unverified-emails-subtitle">
        Users who haven't verified their email. Accounts overdue by 7+ days can be deleted.
      </p>

      {loadingEmails ? <div className="page-loader"><span className="auth-spinner-large" /></div> : unverifiedEmailUsers.length === 0 ? (
        <div className="coming-soon-page" style={{ padding: '24px 0' }}>
          <div className="coming-soon-icon">📧</div>
          <h2>All Verified!</h2>
          <p>Every user has verified their email</p>
        </div>
      ) : (
        <motion.div className="verification-grid" variants={container} initial="hidden" animate="show" style={{ gap: 10 }}>
          {unverifiedEmailUsers.map(u => (
            <motion.div
              key={u.id}
              className={`unverified-email-card ${u.daysSinceRegistration >= 7 ? 'overdue' : ''}`}
              variants={item}
            >
              <div className="unverified-email-info">
                <div className="directory-card-avatar tiny">
                  {u.avatar ? <img src={u.avatar} alt="" /> : <span>{u.name?.[0]}</span>}
                </div>
                <div className="unverified-email-details">
                  <h4>
                    {u.name}
                    <span className={`topbar-role-badge ${roleColors[u.role]}`}>{u.role}</span>
                  </h4>
                  <p>{u.email} · Joined {format(new Date(u.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <div className="unverified-email-actions">
                <span className={`unverified-days-badge ${getDaysBadgeClass(u.daysSinceRegistration)}`}>
                  {u.daysSinceRegistration >= 7 && <HiOutlineExclamationTriangle size={12} />}
                  {u.daysSinceRegistration}d ago
                </span>
                <button
                  className="admin-action-btn delete"
                  onClick={() => handleDeleteUnverified(u.id)}
                  title="Delete unverified user"
                >
                  <HiOutlineTrash size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
