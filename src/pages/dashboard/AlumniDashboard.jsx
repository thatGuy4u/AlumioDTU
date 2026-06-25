import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { selectCurrentUser } from '../../store/slices/authSlice';
import {
  HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineCalendarDays,
  HiOutlinePlusCircle, HiOutlineChartBar, HiOutlineCheckCircle,
  HiOutlineXCircle, HiOutlineClock,
} from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AlumniDashboard() {
  const user = useSelector(selectCurrentUser);

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
          { label: 'Active Mentees', value: '3', icon: HiOutlineAcademicCap, color: '#00d4c8' },
          { label: 'Jobs Posted', value: '5', icon: HiOutlineBriefcase, color: '#F5C842' },
          { label: 'Events Organized', value: '2', icon: HiOutlineCalendarDays, color: '#7c4dff' },
          { label: 'Students Helped', value: '28', icon: HiOutlineChartBar, color: '#ff6b6b' },
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
            {[
              { name: 'Arjun Patel', branch: 'CSE, 3rd Year', msg: 'Need guidance for GSoC preparation' },
              { name: 'Sneha Raj', branch: 'IT, 4th Year', msg: 'Career advice for product management' },
            ].map((req, i) => (
              <div key={i} className="dash-request-card">
                <div className="dash-request-avatar">{req.name[0]}</div>
                <div className="dash-request-info">
                  <strong>{req.name}</strong>
                  <span className="dash-request-branch">{req.branch}</span>
                  <p className="dash-request-msg">"{req.msg}"</p>
                </div>
                <div className="dash-request-actions">
                  <button className="dash-accept-btn" title="Accept"><HiOutlineCheckCircle size={20} /></button>
                  <button className="dash-reject-btn" title="Decline"><HiOutlineXCircle size={20} /></button>
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
            <h3>Job Posting Analytics</h3>
          </div>
          <div className="dash-widget-body">
            {[
              { title: 'Frontend Intern', applicants: 23, views: 145, status: 'active' },
              { title: 'Backend Developer', applicants: 18, views: 98, status: 'active' },
              { title: 'UI/UX Designer', applicants: 12, views: 67, status: 'closed' },
            ].map((job, i) => (
              <div key={i} className="dash-analytics-card">
                <div className="dash-analytics-info">
                  <strong>{job.title}</strong>
                  <span className={`dash-tag ${job.status === 'active' ? '' : 'secondary'}`}>{job.status}</span>
                </div>
                <div className="dash-analytics-stats">
                  <span>{job.applicants} applicants</span>
                  <span>{job.views} views</span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/app/jobs" className="dash-widget-link">Manage Jobs →</Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
