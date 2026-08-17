import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import {
  HiOutlineMegaphone, HiOutlineAcademicCap, HiOutlineBriefcase,
  HiOutlineUserGroup, HiOutlinePaperAirplane, HiOutlineLink,
} from 'react-icons/hi2';

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All Users', icon: HiOutlineUserGroup, desc: 'Students + Alumni' },
  { value: 'students', label: 'Students Only', icon: HiOutlineAcademicCap, desc: 'Current DTU students' },
  { value: 'alumni', label: 'Alumni Only', icon: HiOutlineBriefcase, desc: 'DTU alumni members' },
];

export default function AdminBroadcastPage() {
  const token = useSelector(selectToken);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [link, setLink] = useState('');
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in the title and message');
      return;
    }

    setSending(true);
    try {
      const res = await axios.post(`${API_URL}/admin/broadcast`, {
        title: title.trim(),
        message: message.trim(),
        audience,
        link: link.trim() || undefined,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setLastResult(res.data);
      toast.success(res.data.message);
      setTitle('');
      setMessage('');
      setLink('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send broadcast');
    }
    setSending(false);
  };

  const selectedAudience = AUDIENCE_OPTIONS.find(a => a.value === audience);

  return (
    <div className="admin-broadcast-page">
      <div className="directory-header">
        <div>
          <h1><HiOutlineMegaphone style={{ display: 'inline' }} /> <span className="text-gold">Broadcast</span></h1>
          <p>Send a notification to all students, alumni, or everyone</p>
        </div>
      </div>

      <div className="broadcast-layout">
        {/* Compose Form */}
        <motion.form
          className="broadcast-form"
          onSubmit={handleSend}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Audience Selector */}
          <div className="broadcast-section">
            <label className="broadcast-label">Audience</label>
            <div className="broadcast-audience-grid">
              {AUDIENCE_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isActive = audience === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`broadcast-audience-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setAudience(opt.value)}
                  >
                    <Icon size={22} />
                    <span className="broadcast-audience-label">{opt.label}</span>
                    <span className="broadcast-audience-desc">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="broadcast-section">
            <label className="broadcast-label" htmlFor="broadcast-title">Title</label>
            <input
              id="broadcast-title"
              className="onboarding-input"
              placeholder="e.g. Important Notice from Admin"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={120}
              required
            />
            <span className="broadcast-char-count">{title.length}/120</span>
          </div>

          {/* Message */}
          <div className="broadcast-section">
            <label className="broadcast-label" htmlFor="broadcast-message">Message</label>
            <textarea
              id="broadcast-message"
              className="onboarding-textarea"
              placeholder="Write your broadcast message here..."
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={500}
              required
            />
            <span className="broadcast-char-count">{message.length}/500</span>
          </div>

          {/* Optional Link */}
          <div className="broadcast-section">
            <label className="broadcast-label" htmlFor="broadcast-link">
              <HiOutlineLink size={14} style={{ marginRight: 4 }} />
              Link (optional)
            </label>
            <input
              id="broadcast-link"
              className="onboarding-input"
              placeholder="/app/events or https://..."
              value={link}
              onChange={e => setLink(e.target.value)}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            className="auth-submit-btn broadcast-send-btn"
            disabled={sending || !title.trim() || !message.trim()}
          >
            {sending ? (
              <span className="auth-spinner" />
            ) : (
              <>
                <HiOutlinePaperAirplane size={18} />
                Send to {selectedAudience?.label || 'All'}
              </>
            )}
          </button>
        </motion.form>

        {/* Preview Card */}
        <motion.div
          className="broadcast-preview"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="broadcast-preview-title">Preview</h3>
          <p className="broadcast-preview-subtitle">How the notification will appear</p>

          <div className="broadcast-preview-card">
            <div className="notification-icon">🔔</div>
            <div className="notification-content">
              <strong>{title || 'Notification title...'}</strong>
              <p>{message || 'Your message will appear here...'}</p>
              <span className="notification-time">Just now</span>
            </div>
          </div>

          <div className="broadcast-preview-meta">
            <span>
              {(() => {
                const Icon = selectedAudience?.icon || HiOutlineUserGroup;
                return <Icon size={14} />;
              })()}
              Sending to: <strong>{selectedAudience?.label}</strong>
            </span>
            {link && <span><HiOutlineLink size={14} /> {link}</span>}
          </div>

          {/* Last broadcast result */}
          {lastResult && (
            <motion.div
              className="broadcast-result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              ✅ Last broadcast sent to <strong>{lastResult.data?.count}</strong> users
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
