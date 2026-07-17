import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import { HiOutlineCalendarDays, HiOutlineMapPin, HiOutlineUserGroup, HiOutlinePlusCircle, HiOutlineCheckCircle } from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function EventsPage() {
  const token = useSelector(selectToken);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [registeredIds, setRegisteredIds] = useState(new Set());

  const fetchEvents = async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 12 });
    if (tab === 'upcoming') params.set('upcoming', 'true');
    const res = await axios.get(`${API_URL}/events?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    setEvents(res.data.data.events); setPagination(res.data.data.pagination);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(page); }, [page, tab]);

  const handleRegister = async (eventId) => {
    try {
      await axios.post(`${API_URL}/events/${eventId}/register`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e));
      setRegisteredIds(prev => new Set(prev).add(eventId));
      toast.success('Registered! 🎉');
    } catch (e) {
      const msg = e.response?.data?.message || '';
      if (msg.toLowerCase().includes('already registered')) {
        setRegisteredIds(prev => new Set(prev).add(eventId));
        toast('You are already registered', { icon: '✓' });
      } else {
        toast.error(msg || 'Failed to register');
      }
    }
  };

  const typeColors = { alumni_talk: '#F5C842', webinar: '#00d4c8', networking: '#7c4dff', workshop: '#ff6b6b', meetup: '#4caf50' };

  return (
    <div className="events-page">
      <div className="directory-header">
        <div><h1><HiOutlineCalendarDays style={{ display: 'inline' }} /> <span className="text-gold">Events</span></h1><p>Workshops, talks, and networking events for DTU community</p></div>
        <Link to="/app/events/create" className="auth-submit-btn" style={{ width: 'auto', padding: '10px 24px', textDecoration: 'none' }}><HiOutlinePlusCircle size={18} /> Create Event</Link>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => { setTab('upcoming'); setPage(1); }}>Upcoming</button>
        <button className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => { setTab('all'); setPage(1); }}>All Events</button>
      </div>

      {loading ? <div className="page-loader"><span className="auth-spinner-large" /></div> : (
        <>
          <motion.div className="events-grid" variants={container} initial="hidden" animate="show">
            {events.map(ev => {
              const isRegistered = registeredIds.has(ev.id);
              return (
                <motion.div key={ev.id} className="event-card" variants={item}>
                  <div className="event-card-badge" style={{ background: typeColors[ev.type] || '#F5C842' }}>{ev.type.replace('_', ' ')}</div>
                  <div className="event-card-date"><span className="event-date-day">{new Date(ev.date).getDate()}</span><span className="event-date-month">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</span><span className="event-date-year">{new Date(ev.date).getFullYear()}</span></div>
                  <div className="event-card-body">
                    <h3><Link to={`/app/events/${ev.id}`}>{ev.title}</Link></h3>
                    <p className="event-desc">{ev.description?.slice(0, 100)}{ev.description?.length > 100 ? '...' : ''}</p>
                    <div className="event-meta"><HiOutlineMapPin size={14} /><span>{ev.location}</span></div>
                    <div className="event-meta"><HiOutlineUserGroup size={14} /><span>{ev.registeredCount}/{ev.maxAttendees} registered</span></div>
                    <div className="event-card-footer">
                      <span className="event-organizer">By {ev.organizer?.name}</span>
                      {isRegistered ? (
                        <button className="dash-connect-btn event-registered-btn" disabled>
                          <HiOutlineCheckCircle size={14} /> Registered
                        </button>
                      ) : (
                        <button className="dash-connect-btn" onClick={() => handleRegister(ev.id)}>Register</button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {events.length === 0 && <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>No events found.</p>}
          </motion.div>
          {pagination.pages > 1 && <div className="pagination"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button><span>Page {page} of {pagination.pages}</span><button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next →</button></div>}
        </>
      )}
    </div>
  );
}
