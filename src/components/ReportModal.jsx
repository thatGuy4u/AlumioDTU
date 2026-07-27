import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/apiClient';
import {
  HiOutlineFlag, HiOutlineXMark, HiOutlinePaperAirplane,
} from 'react-icons/hi2';

const REASONS = [
  { value: 'spam', label: '🚫 Spam', desc: 'Irrelevant or promotional content' },
  { value: 'harassment', label: '⚠️ Harassment', desc: 'Abusive or threatening behaviour' },
  { value: 'inappropriate', label: '🔞 Inappropriate', desc: 'NSFW or offensive material' },
  { value: 'misinformation', label: '📰 Misinformation', desc: 'False or misleading information' },
  { value: 'other', label: '📋 Other', desc: 'Something else not listed above' },
];

/**
 * ReportModal — reusable report dialog.
 *
 * Props:
 *  - isOpen      : boolean
 *  - onClose     : () => void
 *  - contentType : 'post' | 'comment' | 'user'
 *  - contentId   : string (the id of the item being reported)
 *  - targetName  : string (optional display name for context, e.g. "John's comment")
 */
export default function ReportModal({ isOpen, onClose, contentType, contentId, targetName }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }
    setSending(true);
    try {
      await api.post('/community/reports', {
        reason,
        description: description.trim() || undefined,
        contentType,
        contentId,
      });
      toast.success('Report submitted — our team will review it shortly.');
      setReason('');
      setDescription('');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    }
    setSending(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const typeLabel =
    contentType === 'post' ? 'Post' :
    contentType === 'comment' ? 'Comment' :
    contentType === 'user' ? 'User' : 'Content';

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
            className="modal-content report-modal"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
          >
            {/* Header */}
            <div className="report-modal-header">
              <div className="report-modal-title">
                <HiOutlineFlag size={20} />
                <h3>Report {typeLabel}</h3>
              </div>
              <button className="report-modal-close" onClick={onClose} type="button">
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {targetName && (
              <p className="report-modal-target">Reporting: <strong>{targetName}</strong></p>
            )}

            <form onSubmit={handleSubmit}>
              {/* Reason picker */}
              <div className="report-reason-list">
                {REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={`report-reason-option ${reason === r.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                    />
                    <div className="report-reason-text">
                      <span className="report-reason-label">{r.label}</span>
                      <span className="report-reason-desc">{r.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Optional description */}
              <div className="report-modal-field">
                <label>Additional details (optional)</label>
                <textarea
                  className="onboarding-textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide more context if you'd like..."
                />
              </div>

              {/* Actions */}
              <div className="report-modal-actions">
                <button type="button" className="onboarding-back-btn" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={sending || !reason}
                  style={{ width: 'auto', padding: '10px 24px' }}
                >
                  {sending ? <span className="auth-spinner" /> : (
                    <><HiOutlinePaperAirplane size={14} /> Submit Report</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
