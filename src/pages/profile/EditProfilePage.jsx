import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { selectToken, selectCurrentUser, selectProfile, updateUser, setProfile } from '../../store/slices/authSlice';
import { API_URL, BRANCHES, INDUSTRIES } from '../../utils/constants';
import {
  HiOutlineUser, HiOutlineCamera, HiOutlineAcademicCap,
  HiOutlineBriefcase, HiOutlineGlobeAlt, HiOutlineXMark,
  HiOutlinePlusCircle, HiOutlineArrowLeft, HiOutlineCheckCircle,
} from 'react-icons/hi2';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function EditProfilePage() {
  const token = useSelector(selectToken);
  const user = useSelector(selectCurrentUser);
  const profile = useSelector(selectProfile);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [userData, setUserData] = useState({ name: '', socialLinks: {} });
  const [profileData, setProfileData] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { user: u, profile: p } = res.data.data;
        setUserData({
          name: u.name || '',
          socialLinks: typeof u.socialLinks === 'object' ? u.socialLinks : {},
        });
        setProfileData(p || {});
      } catch (e) {
        toast.error('Failed to load profile');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [token]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    setAvatarUploading(true);
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await axios.post(`${API_URL}/users/profile/avatar`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      dispatch(updateUser({ avatar: res.data.data.avatar }));
      toast.success('Avatar updated!');
    } catch {
      toast.error('Upload failed');
    }
    setAvatarUploading(false);
  };

  const addTag = (type) => {
    const input = type === 'skills' ? skillInput : interestInput;
    const val = input.trim();
    if (!val) return;
    const arr = profileData[type] || [];
    if (arr.includes(val)) return;
    setProfileData(prev => ({ ...prev, [type]: [...arr, val] }));
    type === 'skills' ? setSkillInput('') : setInterestInput('');
  };

  const removeTag = (type, tag) => {
    setProfileData(prev => ({ ...prev, [type]: (prev[type] || []).filter(t => t !== tag) }));
  };

  // Social link URL validators — only allow valid platform URLs (or empty)
  const socialValidators = {
    linkedin: (v) => /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/i.test(v),
    github: (v) => /^https?:\/\/(www\.)?github\.com\/.+/i.test(v),
    twitter: (v) => /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/i.test(v),
    portfolio: (v) => /^https?:\/\/.+\..+/i.test(v),
  };
  const socialLabels = { linkedin: 'LinkedIn', github: 'GitHub', twitter: 'X (Twitter)', portfolio: 'Portfolio' };

  const handleSave = async () => {

    // Validate social links
    const socials = userData.socialLinks || {};
    for (const [key, validator] of Object.entries(socialValidators)) {
      const val = socials[key]?.trim();
      if (val && !validator(val)) {
        toast.error(`Invalid ${socialLabels[key]} URL. Please enter a valid ${socialLabels[key]} profile link.`);
        return;
      }
    }

    setSaving(true);
    try {
      const body = { name: userData.name, socialLinks: userData.socialLinks };
      // Pick profile-specific fields
      const profileFields = { ...profileData };
      delete profileFields.id;
      delete profileFields.userId;
      delete profileFields.createdAt;
      delete profileFields.updatedAt;
      delete profileFields.user;
      delete profileFields.profileCompletionScore;

      Object.assign(body, profileFields);
      const res = await axios.put(`${API_URL}/users/profile`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(updateUser(res.data.data.user));
      dispatch(setProfile(res.data.data.profile));
      toast.success('Profile saved!');
      navigate('/app/profile');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    }
    setSaving(false);
  };

  if (loading) return <div className="page-loader"><span className="auth-spinner-large" /></div>;

  const isStudent = user?.role === 'student';
  const isAlumni = user?.role === 'alumni';

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-header">
        <button className="onboarding-back-btn" onClick={() => navigate(-1)}>
          <HiOutlineArrowLeft size={18} /> Back
        </button>
        <h1>Edit <span className="text-gold">Profile</span></h1>
      </div>

      <motion.div className="edit-profile-grid" variants={container} initial="hidden" animate="show">
        {/* Avatar Section */}
        <motion.section className="edit-section" variants={item}>
          <h3><HiOutlineCamera size={18} /> Profile Photo</h3>
          <div className="edit-avatar-area">
            <div className="edit-avatar">
              {user?.avatar ? <img src={user.avatar} alt="" /> : <span>{user?.name?.[0]}</span>}
              {avatarUploading && <div className="edit-avatar-overlay"><span className="auth-spinner" /></div>}
            </div>
            <label className="profile-edit-btn" style={{ cursor: 'pointer' }}>
              Change Photo
              <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
            </label>
          </div>
        </motion.section>

        {/* Basic Info */}
        <motion.section className="edit-section" variants={item}>
          <h3><HiOutlineUser size={18} /> Basic Info</h3>
          <div className="edit-field">
            <label>Full Name</label>
            <input className="onboarding-input" value={userData.name} onChange={e => setUserData(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="edit-field">
            <label>Bio</label>
            <textarea className="onboarding-input" style = {{resize: "none"}} rows={3} value={profileData.bio || ''} onChange={e => setProfileData(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself..." />
          </div>
        </motion.section>

        {/* Academic / Professional */}
        <motion.section className="edit-section" variants={item}>
          <h3><HiOutlineAcademicCap size={18} /> {isStudent ? 'Academic Info' : 'Professional Info'}</h3>
          <div className="edit-fields-row">
            <div className="edit-field">
              <label>Branch</label>
              <select className="onboarding-input" value={profileData.branch || ''} onChange={e => setProfileData(p => ({ ...p, branch: e.target.value || null }))}>
                <option value="">Select</option>
                {BRANCHES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            {isStudent && (
              <>
                <div className="edit-field">
                  <label>Year</label>
                  <select className="onboarding-input" value={profileData.year || ''} onChange={e => setProfileData(p => ({ ...p, year: e.target.value ? parseInt(e.target.value) : null }))}>
                    <option value="">Select</option>
                    {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div className="edit-field">
                  <label>Graduation Year</label>
                  <input className="onboarding-input" type="number" min={2000} max={2035} value={profileData.graduationYear || ''} onChange={e => setProfileData(p => ({ ...p, graduationYear: e.target.value ? parseInt(e.target.value) : null }))} />
                </div>
                <div className="edit-field">
                  <label>Roll Number</label>
                  <input className="onboarding-input" value={profileData.rollNumber || ''} onChange={e => setProfileData(p => ({ ...p, rollNumber: e.target.value }))} />
                </div>
                <div className="edit-field full">
                  <label>Career Goals</label>
                  <textarea className="onboarding-input" rows={2} style = {{resize: "none"}} value={profileData.careerGoals || ''} onChange={e => setProfileData(p => ({ ...p, careerGoals: e.target.value }))} placeholder="What are you working towards?" />
                </div>
              </>
            )}
            {isAlumni && (
              <>
                <div className="edit-field">
                  <label>Graduation Year</label>
                  <input className="onboarding-input" type="number" min={1990} max={2030} value={profileData.graduationYear || ''} onChange={e => setProfileData(p => ({ ...p, graduationYear: e.target.value ? parseInt(e.target.value) : null }))} />
                </div>
                <div className="edit-field">
                  <label>Company</label>
                  <input className="onboarding-input" value={profileData.company || ''} onChange={e => setProfileData(p => ({ ...p, company: e.target.value }))} />
                </div>
                <div className="edit-field">
                  <label>Designation</label>
                  <input className="onboarding-input" value={profileData.designation || ''} onChange={e => setProfileData(p => ({ ...p, designation: e.target.value }))} />
                </div>
                <div className="edit-field">
                  <label>Industry</label>
                  <select className="onboarding-input" value={profileData.industry || ''} onChange={e => setProfileData(p => ({ ...p, industry: e.target.value }))}>
                    <option value="">Select</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="edit-field">
                  <label>Location</label>
                  <input className="onboarding-input" value={profileData.location || ''} onChange={e => setProfileData(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Bangalore, India" />
                </div>
                <div className="edit-field">
                  <label>Experience (years)</label>
                  <input className="onboarding-input" type="number" min={0} max={50} value={profileData.experience ?? ''} onChange={e => setProfileData(p => ({ ...p, experience: e.target.value ? parseInt(e.target.value) : 0 }))} />
                </div>
                <div className="edit-field">
                  <label>LinkedIn Profile</label>
                  <input className="onboarding-input" value={profileData.linkedinProfile || ''} onChange={e => setProfileData(p => ({ ...p, linkedinProfile: e.target.value }))} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="edit-field">
                  <label>Mentorship Available</label>
                  <div className="edit-toggle-row">
                    <button className={`edit-toggle ${profileData.mentorshipAvailability ? 'active' : ''}`} onClick={() => setProfileData(p => ({ ...p, mentorshipAvailability: !p.mentorshipAvailability }))}>
                      {profileData.mentorshipAvailability ? 'Available' : 'Not Available'}
                    </button>
                    {profileData.mentorshipAvailability && (
                      <div className="edit-field" style={{ marginBottom: 0, flex: '0 0 auto' }}>
                        <label style={{ fontSize: '0.75rem' }}>Max Mentees</label>
                        <input className="onboarding-input" type="number" min={1} max={10} value={profileData.mentorshipCapacity || 3} onChange={e => setProfileData(p => ({ ...p, mentorshipCapacity: parseInt(e.target.value) || 3 }))} style={{ width: 70 }} />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.section>

        {/* Skills */}
        <motion.section className="edit-section" variants={item}>
          <h3><HiOutlineBriefcase size={18} /> Skills</h3>
          <div className="edit-tag-input-row">
            <input className="onboarding-input" value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('skills'))} />
            <button className="profile-edit-btn" onClick={() => addTag('skills')}><HiOutlinePlusCircle size={16} /> Add</button>
          </div>
          <div className="edit-tags">
            {(profileData.skills || []).map((s, i) => (
              <span key={i} className="dash-tag">
                {s} <button onClick={() => removeTag('skills', s)}><HiOutlineXMark size={12} /></button>
              </span>
            ))}
          </div>
          {isStudent && (
            <>
              <h4 style={{ marginTop: 16 }}>Interests</h4>
              <div className="edit-tag-input-row">
                <input className="onboarding-input" value={interestInput} onChange={e => setInterestInput(e.target.value)} placeholder="Add an interest..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('interests'))} />
                <button className="profile-edit-btn" onClick={() => addTag('interests')}><HiOutlinePlusCircle size={16} /> Add</button>
              </div>
              <div className="edit-tags">
                {(profileData.interests || []).map((s, i) => (
                  <span key={i} className="dash-tag secondary">
                    {s} <button onClick={() => removeTag('interests', s)}><HiOutlineXMark size={12} /></button>
                  </span>
                ))}
              </div>
            </>
          )}
        </motion.section>

        {/* Social Links */}
        <motion.section className="edit-section" variants={item}>
          <h3><HiOutlineGlobeAlt size={18} /> Social Links</h3>
          <div className="edit-fields-row">
            {['linkedin', 'github', 'twitter', 'portfolio'].map(key => {
              const labels = { linkedin: 'LinkedIn', github: 'GitHub', twitter: 'X (Twitter)', portfolio: 'Portfolio' };
              return (
              <div className="edit-field" key={key}>
                <label>{labels[key]}</label>
                <input className="onboarding-input" value={userData.socialLinks?.[key] || ''} onChange={e => setUserData(p => ({ ...p, socialLinks: { ...p.socialLinks, [key]: e.target.value } }))} placeholder={key === 'twitter' ? 'https://x.com/...' : `https://${key}.com/...`} />
              </div>
              );
            })}
          </div>
        </motion.section>
      </motion.div>

      {/* Save Bar */}
      <div className="edit-save-bar">
        <button className="onboarding-back-btn" onClick={() => navigate(-1)}>Cancel</button>
        <button className="auth-submit-btn" onClick={handleSave} disabled={saving} style={{ width: 'auto', padding: '12px 32px' }}>
          {saving ? <span className="auth-spinner" /> : <><HiOutlineCheckCircle size={18} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
