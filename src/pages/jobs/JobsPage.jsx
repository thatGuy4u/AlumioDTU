import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import { HiOutlineBriefcase, HiOutlineMapPin, HiOutlineMagnifyingGlass, HiOutlineCurrencyRupee, HiOutlineBookmark, HiOutlineBookmarkSlash } from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function JobsPage() {
  const token = useSelector(selectToken);
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');

  const fetchJobs = async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 12 });
    if (search) params.set('search', search);
    if (typeFilter) params.set('type', typeFilter);
    if (modeFilter) params.set('workMode', modeFilter);
    const res = await axios.get(`${API_URL}/jobs?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    setJobs(res.data.data.jobs); setPagination(res.data.data.pagination);
    setLoading(false);
  };

  useEffect(() => { fetchJobs(page); }, [page]);

  const handleSave = async (jobId) => {
    await axios.post(`${API_URL}/jobs/my/saved`, { jobId }, { headers: { Authorization: `Bearer ${token}` } });
  };

  const typeLabels = { internship: 'Internship', full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract' };
  const modeLabels = { remote: 'Remote', onsite: 'Onsite', hybrid: 'Hybrid' };

  return (
    <div className="jobs-page">
      <div className="directory-header"><div><h1>Jobs & <span className="text-gold">Internships</span></h1><p>Opportunities posted by DTU alumni</p></div></div>

      <div className="directory-controls">
        <form className="directory-search" onSubmit={e => { e.preventDefault(); setPage(1); fetchJobs(1); }}>
          <HiOutlineMagnifyingGlass size={18} /><input placeholder="Search jobs, companies..." value={search} onChange={e => setSearch(e.target.value)} /><button type="submit">Search</button>
        </form>
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <select className="onboarding-input" style={{ flex: 1, minWidth: 0 }} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); setTimeout(() => fetchJobs(1), 0); }}>
            <option value="">All Types</option>{Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="onboarding-input" style={{ flex: 1, minWidth: 0 }} value={modeFilter} onChange={e => { setModeFilter(e.target.value); setPage(1); setTimeout(() => fetchJobs(1), 0); }}>
            <option value="">All Modes</option>{Object.entries(modeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {loading ? <div className="page-loader"><span className="auth-spinner-large" /></div> : (
        <>
          <motion.div className="jobs-grid" variants={container} initial="hidden" animate="show">
            {jobs.map(j => (
              <motion.div key={j.id} className="job-card" variants={item}>
                <div className="job-card-header">
                  <div><h3><Link to={`/app/jobs/${j.id}`}>{j.title}</Link></h3><p className="job-company">{j.company}</p></div>
                  <button className="topbar-icon-btn" onClick={() => handleSave(j.id)} title="Save"><HiOutlineBookmark size={18} /></button>
                </div>
                <div className="job-card-tags">
                  <span className="dash-tag">{typeLabels[j.type] || j.type}</span>
                  <span className="dash-tag secondary">{modeLabels[j.workMode] || j.workMode}</span>
                </div>
                {j.location && <div className="directory-card-meta"><HiOutlineMapPin size={14} /><span>{j.location}</span></div>}
                {(j.stipendMin || j.salaryMin) && <div className="directory-card-meta"><HiOutlineCurrencyRupee size={14} /><span>{j.stipendMin || j.salaryMin}{j.stipendMax || j.salaryMax ? ` - ${j.stipendMax || j.salaryMax}` : ''}</span></div>}
                {j.skills?.length > 0 && <div className="directory-card-skills">{j.skills.slice(0, 4).map((s, i) => <span key={i} className="profile-skill-tag" style={{ fontSize: '0.68rem' }}>{s}</span>)}</div>}
                <div className="job-card-footer">
                  <span className="job-posted">{j.applicantCount} applicant{j.applicantCount !== 1 ? 's' : ''}</span>
                  <Link to={`/app/jobs/${j.id}`} className="dash-connect-btn">View Details</Link>
                </div>
              </motion.div>
            ))}
            {jobs.length === 0 && <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>No jobs found.</p>}
          </motion.div>
          {pagination.pages > 1 && <div className="pagination"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button><span>Page {page} of {pagination.pages}</span><button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next →</button></div>}
        </>
      )}
    </div>
  );
}
