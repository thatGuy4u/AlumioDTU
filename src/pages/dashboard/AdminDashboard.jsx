import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../utils/apiClient';
import toast from 'react-hot-toast';
import {
  HiOutlineUsers, HiOutlineShieldCheck, HiOutlineChartBar,
  HiOutlineExclamationTriangle, HiOutlineArrowTrendingUp,
} from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// ─── Skeleton Components ───
function SkeletonPulse({ width, height = 16, borderRadius = 6, style }) {
  return (
    <div
      className="skeleton-pulse"
      style={{
        width, height, borderRadius,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

function StatCardSkeleton() {
  return (
    <div className="dash-stat-card">
      <SkeletonPulse width={40} height={40} borderRadius={10} />
      <div className="dash-stat-info" style={{ gap: 6 }}>
        <SkeletonPulse width={48} height={28} />
        <SkeletonPulse width={80} height={12} />
      </div>
    </div>
  );
}

function VerificationSkeleton() {
  return [0, 1, 2].map(i => (
    <div key={i} className="dash-request-card" style={{ opacity: 0.5 }}>
      <SkeletonPulse width={40} height={40} borderRadius={10} />
      <div className="dash-request-info" style={{ gap: 6, flex: 1 }}>
        <SkeletonPulse width="60%" height={14} />
        <SkeletonPulse width="80%" height={11} />
        <SkeletonPulse width="40%" height={10} />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <SkeletonPulse width={30} height={30} borderRadius={8} />
        <SkeletonPulse width={30} height={30} borderRadius={8} />
      </div>
    </div>
  ));
}

function EngagementSkeleton() {
  return [0, 1, 2, 3].map(i => (
    <div key={i} className="dash-metric-row" style={{ opacity: 0.5 }}>
      <div className="dash-metric-info">
        <SkeletonPulse width={120} height={13} />
        <SkeletonPulse width={24} height={13} />
      </div>
      <div className="dash-metric-bar">
        <SkeletonPulse width="30%" height="100%" borderRadius={4} />
      </div>
    </div>
  ));
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, students: 0, alumni: 0, posts: 0, jobs: 0, events: 0, mentorships: 0 });
  const [engagement, setEngagement] = useState({ activeUsers: 0, newPosts: 0, newJobs: 0, newMentorships: 0 });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/admin/stats'),
      api.get('/admin/engagement'),
      api.get('/admin/pending-verifications'),
    ]).then(([statsRes, engRes, pendingRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
      if (engRes.status === 'fulfilled') setEngagement(engRes.value.data.data);
      if (pendingRes.status === 'fulfilled') setPendingUsers(pendingRes.value.data.data || []);
      setLoading(false);
    });
  }, []);

  const handleVerify = useCallback(async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/verify`);
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      setStats(prev => ({ ...prev, alumni: prev.alumni + 1 }));
      toast.success('User verified!');
    } catch (e) { toast.error(e.message || 'Failed to verify'); }
  }, []);

  const handleBan = useCallback(async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/ban`);
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('User banned');
    } catch (e) { toast.error(e.message || 'Failed to ban'); }
  }, []);

  const engMetrics = [
    { label: 'Active Users (7d)', value: engagement.activeUsers, pct: Math.min(100, Math.round((engagement.activeUsers / Math.max(stats.totalUsers, 1)) * 100)) },
    { label: 'New Posts (7d)', value: engagement.newPosts, pct: Math.min(100, engagement.newPosts * 3) },
    { label: 'New Jobs (7d)', value: engagement.newJobs, pct: Math.min(100, engagement.newJobs * 5) },
    { label: 'New Mentorships (7d)', value: engagement.newMentorships, pct: Math.min(100, engagement.newMentorships * 8) },
  ];

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
        {loading ? (
          <>{[0, 1, 2, 3].map(i => <StatCardSkeleton key={i} />)}</>
        ) : (
          [{label: 'Total Users', value: stats.totalUsers, icon: HiOutlineUsers, color: '#00d4c8'},
           {label: 'Students', value: stats.students, icon: HiOutlineUsers, color: '#2c87f6'},
           {label: 'Alumni', value: stats.alumni, icon: HiOutlineShieldCheck, color: '#7c4dff'},
           {label: 'Pending Verification', value: pendingUsers.length, icon: HiOutlineExclamationTriangle, color: '#ff6b6b'},
          ].map((stat, i) => (
            <div key={i} className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={22} />
              </div>
              <div className="dash-stat-info">
                <span className="dash-stat-value">{stat.value}</span>
                <span className="dash-stat-label">{stat.label}</span>
                <span className="dash-stat-change up">
                  <HiOutlineArrowTrendingUp size={12} /> live
                </span>
              </div>
            </div>
          ))
        )}
      </motion.div>

      <div className="dash-grid-2col">
        {/* Pending Verifications */}
        <motion.div className="dash-widget" variants={item}>
          <div className="dash-widget-header">
            <HiOutlineShieldCheck size={18} className="text-gold" />
            <h3>Pending Alumni Verifications</h3>
          </div>
          <div className="dash-widget-body">
            {loading ? (
              <VerificationSkeleton />
            ) : pendingUsers.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>All caught up! No pending verifications 🎉</p>
            ) : pendingUsers.slice(0, 5).map((u) => (
              <div key={u.id} className="dash-request-card">
                <div className="dash-request-avatar">
                  {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} /> : u.name?.[0]}
                </div>
                <div className="dash-request-info">
                  <strong>{u.name}</strong>
                  <span className="dash-request-branch">{u.email}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Joined {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="dash-request-actions">
                  <button className="dash-accept-btn" title="Verify" onClick={() => handleVerify(u.id)}>✓</button>
                  <button className="dash-reject-btn" title="Ban" onClick={() => handleBan(u.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
          <Link to="/app/admin/verifications" className="dash-widget-link">View All →</Link>
        </motion.div>

        {/* Engagement Metrics */}
        <motion.div className="dash-widget" variants={item}>
          <div className="dash-widget-header">
            <HiOutlineChartBar size={18} style={{ color: '#7c4dff' }} />
            <h3>This Week's Engagement</h3>
          </div>
          <div className="dash-widget-body">
            {loading ? (
              <EngagementSkeleton />
            ) : (
              engMetrics.map((metric, i) => (
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
              ))
            )}
          </div>
          <Link to="/app/admin/reports" className="dash-widget-link">View Analytics →</Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
