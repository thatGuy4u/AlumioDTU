import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import { format } from 'date-fns';
import {
  HiOutlineShieldCheck, HiOutlineCheckBadge, HiOutlineXMark,
} from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function AdminVerificationsPage() {
  const token = useSelector(selectToken);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/pending-verifications`, { headers: { Authorization: `Bearer ${token}` } });
        setPendingUsers(res.data.data);
      } catch { toast.error('Failed to load'); }
      setLoading(false);
    };
    fetch();
  }, [token]);

  const handleVerify = async (userId) => {
    try {
      await axios.put(`${API_URL}/admin/users/${userId}/verify`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('Alumni verified! ✓');
    } catch { toast.error('Failed to verify'); }
  };

  return (
    <div className="admin-page">
      <div className="directory-header">
        <div>
          <h1><HiOutlineShieldCheck size={28} /> Verification <span className="text-gold">Queue</span></h1>
          <p>Alumni accounts awaiting verification</p>
        </div>
      </div>

      {loading ? <div className="page-loader"><span className="auth-spinner-large" /></div> : pendingUsers.length === 0 ? (
        <div className="coming-soon-page">
          <div className="coming-soon-icon">✅</div>
          <h2>All Clear!</h2>
          <p>No pending verification requests</p>
        </div>
      ) : (
        <motion.div className="verification-grid" variants={container} initial="hidden" animate="show">
          {pendingUsers.map(u => (
            <motion.div key={u.id} className="verification-card" variants={item}>
              <div className="verification-card-info">
                <div className="directory-card-avatar">
                  {u.avatar ? <img src={u.avatar} alt="" /> : <span>{u.name?.[0]}</span>}
                </div>
                <div>
                  <h3>{u.name}</h3>
                  <p className="poster-email">{u.email}</p>
                  <p className="admin-date">Joined {format(new Date(u.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <div className="verification-card-actions">
                <button className="auth-submit-btn" onClick={() => handleVerify(u.id)} style={{ width: 'auto', padding: '10px 20px' }}>
                  <HiOutlineCheckBadge size={18} /> Verify
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
