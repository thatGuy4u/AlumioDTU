import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectCurrentUser, clearCredentials } from '../store/slices/authSlice';
import { toggleTheme, selectTheme } from '../store/slices/uiSlice';
import { useLogoutMutation } from '../store/api/authApi';
import { useSocket, useSocketEvent } from '../hooks/useSocket';
import api from '../utils/apiClient';
import {
  HiOutlineMagnifyingGlass, HiOutlineBell,
  HiOutlineSun, HiOutlineMoon,
  HiOutlineArrowRightOnRectangle, HiOutlineUser,
  HiOutlineCog6Tooth, HiOutlineChevronDown,
  HiOutlineBars3, HiOutlineXMark, HiOutlineCheckCircle,
} from 'react-icons/hi2';

const typeIcons = {
  mentorship_request: '🎓', mentorship_accepted: '🎉', mentorship_rejected: '📋',
  message: '💬', job_posted: '💼', application_update: '📄',
  event_reminder: '📅', community_reply: '💬', community_upvote: '👍',
  achievement_unlocked: '🏆', verification: '✅', system_notification: '🔔',
};

export default function Topbar({ onMenuToggle, isMobileNav = false, mobileOpen = false }) {
  const user = useSelector(selectCurrentUser);
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Socket.io integration for real-time notifications
  const { socket } = useSocket();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications?limit=8');
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch {
      /* keep previous state on transient errors */
    }
  }, []);

  // Initial fetch + periodic refresh (fallback for when socket misses events)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Real-time: listen for new notifications via socket
  useSocketEvent(socket, 'new_notification', useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 8));
    setUnreadCount((prev) => prev + 1);
  }, []));

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      /* still clear locally */
    }
    dispatch(clearCredentials());
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/directory?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      /* ignore */
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'admin': return { label: 'Admin', className: 'role-admin' };
      case 'alumni': return { label: 'Alumni', className: 'role-alumni' };
      default: return { label: 'Student', className: 'role-student' };
    }
  };

  const role = getRoleBadge();

  return (
    <header className="topbar">
      {isMobileNav && (
        <button
          type="button"
          className="topbar-menu-btn"
          onClick={onMenuToggle}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <HiOutlineXMark size={22} /> : <HiOutlineBars3 size={22} />}
        </button>
      )}

      <form className="topbar-search" onSubmit={handleSearch}>
        <HiOutlineMagnifyingGlass className="topbar-search-icon" size={18} />
        <input
          type="text"
          placeholder="Search alumni, jobs, events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="topbar-search-input"
        />
      </form>

      <div className="topbar-actions">
        <button
          type="button"
          className="topbar-icon-btn"
          onClick={() => dispatch(toggleTheme())}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
        </button>

        <div className="topbar-notif-wrap" ref={notifRef}>
          <button
            type="button"
            className="topbar-icon-btn"
            onClick={() => setNotifOpen((open) => !open)}
            title="Notifications"
            aria-expanded={notifOpen}
          >
            <HiOutlineBell size={20} />
            {unreadCount > 0 && (
              <span className="topbar-notification-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                className="topbar-notif-panel"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                <div className="topbar-notif-header">
                  <strong>Notifications</strong>
                  {unreadCount > 0 && (
                    <button type="button" className="topbar-notif-mark-all" onClick={markAllRead}>
                      <HiOutlineCheckCircle size={14} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="topbar-notif-list">
                  {notifications.length === 0 && (
                    <p className="topbar-notif-empty">No notifications yet</p>
                  )}
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      className={`topbar-notif-item${!n.isRead ? ' unread' : ''}`}
                      onClick={() => {
                        if (!n.isRead) markRead(n.id);
                        setNotifOpen(false);
                        navigate(n.link || '/app/notifications');
                      }}
                    >
                      <span className="topbar-notif-icon">{typeIcons[n.type] || '🔔'}</span>
                      <span className="topbar-notif-text">
                        <span className="topbar-notif-title">{n.title}</span>
                        <span className="topbar-notif-msg">{n.message}</span>
                      </span>
                      {!n.isRead && <span className="topbar-notif-dot" />}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="topbar-notif-view-all"
                  onClick={() => { setNotifOpen(false); navigate('/app/notifications'); }}
                >
                  View all notifications
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="topbar-user" ref={dropdownRef}>
          <button
            type="button"
            className="topbar-user-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="topbar-avatar">
              {user?.role === 'admin' ? (
                <span>A</span>
              ) : user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user?.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{user?.role === 'admin' ? 'Admin' : user?.name}</span>
              <span className={`topbar-role-badge ${role.className}`}>{role.label}</span>
            </div>
            <HiOutlineChevronDown
              size={14}
              className={`topbar-chevron ${dropdownOpen ? 'open' : ''}`}
            />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                className="topbar-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <button type="button" onClick={() => { navigate('/app/profile'); setDropdownOpen(false); }}>
                  <HiOutlineUser size={16} /> My Profile
                </button>
                <button type="button" onClick={() => { navigate('/app/settings'); setDropdownOpen(false); }}>
                  <HiOutlineCog6Tooth size={16} /> Settings
                </button>
                <div className="topbar-dropdown-divider" />
                <button type="button" onClick={handleLogout} className="topbar-logout-btn">
                  <HiOutlineArrowRightOnRectangle size={16} /> Log Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
