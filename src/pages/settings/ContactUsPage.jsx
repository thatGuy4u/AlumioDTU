import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { selectCurrentUser } from '../../store/slices/authSlice';
import api from '../../utils/apiClient';
import {
  HiOutlineArrowLeft, HiOutlineEnvelope, HiOutlinePaperAirplane,
} from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function ContactUsPage() {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }
    setSending(true);
    try {
      await api.post('/users/contact', { name, email, subject, message });
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setSubject('');
      setMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    }
    setSending(false);
  };

  return (
    <div className="edit-profile-page contact-page">
      <div className="edit-profile-header">
        <button className="onboarding-back-btn" onClick={() => navigate(-1)}>
          <HiOutlineArrowLeft size={18} /> Back
        </button>
        <h1>📧 <span className="text-gold">Contact Us</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>
          Have a question, suggestion, or need help? Send us a message.
        </p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show">
        <motion.form className="contact-form" onSubmit={handleSubmit} variants={item}>
          <motion.section className="edit-section" variants={item}>
            <h3><HiOutlineEnvelope size={18} /> Send a Message</h3>
            <div className="edit-fields-row">
              <div className="edit-field">
                <label>Your Name</label>
                <input
                  className="onboarding-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="edit-field">
                <label>Your Email</label>
                <input
                  className="onboarding-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            <div className="edit-field">
              <label>Subject</label>
              <input
                className="onboarding-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What's this about?"
                required
              />
            </div>
            <div className="edit-field">
              <label>Message</label>
              <textarea
                className="onboarding-textarea"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us more..."
                required
              />
            </div>
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={sending}
              style={{ width: 'auto', padding: '12px 32px', marginTop: 8 }}
            >
              {sending ? <span className="auth-spinner" /> : <><HiOutlinePaperAirplane size={16} /> Send Message</>}
            </button>
          </motion.section>
        </motion.form>
      </motion.div>
    </div>
  );
}
