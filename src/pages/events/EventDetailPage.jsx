import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectToken, selectCurrentUser } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import { format } from 'date-fns';
import {
  HiOutlineArrowLeft, HiOutlineCalendarDays, HiOutlineMapPin,
  HiOutlineGlobeAlt, HiOutlineUsers, HiOutlineClock,
  HiOutlineCheckCircle, HiOutlineXCircle,
} from 'react-icons/hi2';

const typeLabels = { alumni_talk: '🎤 Alumni Talk', webinar: '💻 Webinar', networking: '🤝 Networking', workshop: '🛠️ Workshop', meetup: '☕ Meetup' };

export default function EventDetailPage() {
  const { eventId } = useParams();
  const token = useSelector(selectToken);
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/events/${eventId}`, { headers: { Authorization: `Bearer ${token}` } });
        setEvent(res.data.data.event);
        setIsRegistered(res.data.data.isRegistered);
      } catch (e) {
        toast.error('Event not found');
        navigate('/app/events');
      }
      setLoading(false);
    };
    fetch();
  }, [eventId]);

  const loadAttendees = async () => {
    try {
      const res = await axios.get(`${API_URL}/events/${eventId}/attendees`, { headers: { Authorization: `Bearer ${token}` } });
      setAttendees(res.data.data);
      setShowAttendees(true);
    } catch { toast.error('Failed to load attendees'); }
  };

  const handleRegister = async () => {
    setToggling(true);
    try {
      if (isRegistered) {
        await axios.delete(`${API_URL}/events/${eventId}/register`, { headers: { Authorization: `Bearer ${token}` } });
        setIsRegistered(false);
        setEvent(e => ({ ...e, registeredCount: Math.max(0, (e.registeredCount || 1) - 1) }));
        toast.success('Registration cancelled');
      } else {
        await axios.post(`${API_URL}/events/${eventId}/register`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setIsRegistered(true);
        setEvent(e => ({ ...e, registeredCount: (e.registeredCount || 0) + 1 }));
        toast.success('Registered! 🎉');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
    setToggling(false);
  };

  if (loading) return <div className="page-loader"><span className="auth-spinner-large" /></div>;
  if (!event) return null;

  const isPast = new Date(event.date) < new Date();
  const isFull = event.registeredCount >= event.maxAttendees;

  return (
    <div className="event-detail-page">
      <button className="onboarding-back-btn" onClick={() => navigate('/app/events')}>
        <HiOutlineArrowLeft size={18} /> Back to Events
      </button>

      <motion.div className="event-detail-content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Cover Image */}
        {event.coverImage && (
          <div className="event-detail-cover">
            <img src={event.coverImage} alt={event.title} />
          </div>
        )}

        {/* Header */}
        <div className="event-detail-header">
          <span className="dash-tag">{typeLabels[event.type] || event.type}</span>
          {isPast && <span className="dash-tag" style={{ background: 'rgba(255,255,255,0.06)' }}>Past Event</span>}
          <h1>{event.title}</h1>
        </div>

        {/* Meta */}
        <div className="event-detail-meta">
          <div className="event-meta-item">
            <HiOutlineCalendarDays size={18} />
            <div>
              <strong>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</strong>
              <span>{format(new Date(event.date), 'h:mm a')}{event.endDate ? ` — ${format(new Date(event.endDate), 'h:mm a')}` : ''}</span>
            </div>
          </div>
          <div className="event-meta-item">
            {event.location === 'Online' || event.meetingLink ? <HiOutlineGlobeAlt size={18} /> : <HiOutlineMapPin size={18} />}
            <div>
              <strong>{event.location}</strong>
              {event.meetingLink && <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="event-meeting-link">Join Meeting →</a>}
            </div>
          </div>
          <div className="event-meta-item">
            <HiOutlineUsers size={18} />
            <div>
              <strong>{event.registeredCount} / {event.maxAttendees}</strong>
              <span>registered</span>
            </div>
          </div>
        </div>

        {/* Organizer */}
        {event.organizer && (
          <div className="event-detail-section">
            <h3>Organized by</h3>
            <Link to={`/app/profile/${event.organizer.id}`} className="job-detail-poster">
              <div className="directory-card-avatar small">
                {event.organizer.avatar ? <img src={event.organizer.avatar} alt="" /> : <span>{event.organizer.name?.[0]}</span>}
              </div>
              <div>
                <p className="poster-name">{event.organizer.name}</p>
                {event.organizer.email && <p className="poster-email">{event.organizer.email}</p>}
              </div>
            </Link>
          </div>
        )}

        {/* Description */}
        <div className="event-detail-section">
          <h3>About this Event</h3>
          <div className="event-detail-description">
            {event.description.split('\n').map((p, i) => p ? <p key={i}>{p}</p> : <br key={i} />)}
          </div>
        </div>

        {/* Tags */}
        {event.tags?.length > 0 && (
          <div className="event-detail-section">
            <h3>Tags</h3>
            <div className="edit-tags">
              {event.tags.map((t, i) => <span key={i} className="profile-skill-tag">{t}</span>)}
            </div>
          </div>
        )}

        {/* Registration Action */}
        {!isPast && (
          <div className="event-detail-register">
            {isRegistered ? (
              <div className="event-registered-info">
                <HiOutlineCheckCircle size={22} />
                <span>You're registered for this event!</span>
                <button className="onboarding-back-btn" onClick={handleRegister} disabled={toggling}>
                  {toggling ? <span className="auth-spinner" /> : <><HiOutlineXCircle size={16} /> Cancel Registration</>}
                </button>
              </div>
            ) : isFull ? (
              <div className="job-applied-badge" style={{ background: 'rgba(255,60,60,0.1)', borderColor: 'rgba(255,60,60,0.2)' }}>
                <HiOutlineUsers size={20} />
                <span>This event is full</span>
              </div>
            ) : (
              <button className="auth-submit-btn" onClick={handleRegister} disabled={toggling} style={{ width: 'auto', padding: '14px 36px' }}>
                {toggling ? <span className="auth-spinner" /> : <><HiOutlineCalendarDays size={18} /> Register Now</>}
              </button>
            )}
          </div>
        )}

        {/* Attendees */}
        <div className="event-detail-section">
          <div className="event-attendees-header">
            <h3>Attendees ({event.registeredCount})</h3>
            {!showAttendees && event.registeredCount > 0 && (
              <button className="profile-edit-btn" onClick={loadAttendees}>View All</button>
            )}
          </div>
          {showAttendees && (
            <motion.div className="event-attendees-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {attendees.map(a => (
                <Link key={a.id} to={`/app/profile/${a.user?.id}`} className="event-attendee-chip">
                  <div className="directory-card-avatar tiny">
                    {a.user?.avatar ? <img src={a.user.avatar} alt="" /> : <span>{a.user?.name?.[0]}</span>}
                  </div>
                  <span>{a.user?.name}</span>
                  <span className="topbar-role-badge role-student" style={{ fontSize: '0.6rem' }}>{a.user?.role}</span>
                </Link>
              ))}
              {attendees.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No attendees yet</p>}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
