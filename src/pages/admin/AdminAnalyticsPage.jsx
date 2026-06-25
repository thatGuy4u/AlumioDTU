import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import {
  HiOutlineUsers, HiOutlineAcademicCap, HiOutlineBriefcase,
  HiOutlineChatBubbleOvalLeft, HiOutlineCalendarDays,
  HiOutlineChartBarSquare, HiOutlineArrowTrendingUp,
  HiOutlineHeart, HiOutlineUserGroup,
} from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function AdminAnalyticsPage() {
  const token = useSelector(selectToken);
  const [stats, setStats] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, engagementRes, growthRes] = await Promise.all([
          axios.get(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/admin/engagement`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/admin/growth`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setStats(statsRes.data.data);
        setEngagement(engagementRes.data.data);
        setGrowth(growthRes.data.data);
      } catch { toast.error('Failed to load analytics'); }
      setLoading(false);
    };
    fetchAll();
  }, [token]);

  if (loading) return <div className="page-loader"><span className="auth-spinner-large" /></div>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: HiOutlineUsers, color: '#F5C842' },
    { label: 'Students', value: stats?.students || 0, icon: HiOutlineAcademicCap, color: '#00d4c8' },
    { label: 'Alumni', value: stats?.alumni || 0, icon: HiOutlineUserGroup, color: '#9b59b6' },
    { label: 'Community Posts', value: stats?.posts || 0, icon: HiOutlineChatBubbleOvalLeft, color: '#3498db' },
    { label: 'Job Postings', value: stats?.jobs || 0, icon: HiOutlineBriefcase, color: '#e74c3c' },
    { label: 'Events', value: stats?.events || 0, icon: HiOutlineCalendarDays, color: '#2ecc71' },
    { label: 'Mentorship Requests', value: stats?.mentorships || 0, icon: HiOutlineHeart, color: '#e91e63' },
  ];

  const engagementCards = engagement ? [
    { label: 'Active Users (7d)', value: engagement.activeUsers },
    { label: 'New Posts (7d)', value: engagement.newPosts },
    { label: 'New Jobs (7d)', value: engagement.newJobs },
    { label: 'New Mentorships (7d)', value: engagement.newMentorships },
  ] : [];

  // Aggregate growth by date
  const growthByDate = {};
  growth.forEach(g => {
    if (!growthByDate[g.date]) growthByDate[g.date] = { student: 0, alumni: 0 };
    growthByDate[g.date][g.role] = (growthByDate[g.date][g.role] || 0) + g.count;
  });
  const growthDates = Object.keys(growthByDate).sort();
  const maxGrowth = Math.max(1, ...growthDates.map(d => (growthByDate[d].student || 0) + (growthByDate[d].alumni || 0)));

  return (
    <div className="admin-page">
      <div className="directory-header">
        <div>
          <h1><HiOutlineChartBarSquare size={28} /> Reports & <span className="text-gold">Analytics</span></h1>
          <p>Platform performance overview</p>
        </div>
      </div>

      {/* Platform Stats */}
      <motion.div className="analytics-stats-grid" variants={container} initial="hidden" animate="show">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} className="analytics-stat-card" variants={item}>
              <div className="analytics-stat-icon" style={{ background: `${s.color}20`, color: s.color }}>
                <Icon size={24} />
              </div>
              <div className="analytics-stat-info">
                <span className="analytics-stat-value">{s.value.toLocaleString()}</span>
                <span className="analytics-stat-label">{s.label}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Engagement */}
      {engagementCards.length > 0 && (
        <motion.section className="analytics-section" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2><HiOutlineArrowTrendingUp size={22} /> Weekly Engagement</h2>
          <div className="analytics-engagement-grid">
            {engagementCards.map((e, i) => (
              <div key={i} className="analytics-engagement-card">
                <span className="analytics-stat-value">{e.value}</span>
                <span className="analytics-stat-label">{e.label}</span>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Growth Chart (CSS-based bar chart) */}
      {growthDates.length > 0 && (
        <motion.section className="analytics-section" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2><HiOutlineArrowTrendingUp size={22} /> User Growth (Last 30 Days)</h2>
          <div className="analytics-chart">
            {growthDates.map(date => {
              const s = growthByDate[date].student || 0;
              const a = growthByDate[date].alumni || 0;
              const total = s + a;
              const pct = Math.max(4, (total / maxGrowth) * 100);
              return (
                <div key={date} className="analytics-bar-group" title={`${date}: ${s} students, ${a} alumni`}>
                  <div className="analytics-bar-container">
                    <div className="analytics-bar student" style={{ height: `${(s / maxGrowth) * 100}%` }} />
                    <div className="analytics-bar alumni" style={{ height: `${(a / maxGrowth) * 100}%` }} />
                  </div>
                  <span className="analytics-bar-label">{date.slice(5)}</span>
                </div>
              );
            })}
          </div>
          <div className="analytics-legend">
            <span><span className="analytics-dot student" /> Students</span>
            <span><span className="analytics-dot alumni" /> Alumni</span>
          </div>
        </motion.section>
      )}
    </div>
  );
}
