import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectToken, selectCurrentUser } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import { HiOutlineAcademicCap, HiOutlineStar, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock, HiOutlinePaperAirplane } from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function MentorshipPage() {
  const token = useSelector(selectToken);
  const user = useSelector(selectCurrentUser);
  const isStudent = user?.role === 'student';
  const [tab, setTab] = useState(isStudent ? 'browse' : 'requests');
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestedMentorIds, setRequestedMentorIds] = useState(new Set());
  const [requestingId, setRequestingId] = useState(null);
  const [messageModal, setMessageModal] = useState(null); // mentorId to show modal for
  const [requestMessage, setRequestMessage] = useState('');

  // Fetch existing requests to pre-mark already-requested mentors
  useEffect(() => {
    if (isStudent) {
      axios.get(`${API_URL}/mentorship/requests`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          const ids = new Set();
          (res.data.data?.requests || []).forEach(r => {
            if (r.status === 'pending' || r.status === 'accepted') {
              ids.add(r.mentor?.id || r.mentorId);
            }
          });
          setRequestedMentorIds(ids);
        })
        .catch(() => {});
    }
  }, [token, isStudent]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        if (tab === 'browse' && isStudent) {
          const res = await axios.get(`${API_URL}/mentorship/mentors`, { headers: { Authorization: `Bearer ${token}` } });
          setMentors(res.data.data.mentors);
        } else if (tab === 'requests') {
          const res = await axios.get(`${API_URL}/mentorship/requests`, { headers: { Authorization: `Bearer ${token}` } });
          setRequests(res.data.data.requests);
        } else if (tab === 'sessions') {
          const res = await axios.get(`${API_URL}/mentorship/sessions`, { headers: { Authorization: `Bearer ${token}` } });
          setSessions(res.data.data);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch();
  }, [tab, token, isStudent]);

  const handleRequestMentorship = async (mentorId) => {
    setRequestingId(mentorId);
    try {
      await axios.post(`${API_URL}/mentorship/request`, {
        mentorId,
        message: requestMessage || 'I would love to be mentored by you!'
      }, { headers: { Authorization: `Bearer ${token}` } });
      setRequestedMentorIds(prev => new Set(prev).add(mentorId));
      setMessageModal(null);
      setRequestMessage('');
      toast.success('Mentorship request sent! 🎉');
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to send request';
      if (msg.toLowerCase().includes('already')) {
        setRequestedMentorIds(prev => new Set(prev).add(mentorId));
        toast('You already have a request with this mentor', { icon: '✓' });
      } else {
        toast.error(msg);
      }
    }
    setRequestingId(null);
  };

  const handleAccept = async (id) => {
    try {
      await axios.put(`${API_URL}/mentorship/requests/${id}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' } : r));
      toast.success('Mentorship request accepted!');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };
  const handleReject = async (id) => {
    try {
      await axios.put(`${API_URL}/mentorship/requests/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
      toast.success('Request declined');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="mentorship-page">
      <div className="directory-header">
        <div><h1><HiOutlineAcademicCap style={{ display: 'inline' }} /> <span className="text-gold">Mentorship</span></h1><p>{isStudent ? 'Find mentors and get guidance from DTU alumni' : 'Manage your mentees and help shape futures'}</p></div>
      </div>

      <div className="tab-bar">
        {isStudent && <button className={`tab-btn ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>Browse Mentors</button>}
        <button className={`tab-btn ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>Requests</button>
        <button className={`tab-btn ${tab === 'sessions' ? 'active' : ''}`} onClick={() => setTab('sessions')}>Sessions</button>
      </div>

      {loading ? <div className="page-loader"><span className="auth-spinner-large" /></div> : (
        <motion.div variants={container} initial="hidden" animate="show">
          {tab === 'browse' && (
            <div className="directory-grid">
              {mentors.map(m => {
                const mentorUserId = m.user?.id;
                const alreadyRequested = requestedMentorIds.has(mentorUserId);
                return (
                  <motion.div key={m.id} className="directory-card" variants={item}>
                    <div className="directory-card-avatar">{m.user?.avatar ? <img src={m.user.avatar} alt="" /> : <span>{m.user?.name?.[0]}</span>}</div>
                    <h3>{m.user?.name}</h3>
                    {m.company && <p className="directory-card-meta"><span>{m.designation}, {m.company}</span></p>}
                    <div className="directory-card-meta"><HiOutlineStar size={14} /><span>{m.mentorRatingAvg > 0 ? `${m.mentorRatingAvg} ★ (${m.mentorRatingCount})` : 'New Mentor'}</span></div>
                    {m.skills?.length > 0 && <div className="directory-card-skills">{m.skills.slice(0, 4).map((s, i) => <span key={i} className="dash-tag">{s}</span>)}</div>}
                    {alreadyRequested ? (
                      <button className="mentor-request-sent-btn" disabled>
                        <HiOutlineCheckCircle size={16} /> Request Sent
                      </button>
                    ) : (
                      <button
                        className="auth-submit-btn"
                        style={{ width: '100%', marginTop: 12, padding: '8px', fontSize: '0.82rem' }}
                        onClick={() => { setMessageModal(mentorUserId); setRequestMessage(''); }}
                        disabled={requestingId === mentorUserId}
                      >
                        {requestingId === mentorUserId ? <span className="auth-spinner" /> : 'Request Mentorship'}
                      </button>
                    )}
                  </motion.div>
                );
              })}
              {mentors.length === 0 && <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>No mentors available right now.</p>}
            </div>
          )}

          {tab === 'requests' && (
            <div className="dash-widget-body" style={{ gap: 12, display: 'flex', flexDirection: 'column' }}>
              {requests.map(r => (
                <motion.div key={r.id} className="dash-request-card" variants={item}>
                  <div className="dash-request-avatar">{(isStudent ? r.mentor?.avatar : r.mentee?.avatar) ? <img src={isStudent ? r.mentor?.avatar : r.mentee?.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} /> : (isStudent ? r.mentor?.name : r.mentee?.name)?.[0]}</div>
                  <div className="dash-request-info">
                    <strong>{isStudent ? r.mentor?.name : r.mentee?.name}</strong>
                    <span className="dash-request-branch">{isStudent ? r.mentor?.email : r.mentee?.email}</span>
                    <span className={`dash-tag ${r.status === 'accepted' ? '' : r.status === 'rejected' ? 'secondary' : ''}`}><HiOutlineClock size={10} /> {r.status}</span>
                    {r.message && <p className="dash-request-msg">"{r.message}"</p>}
                  </div>
                  {!isStudent && r.status === 'pending' && (
                    <div className="dash-request-actions">
                      <button className="dash-accept-btn" onClick={() => handleAccept(r.id)}><HiOutlineCheckCircle size={20} /></button>
                      <button className="dash-reject-btn" onClick={() => handleReject(r.id)}><HiOutlineXCircle size={20} /></button>
                    </div>
                  )}
                </motion.div>
              ))}
              {requests.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No mentorship requests yet.</p>}
            </div>
          )}

          {tab === 'sessions' && (
            <div className="dash-widget-body" style={{ gap: 12, display: 'flex', flexDirection: 'column' }}>
              {sessions.map(s => (
                <motion.div key={s.id} className="dash-event-card" variants={item} style={{ border: '1px solid var(--card-border)', padding: 16, borderRadius: 12 }}>
                  <div className="dash-event-date"><span className="dash-event-day">{new Date(s.scheduledAt).getDate()}</span><span className="dash-event-month">{new Date(s.scheduledAt).toLocaleString('default', { month: 'short' })}</span></div>
                  <div className="dash-event-info"><strong>{s.topic}</strong><span>{s.duration} min • with {isStudent ? s.mentor?.name : s.mentee?.name}</span>{s.meetingLink && <a href={s.meetingLink} target="_blank" rel="noreferrer" className="dash-widget-link">Join Meeting →</a>}</div>
                </motion.div>
              ))}
              {sessions.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No sessions scheduled.</p>}
            </div>
          )}
        </motion.div>
      )}

      {/* Request Message Modal */}
      {messageModal && (
        <div className="modal-overlay" onClick={() => setMessageModal(null)}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 440, padding: 28 }}
          >
            <h3 style={{ marginBottom: 12, color: 'var(--text-primary)' }}>Send Mentorship Request</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>Add a personal message to your request (optional)</p>
            <textarea
              className="onboarding-textarea"
              rows={3}
              placeholder="Hi! I would love to learn from your experience..."
              value={requestMessage}
              onChange={e => setRequestMessage(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="onboarding-back-btn" onClick={() => setMessageModal(null)}>Cancel</button>
              <button
                className="auth-submit-btn"
                style={{ width: 'auto', padding: '10px 24px' }}
                onClick={() => handleRequestMentorship(messageModal)}
                disabled={requestingId === messageModal}
              >
                {requestingId === messageModal ? <span className="auth-spinner" /> : <><HiOutlinePaperAirplane size={16} /> Send Request</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
