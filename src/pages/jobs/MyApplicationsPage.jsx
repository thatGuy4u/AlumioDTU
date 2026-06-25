import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import { format } from 'date-fns';
import {
  HiOutlineBriefcase, HiOutlineDocumentText,
  HiOutlineClock, HiOutlineCheckCircle,
  HiOutlineXCircle, HiOutlineEye,
} from 'react-icons/hi2';

const statusConfig = {
  applied: { label: 'Applied', icon: HiOutlineClock, className: 'status-pending' },
  reviewed: { label: 'Reviewed', icon: HiOutlineEye, className: 'status-info' },
  shortlisted: { label: 'Shortlisted', icon: HiOutlineCheckCircle, className: 'status-success' },
  rejected: { label: 'Rejected', icon: HiOutlineXCircle, className: 'status-error' },
  hired: { label: 'Hired! 🎉', icon: HiOutlineCheckCircle, className: 'status-hired' },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function MyApplicationsPage() {
  const token = useSelector(selectToken);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/jobs/my/applications`, { headers: { Authorization: `Bearer ${token}` } });
        setApplications(res.data.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch();
  }, [token]);

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="my-applications-page">
      <div className="directory-header">
        <div>
          <h1>My <span className="text-gold">Applications</span></h1>
          <p>Track your job application progress</p>
        </div>
      </div>

      {/* Stats */}
      <div className="app-stats-row">
        <button className={`app-stat-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          <HiOutlineDocumentText size={16} /> All ({applications.length})
        </button>
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <button key={key} className={`app-stat-chip ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
            <cfg.icon size={16} /> {cfg.label} ({counts[key] || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loader"><span className="auth-spinner-large" /></div>
      ) : filtered.length === 0 ? (
        <div className="coming-soon-page">
          <div className="coming-soon-icon">📋</div>
          <h2>No applications {filter !== 'all' ? `with status "${statusConfig[filter]?.label}"` : 'yet'}</h2>
          <p>{filter === 'all' ? 'Start exploring jobs and apply!' : 'Try a different filter'}</p>
          {filter === 'all' && <Link to="/app/jobs" className="auth-submit-btn" style={{ width: 'auto', padding: '12px 28px', display: 'inline-flex', marginTop: 16 }}>Browse Jobs</Link>}
        </div>
      ) : (
        <motion.div className="applications-list" variants={container} initial="hidden" animate="show">
          {filtered.map(app => {
            const cfg = statusConfig[app.status] || statusConfig.applied;
            const StatusIcon = cfg.icon;
            return (
              <motion.div key={app.id} className="application-card" variants={item}>
                <div className="application-card-main">
                  <div className="application-card-info">
                    <h3><Link to={`/app/jobs/${app.job?.id}`}>{app.job?.title || 'Untitled Job'}</Link></h3>
                    <p className="job-company">
                      <HiOutlineBriefcase size={14} /> {app.job?.company}
                      {app.job?.postedBy?.name && <span> · Posted by {app.job.postedBy.name}</span>}
                    </p>
                    <p className="application-date">
                      <HiOutlineClock size={14} /> Applied {format(new Date(app.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className={`application-status-badge ${cfg.className}`}>
                    <StatusIcon size={16} />
                    <span>{cfg.label}</span>
                  </div>
                </div>
                {app.coverLetter && (
                  <div className="application-cover-letter">
                    <p>{app.coverLetter.slice(0, 150)}{app.coverLetter.length > 150 ? '...' : ''}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
