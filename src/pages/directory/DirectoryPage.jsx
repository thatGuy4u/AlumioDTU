import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/slices/authSlice';
import { API_URL, BRANCHES, INDUSTRIES } from '../../utils/constants';
import { HiOutlineMagnifyingGlass, HiOutlineMapPin, HiOutlineBriefcase, HiOutlineAcademicCap, HiOutlineFunnel, HiOutlineXMark } from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function DirectoryPage() {
  const token = useSelector(selectToken);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ branch: '', industry: '', graduationYear: '', mentorshipAvailable: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchProfiles = async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 12 });
    if (search) params.set('search', search);
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    try {
      const res = await axios.get(`${API_URL}/users/directory?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      setProfiles(res.data.data.profiles);
      setPagination(res.data.data.pagination);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(page); }, [page]);
  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchProfiles(1); };
  const clearFilters = () => { setFilters({ branch: '', industry: '', graduationYear: '', mentorshipAvailable: '' }); setSearch(''); setPage(1); setTimeout(() => fetchProfiles(1), 0); };

  return (
    <div className="directory-page">
      <div className="directory-header">
        <div>
          <h1>Alumni <span className="text-gold">Directory</span></h1>
          <p>Connect with DTU alumni across the globe</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="directory-controls">
        <form className="directory-search" onSubmit={handleSearch}>
          <HiOutlineMagnifyingGlass size={18} />
          <input placeholder="Search by name, company, skills..." value={search} onChange={e => setSearch(e.target.value)} />
          <button type="submit">Search</button>
        </form>
        <button className="directory-filter-btn" onClick={() => setShowFilters(!showFilters)}>
          <HiOutlineFunnel size={16} /> Filters {showFilters && <HiOutlineXMark size={14} />}
        </button>
      </div>

      {showFilters && (
        <motion.div className="directory-filters" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
          <select className="onboarding-input" value={filters.branch} onChange={e => setFilters(f => ({ ...f, branch: e.target.value }))}>
            <option value="">All Branches</option>
            {BRANCHES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
          <select className="onboarding-input" value={filters.industry} onChange={e => setFilters(f => ({ ...f, industry: e.target.value }))}>
            <option value="">All Industries</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <select className="onboarding-input" value={filters.mentorshipAvailable} onChange={e => setFilters(f => ({ ...f, mentorshipAvailable: e.target.value }))}>
            <option value="">Mentorship</option>
            <option value="true">Available</option>
          </select>
          <button className="onboarding-back-btn" onClick={clearFilters}>Clear</button>
          <button className="auth-submit-btn" style={{ width: 'auto', padding: '8px 20px' }} onClick={() => { setPage(1); fetchProfiles(1); }}>Apply</button>
        </motion.div>
      )}

      {/* Results */}
      {loading ? (
        <div className="page-loader"><span className="auth-spinner-large" /></div>
      ) : (
        <>
          <motion.div className="directory-grid" variants={container} initial="hidden" animate="show">
            {profiles.length === 0 && <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>No alumni found matching your criteria.</p>}
            {profiles.map(p => (
              <motion.div key={p.id} className="directory-card" variants={item}>
                <div className="directory-card-avatar">{p.user?.avatar ? <img src={p.user.avatar} alt="" /> : <span>{p.user?.name?.[0]}</span>}</div>
                <h3>{p.user?.name}</h3>
                {p.company && <div className="directory-card-meta"><HiOutlineBriefcase size={14} /><span>{p.designation ? `${p.designation}, ` : ''}{p.company}</span></div>}
                {p.branch && <div className="directory-card-meta"><HiOutlineAcademicCap size={14} /><span>{p.branch}{p.graduationYear ? ` '${String(p.graduationYear).slice(2)}` : ''}</span></div>}
                {p.location && <div className="directory-card-meta"><HiOutlineMapPin size={14} /><span>{p.location}</span></div>}
                {p.skills?.length > 0 && <div className="directory-card-skills">{p.skills.slice(0, 3).map((s, i) => <span key={i} className="dash-tag">{s}</span>)}{p.skills.length > 3 && <span className="dash-tag secondary">+{p.skills.length - 3}</span>}</div>}
                <div className="directory-card-actions">
                  <Link to={`/app/profile/${p.user?.id}`} className="profile-edit-btn">View Profile</Link>
                  {p.mentorshipAvailability && <Link to={`/app/mentorship/${p.user?.id}`} className="dash-connect-btn">Mentor</Link>}
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
