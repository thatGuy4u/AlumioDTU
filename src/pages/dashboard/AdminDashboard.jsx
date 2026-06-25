import { motion } from 'framer-motion';
import {
  HiOutlineUsers, HiOutlineShieldCheck, HiOutlineChartBar,
  HiOutlineExclamationTriangle, HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
} from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AdminDashboard() {
  return (
    <motion.div className="dashboard" variants={container} initial="hidden" animate="show">
      <motion.div className="dash-hero" variants={item}>
        <div className="dash-hero-text">
          <h1>Admin <span className="text-gold">Command Center</span> 🛡️</h1>
          <p>Platform health, user management, and moderation tools.</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div className="dash-stats-row" variants={item}>
        {[
          { label: 'Total Users', value: '1,234', change: '+12%', icon: HiOutlineUsers, color: '#00d4c8', up: true },
          { label: 'Students', value: '856', change: '+8%', icon: HiOutlineUsers, color: '#F5C842', up: true },
          { label: 'Verified Alumni', value: '342', change: '+15%', icon: HiOutlineShieldCheck, color: '#7c4dff', up: true },
          { label: 'Pending Verification', value: '36', change: '-5%', icon: HiOutlineExclamationTriangle, color: '#ff6b6b', up: false },
        ].map((stat, i) => (
          <div key={i} className="dash-stat-card">
            <div className="dash-stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={22} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-value">{stat.value}</span>
              <span className="dash-stat-label">{stat.label}</span>
              <span className={`dash-stat-change ${stat.up ? 'up' : 'down'}`}>
                {stat.up ? <HiOutlineArrowTrendingUp size={12} /> : <HiOutlineArrowTrendingDown size={12} />}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="dash-grid-2col">
        {/* Pending Verifications */}
        <motion.div className="dash-widget" variants={item}>
          <div className="dash-widget-header">
            <HiOutlineShieldCheck size={18} className="text-gold" />
            <h3>Pending Alumni Verifications</h3>
          </div>
          <div className="dash-widget-body">
            {[
              { name: 'Vikram Singh', email: 'vikram.singh@dtu.ac.in', company: 'Amazon', year: 2017 },
              { name: 'Neha Kapoor', email: 'neha.kapoor@dtu.ac.in', company: 'Goldman Sachs', year: 2019 },
              { name: 'Amit Kumar', email: 'amit.kumar@dtu.ac.in', company: 'Deloitte', year: 2016 },
            ].map((user, i) => (
              <div key={i} className="dash-request-card">
                <div className="dash-request-avatar">{user.name[0]}</div>
                <div className="dash-request-info">
                  <strong>{user.name}</strong>
                  <span>{user.company} • Class of {user.year}</span>
                  <span className="dash-request-branch">{user.email}</span>
                </div>
                <div className="dash-request-actions">
                  <button className="dash-accept-btn" title="Verify">✓</button>
                  <button className="dash-reject-btn" title="Reject">✕</button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Engagement Metrics */}
        <motion.div className="dash-widget" variants={item}>
          <div className="dash-widget-header">
            <HiOutlineChartBar size={18} style={{ color: '#7c4dff' }} />
            <h3>This Week's Engagement</h3>
          </div>
          <div className="dash-widget-body">
            {[
              { label: 'Active Users (7d)', value: '423', pct: 85 },
              { label: 'Messages Sent', value: '1,890', pct: 72 },
              { label: 'New Posts', value: '67', pct: 45 },
              { label: 'Job Applications', value: '234', pct: 68 },
              { label: 'Mentorships Formed', value: '12', pct: 30 },
            ].map((metric, i) => (
              <div key={i} className="dash-metric-row">
                <div className="dash-metric-info">
                  <span className="dash-metric-label">{metric.label}</span>
                  <span className="dash-metric-value">{metric.value}</span>
                </div>
                <div className="dash-metric-bar">
                  <motion.div
                    className="dash-metric-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
