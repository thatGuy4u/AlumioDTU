import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { selectCurrentUser, selectProfile } from '../../store/slices/authSlice';
import api from '../../utils/apiClient';
import {
  HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineCalendarDays,
  HiOutlineUserGroup, HiOutlineChatBubbleOvalLeft, HiOutlineArrowTrendingUp,
  HiOutlineSparkles, HiOutlineRocketLaunch, HiOutlineEnvelope,
  HiOutlineCheckBadge,
  HiOutlineBoltSlash, HiOutlineClock,
} from 'react-icons/hi2';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function StudentDashboard() {
  const user = useSelector(selectCurrentUser);
  const profile = useSelector(selectProfile);

  const [alumni, setAlumni] = useState([]);
  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({ connections: 0, mentors: 0, applications: 0, events: 0 });

  useEffect(() => {
    // Fetch real data from APIs — gracefully fall back to empty arrays
    Promise.allSettled([
      api.get('/users/dashboard-stats'),
      api.get('/users/directory?limit=3'),
      api.get('/events?upcoming=true&limit=3'),
      api.get('/jobs?limit=3'),
      api.get('/community/trending'),
      api.get('/notifications?limit=6'),
    ]).then(([statsRes, alumniRes, eventsRes, jobsRes, postsRes, activityRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
      if (alumniRes.status === 'fulfilled') setAlumni(alumniRes.value.data.data?.profiles || []);
      if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data.data?.events || []);
      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data.data?.jobs || []);
      if (postsRes.status === 'fulfilled') setPosts((postsRes.value.data.data || []).slice(0, 3));
      if (activityRes.status === 'fulfilled') setRecentActivity(activityRes.value.data.data?.notifications || []);
    });
  }, []);

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const quickActions = [
    { to: '/app/directory', icon: HiOutlineUserGroup, label: 'Find Alumni', color: '#2c87f6' },
    { to: '/app/mentorship', icon: HiOutlineAcademicCap, label: 'Get Mentored', color: '#00d4c8' },
    { to: '/app/jobs', icon: HiOutlineBriefcase, label: 'Browse Jobs', color: '#7c4dff' },
    { to: '/app/events', icon: HiOutlineCalendarDays, label: 'Events', color: '#ff6b6b' },
  ];

  const statCards = [
    { label: 'Alumni Network', value: stats.connections, icon: HiOutlineUserGroup, color: '#2c87f6' },
    { label: 'Active Mentors', value: stats.mentors, icon: HiOutlineAcademicCap, color: '#00d4c8' },
    { label: 'Applications', value: stats.applications, icon: HiOutlineEnvelope, color: '#7c4dff' },
    { label: 'Upcoming Events', value: stats.events, icon: HiOutlineCalendarDays, color: '#ff6b6b' },
  ];

  return (
    <motion.div className="dashboard" variants={container} initial="hidden" animate="show">
      {/* Greeting */}
      <motion.div className="dash-hero" variants={item}>
        <div className="dash-hero-text">
          <h1>Welcome back, <span className="text-gold">{user?.name?.split(' ')[0]}</span> 👋</h1>
          <p>Your DTU network is growing. Here's what's happening today.</p>
        </div>
      </motion.div>

      {/* Graduation Transition Warning */}
      {(() => {
        const gradYear = profile?.graduationYear;
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const isGraduating = gradYear && gradYear <= currentYear && currentMonth >= 6;
        const isUrgent = isGraduating && currentMonth >= 9;

        if (!isGraduating) return null;

        return (
          <motion.div
            className={`graduation-warning-banner ${isUrgent ? 'urgent' : ''}`}
            variants={item}
          >
            <div className="graduation-warning-icon">
              {isUrgent ? '⚠️' : '🎓'}
            </div>
            <div className="graduation-warning-text">
              <strong>
                {isUrgent
                  ? 'URGENT: Your account will be deleted on September 30!'
                  : 'Congratulations on graduating!'}
              </strong>
              <span>
                {isUrgent
                  ? 'Convert your student account to alumni NOW to keep all your data, posts, and connections.'
                  : `As a Class of ${gradYear} graduate, please convert your account to alumni before September 30, ${gradYear} to continue using AlumioDTU.`}
              </span>
              <span style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: 4, display: 'block' }}>
                💡 You can also create a new alumni account with your personal email ID.
              </span>
            </div>
            <Link to="/app/transition" className="graduation-warning-btn">
              Convert to Alumni →
            </Link>
          </motion.div>
        );
      })()}

      {/* Email Verification Banner — shows only when email is unverified */}
      {!user?.isEmailVerified && (
        <motion.div className="dash-info-banner" variants={item}>
          <div className="dash-info-banner-icon">
            <HiOutlineCheckBadge size={22} />
          </div>
          <div className="dash-info-banner-text">
            <strong>Verify your email address</strong>
            <span>Check your inbox for a verification link to fully activate your account.</span>
          </div>
          <Link to="/app/settings" className="dash-info-banner-btn">
            Resend Email
          </Link>
        </motion.div>
      )}

      {/* Stats Row */}
      <motion.div className="dash-stats-row" variants={item}>
        {statCards.map((stat, i) => (
          <div key={i} className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={22} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-value">{stat.value}</span>
              <span className="dash-stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="dash-actions" variants={item}>
        {quickActions.map((action) => (
          <Link key={action.to} to={action.to} className="dash-action-card">
            <div className="dash-action-icon" style={{ background: `${action.color}15`, color: action.color }}>
              <action.icon size={22} />
            </div>
            <span>{action.label}</span>
          </Link>
        ))}
      </motion.div>

      {/* Dashboard Grid */}
      <div className="dash-grid-2col">
        {/* Recommended Users */}
        <motion.div className="dash-widget" variants={item}>
          <div className="dash-widget-header">
            <HiOutlineSparkles size={18} className="text-gold" />
            <h3>Recommended Users</h3>
          </div>
          <div className="dash-widget-body">
            {alumni.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No users found yet</p>
            ) : alumni.map((a) => (
              <Link key={a.id} to={`/app/profile/${a.user?.id}`} className="dash-alumni-card" style={{ textDecoration: 'none' }}>
                <div className="dash-alumni-avatar">
                  {a.user?.avatar ? <img src={a.user.avatar} alt="" /> : a.user?.name?.[0]}
                </div>
                <div className="dash-alumni-info">
                  <strong>{a.user?.name}</strong>
                  <span>{a.company || a.designation || 'Alumni'}</span>
                  <span className="dash-alumni-branch">{a.branch} {a.graduationYear ? `'${String(a.graduationYear).slice(2)}` : ''}</span>
                </div>
                <span className="dash-connect-btn">View</span>
              </Link>
            ))}
          </div>
          <Link to="/app/directory" className="dash-widget-link">View All Users →</Link>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div className="dash-widget" variants={item}>
          <div className="dash-widget-header">
            <HiOutlineCalendarDays size={18} className="text-teal" />
            <h3>Upcoming Events</h3>
          </div>
          <div className="dash-widget-body">
            {events.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No upcoming events</p>
            ) : events.map((event) => {
              const d = new Date(event.date);
              return (
                <Link key={event.id} to={`/app/events/${event.id}`} className="dash-event-card" style={{ textDecoration: 'none' }}>
                  <div className="dash-event-date">
                    <span className="dash-event-day">{d.getDate()}</span>
                    <span className="dash-event-month">{d.toLocaleString('en', { month: 'short' })}</span>
                  </div>
                  <div className="dash-event-info">
                    <strong>{event.title}</strong>
                    <span className="dash-event-type">{event.type?.replace(/_/g, ' ')}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <Link to="/app/events" className="dash-widget-link">View All Events →</Link>
        </motion.div>

        {/* Recent Jobs */}
        <motion.div className="dash-widget" variants={item}>
          <div className="dash-widget-header">
            <HiOutlineBriefcase size={18} style={{ color: '#7c4dff' }} />
            <h3>Latest Opportunities</h3>
          </div>
          <div className="dash-widget-body">
            {jobs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No jobs posted yet</p>
            ) : jobs.map((job) => (
              <Link key={job.id} to={`/app/jobs/${job.id}`} className="dash-job-card" style={{ textDecoration: 'none' }}>
                <div className="dash-job-info">
                  <strong>{job.title}</strong>
                  <span>{job.company}</span>
                </div>
                <div className="dash-job-tags">
                  <span className="dash-tag">{job.type?.replace('_', ' ')}</span>
                  <span className="dash-tag secondary">{job.workMode}</span>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/app/jobs" className="dash-widget-link">Browse All Jobs →</Link>
        </motion.div>

        {/* Community Highlights */}
        <motion.div className="dash-widget" variants={item}>
          <div className="dash-widget-header">
            <HiOutlineChatBubbleOvalLeft size={18} style={{ color: '#ff6b6b' }} />
            <h3>Trending Discussions</h3>
          </div>
          <div className="dash-widget-body">
            {posts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No discussions yet</p>
            ) : posts.map((post) => (
              <Link key={post.id} to={`/app/community/${post.id}`} className="dash-post-card" style={{ textDecoration: 'none' }}>
                <div className="dash-post-votes">
                  <HiOutlineArrowTrendingUp size={14} />
                  <span>{post.upvoteCount}</span>
                </div>
                <div className="dash-post-info">
                  <strong>{post.title}</strong>
                  <span className="dash-post-category">{post.category?.replace(/_/g, ' ')}</span>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/app/community" className="dash-widget-link">Join Discussion →</Link>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div className="dash-widget" variants={item}>
          <div className="dash-widget-header">
            <HiOutlineClock size={18} className="text-gold" />
            <h3>Recent Activity</h3>
          </div>
          <div className="dash-widget-body">
            {recentActivity.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent activity yet. Start engaging!</p>
            ) : (
              <div className="dash-activity-feed">
                {recentActivity.map((activity) => (
                  <Link
                    key={activity.id}
                    to={activity.link || '/app/notifications'}
                    className="dash-activity-item"
                    style={{ textDecoration: 'none' }}
                  >
                    <span className="dash-activity-dot" />
                    <div className="dash-activity-content">
                      <strong>{activity.title}</strong>
                      <span>{activity.message}</span>
                      <span className="dash-activity-time">
                        {timeAgo(activity.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link to="/app/notifications" className="dash-widget-link">View All Activity →</Link>
        </motion.div>
      </div>

      {/* Mentorship CTA */}
      <motion.div className="dash-cta-banner" variants={item}>
        <div className="dash-cta-content">
          <HiOutlineRocketLaunch size={28} className="text-gold" />
          <div>
            <h3>Find Your Perfect Mentor</h3>
            <p>Connect with alumni from your branch who've been where you want to go.</p>
          </div>
        </div>
        <Link to="/app/mentorship" className="dash-cta-btn">Explore Mentors →</Link>
      </motion.div>
    </motion.div>
  );
}
