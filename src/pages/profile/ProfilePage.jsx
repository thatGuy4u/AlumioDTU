import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { selectCurrentUser, selectToken, selectProfile } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import { HiOutlineEnvelope, HiOutlineMapPin, HiOutlineBriefcase, HiOutlineAcademicCap, HiOutlineChatBubbleLeftRight, HiOutlinePencilSquare, HiOutlineTrophy, HiOutlineLink, HiOutlineFlag } from 'react-icons/hi2';
import ReportModal from '../../components/ReportModal';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function ProfilePage() {
  const { userId } = useParams();
  const currentUser = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);
  const myProfile = useSelector(selectProfile);
  const isOwn = !userId || userId === currentUser?.id;
  const [profileData, setProfileData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(!isOwn);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (!isOwn) {
      axios.get(`${API_URL}/users/profile/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => { setUserData(r.data.data.user); setProfileData(r.data.data.profile); setAchievements(r.data.data.achievements || []); })
        .finally(() => setLoading(false));
    } else {
      setUserData(currentUser);
      setProfileData(myProfile);
    }
  }, [userId, isOwn, currentUser, myProfile, token]);

  const u = userData;
  const p = profileData;
  if (loading) return <div className="page-loader"><span className="auth-spinner-large" /></div>;
  if (!u) return <div className="coming-soon-page"><h2>User not found</h2></div>;

  return (
    <motion.div className="profile-page" variants={container} initial="hidden" animate="show">
      {/* Banner + Avatar */}
      <motion.div className="profile-banner" variants={item}>
        <div className="profile-banner-bg" />
        <div className="profile-banner-content">
          <div className="profile-avatar-lg">{u.avatar ? <img src={u.avatar} alt={u.name} /> : <span>{u.name?.[0]}</span>}</div>
          <div className="profile-banner-info">
            <h1>{u.name}</h1>
            <div className="profile-meta">
              <span className={`topbar-role-badge role-${u.role}`}>{u.role}</span>
              {u.isVerified && <span className="profile-verified">✓ Verified</span>}
            </div>
            {p?.bio && <p className="profile-bio">{p.bio}</p>}
          </div>
          <div className="profile-banner-actions">
            {isOwn ? (
              <Link to="/app/profile/edit" className="profile-edit-btn"><HiOutlinePencilSquare size={16} /> Edit Profile</Link>
            ) : (
              <>
                <Link to={`/app/messages?to=${u.id}`} className="profile-edit-btn"><HiOutlineChatBubbleLeftRight size={16} /> Message</Link>
                {u.role === 'alumni' && <Link to={`/app/mentorship/${u.id}`} className="auth-submit-btn" style={{ width: 'auto', padding: '8px 20px', fontSize: '0.82rem' }}>Request Mentorship</Link>}
                <button className="profile-report-btn" onClick={() => setShowReport(true)}><HiOutlineFlag size={16} /> Report</button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <div className="profile-grid">
        {/* Info Card */}
        <motion.div className="dash-widget" variants={item}>
          <div className="dash-widget-header"><h3>Information</h3></div>
          <div className="profile-info-list">
            {u.email && <div className="profile-info-row"><HiOutlineEnvelope size={16} /><span>{u.email}</span></div>}
            {p?.branch && <div className="profile-info-row"><HiOutlineAcademicCap size={16} /><span>{p.branch}{p.graduationYear ? ` • Class of ${p.graduationYear}` : ''}</span></div>}
            {p?.company && <div className="profile-info-row"><HiOutlineBriefcase size={16} /><span>{p.designation ? `${p.designation} at ` : ''}{p.company}</span></div>}
            {p?.location && <div className="profile-info-row"><HiOutlineMapPin size={16} /><span>{p.location}</span></div>}
            {p?.linkedinProfile && <div className="profile-info-row"><HiOutlineLink size={16} /><a href={p.linkedinProfile} target="_blank" rel="noreferrer">LinkedIn</a></div>}
          </div>
        </motion.div>

        {/* Skills */}
        {p?.skills?.length > 0 && (
          <motion.div className="dash-widget" variants={item}>
            <div className="dash-widget-header"><h3>Skills</h3></div>
            <div className="profile-tags">{p.skills.map((s, i) => <span key={i} className="profile-skill-tag">{s}</span>)}</div>
          </motion.div>
        )}

        {/* Interests */}
        {p?.interests?.length > 0 && (
          <motion.div className="dash-widget" variants={item}>
            <div className="dash-widget-header"><h3>Interests</h3></div>
            <div className="profile-tags">{p.interests.map((s, i) => <span key={i} className="profile-interest-tag">{s}</span>)}</div>
          </motion.div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <motion.div className="dash-widget" variants={item}>
            <div className="dash-widget-header"><HiOutlineTrophy size={18} className="text-gold" /><h3>Achievements</h3></div>
            <div className="profile-achievements">{achievements.map((a, i) => (
              <div key={i} className="profile-achievement"><span className="profile-achievement-icon">{a.icon || '🏅'}</span><div><strong>{a.title}</strong><span>{a.description}</span></div><span className="profile-achievement-pts">+{a.points}</span></div>
            ))}</div>
          </motion.div>
        )}
      </div>

      {/* Report User Modal */}
      {!isOwn && (
        <ReportModal
          isOpen={showReport}
          onClose={() => setShowReport(false)}
          contentType="user"
          contentId={u.id}
          targetName={u.name}
        />
      )}
    </motion.div>
  );
}
