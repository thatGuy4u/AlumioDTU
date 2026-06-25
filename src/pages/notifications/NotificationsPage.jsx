import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import { HiOutlineBell, HiOutlineCheckCircle, HiOutlineTrash } from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const typeIcons = {
  mentorship_request: '🎓', mentorship_accepted: '🎉', mentorship_rejected: '😔',
  message: '💬', job_posted: '💼', application_update: '📋',
  event_reminder: '📅', community_reply: '💬', community_upvote: '👍',
  achievement_unlocked: '🏆', system_notification: '🔔', verification: '✅',
};

export default function NotificationsPage() {
  const token = useSelector(selectToken);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/notifications?limit=50`, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(res.data.data.notifications);
      setUnreadCount(res.data.data.unreadCount);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, [token]);

  const markRead = async (id) => {
    await axios.put(`${API_URL}/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await axios.put(`${API_URL}/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotif = async (id) => {
    await axios.delete(`${API_URL}/notifications/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="notifications-page">
      <div className="directory-header">
        <div>
          <h1><HiOutlineBell style={{ display: 'inline' }} /> <span className="text-gold">Notifications</span></h1>
          <p>{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up!'}</p>
        </div>
        <div className="notifications-header-actions">
          <button
            type="button"
            className="notifications-mark-all-btn"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            <HiOutlineCheckCircle size={16} /> Mark all read
          </button>
        </div>
      </div>

      {loading ? <div className="page-loader"><span className="auth-spinner-large" /></div> : (
        <motion.div className="notifications-list" variants={container} initial="hidden" animate="show">
          {notifications.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 60 }}>No notifications yet.</p>}
          {notifications.map(n => (
            <motion.div key={n.id} className={`notification-card ${!n.isRead ? 'unread' : ''}`} variants={item}>
              <div className="notification-icon">{typeIcons[n.type] || '🔔'}</div>
              <div className="notification-content" onClick={() => !n.isRead && markRead(n.id)} style={{ cursor: !n.isRead ? 'pointer' : 'default' }}>
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <span className="notification-time">{timeAgo(n.createdAt)}</span>
              </div>
              <button className="notification-delete" onClick={() => deleteNotif(n.id)} title="Delete">
                <HiOutlineTrash size={16} />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
