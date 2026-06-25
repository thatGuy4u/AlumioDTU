import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectToken, selectCurrentUser } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import { format } from 'date-fns';
import {
  HiOutlineBriefcase, HiOutlineMapPin, HiOutlineCurrencyRupee,
  HiOutlineClock, HiOutlineCalendarDays, HiOutlineBookmark,
  HiOutlineBookmarkSlash, HiOutlineArrowLeft, HiOutlineGlobeAlt,
  HiOutlineUser, HiOutlineDocumentText, HiOutlinePaperAirplane,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';

const typeLabels = { internship: 'Internship', full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract' };
const modeLabels = { remote: 'Remote', onsite: 'Onsite', hybrid: 'Hybrid' };

export default function JobDetailPage() {
  const { jobId } = useParams();
  const token = useSelector(selectToken);
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
        setJob(res.data.data.job);
        setHasApplied(res.data.data.hasApplied);
        setIsSaved(res.data.data.isSaved);
      } catch (e) {
        toast.error('Failed to load job');
        navigate('/app/jobs');
      }
      setLoading(false);
    };
    fetch();
  }, [jobId, token]);

  const handleSave = async () => {
    try {
      const res = await axios.post(`${API_URL}/jobs/my/saved`, { jobId }, { headers: { Authorization: `Bearer ${token}` } });
      setIsSaved(res.data.data.saved);
      toast.success(res.data.data.saved ? 'Job saved!' : 'Removed from saved');
    } catch { toast.error('Failed'); }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await axios.post(`${API_URL}/jobs/${jobId}/apply`, { coverLetter: coverLetter || undefined }, { headers: { Authorization: `Bearer ${token}` } });
      setHasApplied(true);
      setShowApplyForm(false);
      toast.success('Application submitted! 🎉');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Application failed');
    }
    setApplying(false);
  };

  if (loading) return <div className="page-loader"><span className="auth-spinner-large" /></div>;
  if (!job) return null;

  const salary = job.salaryMin || job.stipendMin;
  const salaryMax = job.salaryMax || job.stipendMax;
  const deadlinePassed = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();

  return (
    <div className="job-detail-page">
      <button className="onboarding-back-btn" onClick={() => navigate('/app/jobs')}>
        <HiOutlineArrowLeft size={18} /> Back to Jobs
      </button>

      <motion.div className="job-detail-content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="job-detail-header">
          <div className="job-detail-title-area">
            <h1>{job.title}</h1>
            <p className="job-detail-company">{job.company}</p>
            <div className="job-detail-badges">
              <span className="dash-tag">{typeLabels[job.type] || job.type}</span>
              <span className="dash-tag secondary">{modeLabels[job.workMode] || job.workMode}</span>
              {!job.isActive && <span className="dash-tag" style={{ background: 'rgba(255,60,60,0.2)', color: '#ff6b6b' }}>Closed</span>}
            </div>
          </div>
          <div className="job-detail-actions">
            {user?.role === 'student' && (
              <button className="topbar-icon-btn" onClick={handleSave} title={isSaved ? 'Unsave' : 'Save'}>
                {isSaved ? <HiOutlineBookmarkSlash size={22} /> : <HiOutlineBookmark size={22} />}
              </button>
            )}
          </div>
        </div>

        {/* Meta Grid */}
        <div className="job-detail-meta">
          {job.location && <div className="job-detail-meta-item"><HiOutlineMapPin size={16} /><span>{job.location}</span></div>}
          {salary && <div className="job-detail-meta-item"><HiOutlineCurrencyRupee size={16} /><span>₹{salary.toLocaleString()}{salaryMax ? ` — ₹${salaryMax.toLocaleString()}` : ''}{job.type === 'internship' ? '/mo' : '/yr'}</span></div>}
          {(job.experienceMin !== undefined) && <div className="job-detail-meta-item"><HiOutlineBriefcase size={16} /><span>{job.experienceMin}{job.experienceMax ? ` - ${job.experienceMax}` : '+'} years experience</span></div>}
          {job.applicationDeadline && <div className="job-detail-meta-item"><HiOutlineCalendarDays size={16} /><span>Deadline: {format(new Date(job.applicationDeadline), 'MMM d, yyyy')}</span></div>}
          <div className="job-detail-meta-item"><HiOutlineClock size={16} /><span>Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}</span></div>
          <div className="job-detail-meta-item"><HiOutlineUser size={16} /><span>{job.applicantCount} applicant{job.applicantCount !== 1 ? 's' : ''}</span></div>
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="job-detail-section">
            <h3>Required Skills</h3>
            <div className="edit-tags">
              {job.skills.map((s, i) => <span key={i} className="profile-skill-tag">{s}</span>)}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="job-detail-section">
          <h3>Job Description</h3>
          <div className="job-detail-description">{job.description}</div>
        </div>

        {/* Requirements */}
        {job.requirements?.length > 0 && (
          <div className="job-detail-section">
            <h3>Requirements</h3>
            <ul className="job-detail-requirements">
              {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}

        {/* Posted By */}
        {job.postedBy && (
          <div className="job-detail-section">
            <h3>Posted By</h3>
            <Link to={`/app/profile/${job.postedBy.id}`} className="job-detail-poster">
              <div className="directory-card-avatar small">{job.postedBy.avatar ? <img src={job.postedBy.avatar} alt="" /> : <span>{job.postedBy.name?.[0]}</span>}</div>
              <div>
                <p className="poster-name">{job.postedBy.name}</p>
                {job.postedBy.email && <p className="poster-email">{job.postedBy.email}</p>}
              </div>
            </Link>
          </div>
        )}

        {/* Apply Section */}
        {user?.role === 'student' && job.isActive && !deadlinePassed && (
          <div className="job-detail-apply-section">
            {hasApplied ? (
              <div className="job-applied-badge">
                <HiOutlineCheckCircle size={22} />
                <span>You've already applied for this position</span>
              </div>
            ) : showApplyForm ? (
              <motion.div className="job-apply-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <h3>Apply for {job.title}</h3>
                <p className="job-apply-note">Your resume from your profile will be attached automatically.</p>
                <div className="edit-field">
                  <label>Cover Letter (optional)</label>
                  <textarea className="onboarding-input" rows={4} value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Tell the recruiter why you're a great fit..." />
                </div>
                <div className="job-apply-actions">
                  <button className="onboarding-back-btn" onClick={() => setShowApplyForm(false)}>Cancel</button>
                  <button className="auth-submit-btn" onClick={handleApply} disabled={applying} style={{ width: 'auto', padding: '12px 28px' }}>
                    {applying ? <span className="auth-spinner" /> : <><HiOutlinePaperAirplane size={16} /> Submit Application</>}
                  </button>
                </div>
              </motion.div>
            ) : (
              <button className="auth-submit-btn" onClick={() => setShowApplyForm(true)} style={{ width: 'auto', padding: '14px 36px' }}>
                <HiOutlineDocumentText size={18} /> Apply Now
              </button>
            )}
          </div>
        )}

        {deadlinePassed && (
          <div className="job-applied-badge" style={{ background: 'rgba(255,60,60,0.1)', borderColor: 'rgba(255,60,60,0.2)' }}>
            <HiOutlineClock size={20} />
            <span>Application deadline has passed</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
