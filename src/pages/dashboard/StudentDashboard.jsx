import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { selectCurrentUser, selectProfile } from '../../store/slices/authSlice';
import {
  HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineCalendarDays,
  HiOutlineUserGroup, HiOutlineChatBubbleOvalLeft, HiOutlineArrowTrendingUp,
  HiOutlineSparkles, HiOutlineRocketLaunch,
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
  const completionScore = profile?.profileCompletionScore || 30;

  const quickActions = [
    { to: '/app/directory', icon: HiOutlineUserGroup, label: 'Find Alumni', color: '#F5C842' },
    { to: '/app/mentorship', icon: HiOutlineAcademicCap, label: 'Get Mentored', color: '#00d4c8' },
    { to: '/app/jobs', icon: HiOutlineBriefcase, label: 'Browse Jobs', color: '#7c4dff' },
    { to: '/app/events', icon: HiOutlineCalendarDays, label: 'Events', color: '#ff6b6b' },
  ];

  return (
    <motion.div className="dashboard" variants={container} initial="hidden" animate="show">
      {/* Greeting */}
      <motion.div className="dash-hero" variants={item}>
        <div className="dash-hero-text">
          <h1>Welcome back, <span className="text-gold">{user?.name?.split(' ')[0]}</span> 👋</h1>
          <p>Your DTU network is growing. Here's what's happening today.</p>
        </div>
        <div className="dash-hero-stat">
          <div className="completion-ring">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" className="ring-bg" />
              <circle
                cx="50" cy="50" r="42"
                className="ring-progress"
                style={{ strokeDasharray: `${completionScore * 2.64} 264` }}
              />
            </svg>
            <span className="ring-label">{completionScore}%</span>
          </div>
          <span className="ring-text">Profile Complete</span>
        </div>
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
        {/* Recommended Alumni */}
        <motion.div className="dash-widget" variants={item}>
          <div className="dash-widget-header">
            <HiOutlineSparkles size={18} className="text-gold" />
            <h3>Recommended Alumni</h3>
          </div>
          <div className="dash-widget-body">
            {[
              { name: 'Priya Sharma', role: 'SDE at Google', branch: 'CSE 2019' },
              { name: 'Rahul Verma', role: 'PM at Microsoft', branch: 'IT 2018' },
              { name: 'Ananya Gupta', role: 'Data Scientist at Meta', branch: 'CSE 2020' },
            ].map((alumni, i) => (
              <div key={i} className="dash-alumni-card">
                <div className="dash-alumni-avatar">{alumni.name[0]}</div>
                <div className="dash-alumni-info">
                  <strong>{alumni.name}</strong>
                  <span>{alumni.role}</span>
                  <span className="dash-alumni-branch">{alumni.branch}</span>
                </div>
                <button className="dash-connect-btn">Connect</button>
              </div>
            ))}
          </div>
          <Link to="/app/directory" className="dash-widget-link">View All Alumni →</Link>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div className="dash-widget" variants={item}>
          <div className="dash-widget-header">
            <HiOutlineCalendarDays size={18} className="text-teal" />
            <h3>Upcoming Events</h3>
          </div>
          <div className="dash-widget-body">
            {[
              { title: 'Resume Building Workshop', date: 'Jun 28', type: 'workshop' },
              { title: 'Alumni Talk: Life at FAANG', date: 'Jul 2', type: 'alumni-talk' },
              { title: 'DTU Startup Meetup', date: 'Jul 5', type: 'meetup' },
            ].map((event, i) => (
              <div key={i} className="dash-event-card">
                <div className="dash-event-date">
                  <span className="dash-event-day">{event.date.split(' ')[1]}</span>
                  <span className="dash-event-month">{event.date.split(' ')[0]}</span>
                </div>
                <div className="dash-event-info">
                  <strong>{event.title}</strong>
                  <span className="dash-event-type">{event.type.replace('-', ' ')}</span>
                </div>
              </div>
            ))}
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
            {[
              { title: 'Frontend Intern', company: 'Zeta', type: 'Internship', mode: 'Remote' },
              { title: 'SDE-1', company: 'Flipkart', type: 'Full-time', mode: 'Hybrid' },
              { title: 'ML Engineer', company: 'Atlassian', type: 'Full-time', mode: 'Onsite' },
            ].map((job, i) => (
              <div key={i} className="dash-job-card">
                <div className="dash-job-info">
                  <strong>{job.title}</strong>
                  <span>{job.company}</span>
                </div>
                <div className="dash-job-tags">
                  <span className="dash-tag">{job.type}</span>
                  <span className="dash-tag secondary">{job.mode}</span>
                </div>
              </div>
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
            {[
              { title: 'How I cracked Google SDE-2 from DTU', votes: 142, category: 'placements' },
              { title: 'Best ML resources for beginners', votes: 89, category: 'general' },
              { title: 'DTU to IIM journey — my experience', votes: 76, category: 'higher-studies' },
            ].map((post, i) => (
              <div key={i} className="dash-post-card">
                <div className="dash-post-votes">
                  <HiOutlineArrowTrendingUp size={14} />
                  <span>{post.votes}</span>
                </div>
                <div className="dash-post-info">
                  <strong>{post.title}</strong>
                  <span className="dash-post-category">{post.category}</span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/app/community" className="dash-widget-link">Join Discussion →</Link>
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
