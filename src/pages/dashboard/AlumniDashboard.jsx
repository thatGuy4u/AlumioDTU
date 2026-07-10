import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { selectCurrentUser } from '../../store/slices/authSlice';
import api from '../../utils/apiClient';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineCalendarDays,
  HiOutlinePlusCircle, HiOutlineChartBar, HiOutlineCheckCircle,
  HiOutlineXCircle, HiOutlineClock,
} from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AlumniDashboard() {
  const user = useSelector(selectCurrentUser);
  const [stats, setStats] = useState({ activeMentees: 0, jobsPosted: 0, eventsOrganized: 0, studentsHelped: 0 });
  const [requests, setRequests] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      api.get('/users/dashboard-stats'),
      api.get('/mentorship/requests?status=pending'),
      api.get('/jobs/my/posted'),
      api.get('/notifications?limit=6'),
    ]).then(([statsRes, reqRes, jobsRes, activityRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
      if (reqRes.status === 'fulfilled') setRequests(reqRes.value.data.data?.requests || []);
      if (jobsRes.status === 'fulfilled') setJobs((jobsRes.value.data.data || []).slice(0, 3));
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

  const handleAccept = useCallback(async (id) => {
    try {
      await api.put(`/mentorship/requests/${id}/accept`);
      setRequests(prev => prev.filter(r => r.id !== id));
      setStats(prev => ({ ...prev, activeMentees: prev.activeMentees + 1 }));
      toast.success('Mentorship request accepted!');
    } catch (e) { toast.error(e.message || 'Failed to accept'); }
  }, []);

  const handleReject = useCallback(async (id) => {
    try {
      await api.put(`/mentorship/requests/${id}/reject`);
      setRequests(prev => prev.filter(r => r.id !== id));
      toast.success('Request declined');
    } catch (e) { toast.error(e.message || 'Failed to decline'); }
  }, []);

  return (
    <motion.div className="dashboard" variants={container} initial="hidden" animate="show">
      <motion.div className="dash-hero" variants={item}>
        <div className="dash-hero-text">
          <h1>Welcome, <span className="text-gold">{user?.name?.split(' ')[0]}</span> 💼</h1>
          <p>Your mentorship impact and community engagement at a glance.</p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div className="dash-stats-row" variants={item}>
        {[
          { label: 'Active Mentees', value: stats.activeMentees, icon: HiOutlineAcademicCap, color: '#00d4c8' },
          { label: 'Jobs Posted', value: stats.jobsPosted, icon: HiOutlineBriefcase, color: '#2c87f6' },
          { label: 'Events Organized', value: stats.eventsOrganized, icon: HiOutlineCalendarDays, color: '#7c4dff' },
          { label: 'Students Helped', value: stats.studentsHelped, icon: HiOutlineChartBar, color: '#ff6b6b' },
        ].map((stat, i) => (
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
        <Link to="/app/jobs/post" className="dash-action-card accent">
          <HiOutlinePlusCircle size={20} />
          <span>Post Job</span>
        </Link>
        <Link to="/app/events/create" className="dash-action-card">
          <HiOutlineCalendarDays size={20} />
          <span>Create Event</span>
        </Link>
        <Link to="/app/mentorship" className="dash-action-card">
          <HiOutlineAcademicCap size={20} />
          <span>Mentorship Queue</span>
        </Link>
        <Link to="/app/community/create" className="dash-action-card">
          <HiOutlineBriefcase size={20} />
          <span>Write Post</span>
        </Link>
      </motion.div>

      <div className="dash-grid-2col">
        {/* Mentorship Requests */}
        <motion.div className="dash-widget" variants={item}>
          <div className="dash-widget-header">
            <HiOutlineClock size={18} className="text-gold" />
            <h3>Pending Mentorship Requests</h3>
          </div>
          <div className="dash-widget-body">
            {requests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No pending requests 🎉</p>
            ) : requests.map((req) => (
              <div key={req.id} className="dash-request-card">
                <div className="dash-request-avatar">
                  {req.mentee?.avatar ? <img src={req.mentee.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} /> : req.mentee?.name?.[0]}
                </div>
                <div className="dash-request-info">
                  <strong>{req.mentee?.name}</strong>
                  <span className="dash-request-branch">{req.mentee?.email}</span>
                  <p className="dash-request-msg">"{req.message}"</p>
                </div>
                <div className="dash-request-actions">
                  <button className="dash-accept-btn" title="Accept" onClick={() => handleAccept(req.id)}>
                    <HiOutlineCheckCircle size={20} />
                  </button>
                  <button className="dash-reject-btn" title="Decline" onClick={() => handleReject(req.id)}>
                    <HiOutlineXCircle size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Link to="/app/mentorship" className="dash-widget-link">View All Requests →</Link>
        </motion.div>

        {/* Job Posting Analytics */}
        <motion.div className="dash-widget" variants={item}>
          <div className="dash-widget-header">
            <HiOutlineChartBar size={18} style={{ color: '#7c4dff' }} />
            <h3>Your Job Postings</h3>
          </div>
          <div className="dash-widget-body">
            {jobs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No jobs posted yet</p>
            ) : jobs.map((job) => (
              <Link key={job.id} to={`/app/jobs/${job.id}`} className="dash-analytics-card" style={{ textDecoration: 'none' }}>
                <div className="dash-analytics-info">
                  <strong>{job.title}</strong>
                  <span className={`dash-tag ${job.isActive ? '' : 'secondary'}`}>{job.isActive ? 'active' : 'closed'}</span>
                </div>
                <div className="dash-analytics-stats">
                  <span>{job.applicantCount || 0} applicants</span>
                  <span>{job.company}</span>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/app/jobs" className="dash-widget-link">Manage Jobs →</Link>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div className="dash-widget" variants={item}>
          <div className="dash-widget-header">
            <HiOutlineClock size={18} className="text-gold" />
            <h3>Recent Activity</h3>
          </div>
          <div className="dash-widget-body">
            {recentActivity.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent activity yet.</p>
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
                      <span className="dash-activity-time">{timeAgo(activity.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link to="/app/notifications" className="dash-widget-link">View All Activity →</Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
