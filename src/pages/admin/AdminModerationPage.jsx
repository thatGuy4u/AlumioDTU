import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import { format } from 'date-fns';
import {
  HiOutlineShieldExclamation, HiOutlineCheckCircle,
  HiOutlineXCircle, HiOutlineEye, HiOutlineFlag,
} from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const statusTabs = [
  { value: 'pending', label: 'Pending', icon: HiOutlineFlag },
  { value: 'reviewed', label: 'Reviewed', icon: HiOutlineEye },
  { value: 'resolved', label: 'Resolved', icon: HiOutlineCheckCircle },
  { value: 'dismissed', label: 'Dismissed', icon: HiOutlineXCircle },
];

const reasonLabels = {
  spam: '🚫 Spam', harassment: '⚠️ Harassment', inappropriate: '🔞 Inappropriate',
  misinformation: '📰 Misinformation', other: '📋 Other',
};

export default function AdminModerationPage() {
  const token = useSelector(selectToken);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchReports = async (p = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/reports?status=${statusFilter}&page=${p}&limit=20`, { headers: { Authorization: `Bearer ${token}` } });
      setReports(res.data.data.reports);
      setPagination(res.data.data.pagination);
    } catch { toast.error('Failed to load reports'); }
    setLoading(false);
  };

  useEffect(() => { fetchReports(page); }, [statusFilter, page]);

  const handleModeratePost = async (postId) => {
    try {
      await axios.put(`${API_URL}/admin/posts/${postId}/moderate`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Post moderation toggled');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="admin-page">
      <div className="directory-header">
        <div>
          <h1><HiOutlineShieldExclamation size={28} /> Content <span className="text-gold">Moderation</span></h1>
          <p>Review flagged content and user reports</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="app-stats-row">
        {statusTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.value} className={`app-stat-chip ${statusFilter === tab.value ? 'active' : ''}`} onClick={() => { setStatusFilter(tab.value); setPage(1); }}>
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? <div className="page-loader"><span className="auth-spinner-large" /></div> : reports.length === 0 ? (
        <div className="coming-soon-page">
          <div className="coming-soon-icon">{statusFilter === 'pending' ? '✅' : '📋'}</div>
          <h2>{statusFilter === 'pending' ? 'No pending reports' : `No ${statusFilter} reports`}</h2>
          <p>{statusFilter === 'pending' ? 'Everything looks clean!' : 'Try a different status filter'}</p>
        </div>
      ) : (
        <>
          <motion.div className="moderation-list" variants={container} initial="hidden" animate="show">
            {reports.map(report => (
              <motion.div key={report.id} className="moderation-card" variants={item}>
                <div className="moderation-card-header">
                  <span className="dash-tag">{reasonLabels[report.reason] || report.reason}</span>
                  <span className="admin-date">{format(new Date(report.createdAt), 'MMM d, yyyy')}</span>
                </div>

                <div className="moderation-card-body">
                  {report.description && <p className="moderation-description">{report.description}</p>}

                  <div className="moderation-parties">
                    {report.reporter && (
                      <div className="moderation-party">
                        <span className="moderation-party-label">Reported by</span>
                        <Link to={`/app/profile/${report.reporter.id}`} className="post-author-link">
                          <div className="directory-card-avatar tiny">
                            {report.reporter.avatar ? <img src={report.reporter.avatar} alt="" /> : <span>{report.reporter.name?.[0]}</span>}
                          </div>
                          <span className="poster-name">{report.reporter.name}</span>
                        </Link>
                      </div>
                    )}
                    {report.reportedUser && (
                      <div className="moderation-party">
                        <span className="moderation-party-label">Reported user</span>
                        <Link to={`/app/profile/${report.reportedUser.id}`} className="post-author-link">
                          <div className="directory-card-avatar tiny">
                            {report.reportedUser.avatar ? <img src={report.reportedUser.avatar} alt="" /> : <span>{report.reportedUser.name?.[0]}</span>}
                          </div>
                          <span className="poster-name">{report.reportedUser.name}</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  {report.contentType && (
                    <div className="moderation-content-ref">
                      <span>Content: {report.contentType}</span>
                      {report.contentId && report.contentType === 'post' && (
                        <button className="profile-edit-btn" onClick={() => handleModeratePost(report.contentId)}>
                          <HiOutlineShieldExclamation size={14} /> Toggle Moderation
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
              <span>Page {page} of {pagination.pages}</span>
              <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
