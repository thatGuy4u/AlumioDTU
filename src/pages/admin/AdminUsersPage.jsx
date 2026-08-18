import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectToken, selectCurrentUser } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import { format } from 'date-fns';
import {
  HiOutlineMagnifyingGlass, HiOutlineShieldCheck, HiOutlineNoSymbol,
  HiOutlineTrash, HiOutlineCheckBadge, HiOutlineUser, HiOutlineEye,
} from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function AdminUsersPage() {
  const token = useSelector(selectToken);
  const currentUser = useSelector(selectCurrentUser);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchUsers = async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 20 });
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    try {
      const res = await axios.get(`${API_URL}/admin/users?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch (e) { toast.error('Failed to load users'); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(page); }, [page, roleFilter]);

  const handleVerify = async (userId) => {
    try {
      await axios.put(`${API_URL}/admin/users/${userId}/verify`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: true } : u));
      toast.success('User verified!');
    } catch { toast.error('Failed'); }
  };

  const handleBan = async (userId) => {
    try {
      const res = await axios.put(`${API_URL}/admin/users/${userId}/ban`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: res.data.data.isBanned } : u));
      toast.success(res.data.message);
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('User deleted');
    } catch { toast.error('Failed'); }
  };

  const roleColors = { student: 'role-student', alumni: 'role-alumni', admin: 'role-admin' };

  return (
    <div className="admin-page">
      <div className="directory-header">
        <div>
          <h1>User <span className="text-gold">Management</span></h1>
          <p>Manage all platform users</p>
        </div>
      </div>

      {/* Controls */}
      <div className="directory-controls">
        <form className="directory-search" onSubmit={e => { e.preventDefault(); setPage(1); fetchUsers(1); }}>
          <HiOutlineMagnifyingGlass size={18} />
          <input placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit">Search</button>
        </form>
        <select className="onboarding-input" style={{ width: 'auto' }} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="alumni">Alumni</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? <div className="page-loader"><span className="auth-spinner-large" /></div> : (
        <>
          <motion.div className="admin-users-table" variants={container} initial="hidden" animate="show">
            <div className="admin-table-header">
              <span>User</span>
              <span>Role</span>
              <span>Status</span>
              <span>Joined</span>
              <span>Actions</span>
            </div>
            {users.map(u => (
              <motion.div key={u.id} className="admin-table-row" variants={item}>
                <div className="admin-user-cell">
                  <Link to={`/app/profile/${u.id}`} className="directory-card-avatar tiny" style={{ textDecoration: 'none' }}>
                    {u.avatar ? <img src={u.avatar} alt="" /> : <span>{u.name?.[0]}</span>}
                  </Link>
                  <div>
                    <Link to={`/app/profile/${u.id}`} className="poster-name admin-user-link">{u.name}</Link>
                    <span className="poster-email">{u.email}</span>
                  </div>
                </div>
                <span className={`topbar-role-badge ${roleColors[u.role]}`}>{u.role}</span>
                <div className="admin-status-badges">
                  {u.isEmailVerified && <span className="admin-mini-badge good" title="Email verified">✉️</span>}
                  {u.isVerified && <span className="admin-mini-badge good" title="Verified">✓</span>}
                  {u.isProfileComplete && <span className="admin-mini-badge good" title="Profile complete">📋</span>}
                  {u.isBanned && <span className="admin-mini-badge bad" title="Banned">🚫</span>}
                </div>
                <span className="admin-date">{u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}</span>
                <div className="admin-actions">
                  <Link to={`/app/profile/${u.id}`} className="admin-action-btn view" title="View Profile">
                    <HiOutlineEye size={16} />
                  </Link>
                  {!u.isVerified && u.role === 'alumni' && (
                    <button className="admin-action-btn verify" onClick={() => handleVerify(u.id)} title="Verify">
                      <HiOutlineCheckBadge size={16} />
                    </button>
                  )}
                  {u.id !== currentUser?.id && (
                    <>
                      <button className={`admin-action-btn ${u.isBanned ? 'unban' : 'ban'}`} onClick={() => handleBan(u.id)} title={u.isBanned ? 'Unban' : 'Ban'}>
                        <HiOutlineNoSymbol size={16} />
                      </button>
                      <button className="admin-action-btn delete" onClick={() => handleDelete(u.id)} title="Delete">
                        <HiOutlineTrash size={16} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
            {users.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 32 }}>No users found</p>}
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
