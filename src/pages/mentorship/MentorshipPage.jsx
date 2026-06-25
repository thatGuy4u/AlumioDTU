import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectToken, selectCurrentUser } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import { HiOutlineAcademicCap, HiOutlineStar, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function MentorshipPage() {
  const token = useSelector(selectToken);
  const user = useSelector(selectCurrentUser);
  const isStudent = user?.role === 'student';
  const [tab, setTab] = useState('browse');
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleAccept = async (id) => {
    await axios.put(`${API_URL}/mentorship/requests/${id}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' } : r));
  };
  const handleReject = async (id) => {
    await axios.put(`${API_URL}/mentorship/requests/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
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
              {mentors.map(m => (
                <motion.div key={m.id} className="directory-card" variants={item}>
                  <div className="directory-card-avatar">{m.user?.avatar ? <img src={m.user.avatar} alt="" /> : <span>{m.user?.name?.[0]}</span>}</div>
                  <h3>{m.user?.name}</h3>
                  {m.company && <p className="directory-card-meta"><span>{m.designation}, {m.company}</span></p>}
                  <div className="directory-card-meta"><HiOutlineStar size={14} /><span>{m.mentorRatingAvg > 0 ? `${m.mentorRatingAvg} ★ (${m.mentorRatingCount})` : 'New Mentor'}</span></div>
                  {m.skills?.length > 0 && <div className="directory-card-skills">{m.skills.slice(0, 4).map((s, i) => <span key={i} className="dash-tag">{s}</span>)}</div>}
                  <Link to={`/app/mentorship/${m.user?.id}`} className="auth-submit-btn" style={{ width: '100%', marginTop: 12, padding: '8px', fontSize: '0.82rem' }}>Request Mentorship</Link>
                </motion.div>
              ))}
              {mentors.length === 0 && <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>No mentors available right now.</p>}
            </div>
          )}

          {tab === 'requests' && (
            <div className="dash-widget-body" style={{ gap: 12, display: 'flex', flexDirection: 'column' }}>
              {requests.map(r => (
                <motion.div key={r.id} className="dash-request-card" variants={item}>
                  <div className="dash-request-avatar">{(isStudent ? r.mentor?.name : r.mentee?.name)?.[0]}</div>
                  <div className="dash-request-info">
                    <strong>{isStudent ? r.mentor?.name : r.mentee?.name}</strong>
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
    </div>
  );
}
