import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectCurrentUser, selectToken, setCredentials } from '../../store/slices/authSlice';
import { BRANCHES, INDUSTRIES, API_URL } from '../../utils/constants';
import axios from 'axios';
import { HiOutlineBriefcase, HiOutlineUser, HiOutlineAcademicCap, HiOutlineHeart, HiOutlineCheck, HiOutlineArrowRight, HiOutlineArrowLeft } from 'react-icons/hi2';

const steps = ['About You', 'Work Experience', 'DTU Background', 'Mentorship'];

export default function AlumniOnboarding() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bio: '', company: '', designation: '', industry: '', location: '', experience: '',
    branch: '', graduationYear: '', skills: '', linkedinProfile: '',
    mentorshipAvailability: false, mentorshipCapacity: '3',
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        bio: form.bio, company: form.company, designation: form.designation,
        industry: form.industry, location: form.location,
        experience: form.experience ? parseInt(form.experience) : 0,
        branch: form.branch || undefined,
        graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
        skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        linkedinProfile: form.linkedinProfile,
        mentorshipAvailability: form.mentorshipAvailability,
        mentorshipCapacity: parseInt(form.mentorshipCapacity) || 3,
      };
      const res = await axios.put(`${API_URL}/users/onboarding`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        dispatch(setCredentials({ user: res.data.data.user, accessToken: token, profile: res.data.data.profile }));
        navigate('/app/dashboard');
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const stepIcons = [HiOutlineUser, HiOutlineBriefcase, HiOutlineAcademicCap, HiOutlineHeart];

  return (
    <div className="onboarding-page">
      <div className="onboarding-header">
        <h1>Welcome back, <span className="text-gold">{user?.name?.split(' ')[0]}</span> 💼</h1>
        <p>Set up your alumni profile and start giving back to the DTU community</p>
      </div>

      <div className="onboarding-steps">
        {steps.map((s, i) => {
          const Icon = stepIcons[i];
          return (
            <div key={i} className={`onboarding-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} onClick={() => i < step && setStep(i)}>
              <div className="onboarding-step-icon">{i < step ? <HiOutlineCheck size={16} /> : <Icon size={16} />}</div>
              <span>{s}</span>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} className="onboarding-card" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
          {step === 0 && (
            <div className="onboarding-fields">
              <h3>Tell us about yourself</h3>
              <div className="auth-field"><label>BIO</label><textarea className="onboarding-textarea" placeholder="Your professional summary..." value={form.bio} onChange={e => update('bio', e.target.value)} rows={3} /></div>
              <div className="auth-field"><label>LINKEDIN PROFILE</label><input className="onboarding-input" placeholder="https://linkedin.com/in/..." value={form.linkedinProfile} onChange={e => update('linkedinProfile', e.target.value)} /></div>
            </div>
          )}
          {step === 1 && (
            <div className="onboarding-fields">
              <h3>Current Work</h3>
              <div className="onboarding-row">
                <div className="auth-field"><label>COMPANY</label><input className="onboarding-input" placeholder="e.g. Google" value={form.company} onChange={e => update('company', e.target.value)} /></div>
                <div className="auth-field"><label>DESIGNATION</label><input className="onboarding-input" placeholder="e.g. Senior SDE" value={form.designation} onChange={e => update('designation', e.target.value)} /></div>
              </div>
              <div className="onboarding-row">
                <div className="auth-field"><label>INDUSTRY</label>
                  <select className="onboarding-input" value={form.industry} onChange={e => update('industry', e.target.value)}>
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="auth-field"><label>LOCATION</label><input className="onboarding-input" placeholder="e.g. Bangalore, India" value={form.location} onChange={e => update('location', e.target.value)} /></div>
              </div>
              <div className="auth-field"><label>YEARS OF EXPERIENCE</label><input className="onboarding-input" type="number" min="0" max="50" placeholder="e.g. 5" value={form.experience} onChange={e => update('experience', e.target.value)} /></div>
            </div>
          )}
          {step === 2 && (
            <div className="onboarding-fields">
              <h3>DTU Background</h3>
              <div className="onboarding-row">
                <div className="auth-field"><label>BRANCH</label>
                  <select className="onboarding-input" value={form.branch} onChange={e => update('branch', e.target.value)}>
                    <option value="">Select Branch</option>
                    {BRANCHES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>
                <div className="auth-field"><label>GRADUATION YEAR</label><input className="onboarding-input" type="number" min="1960" max="2025" placeholder="e.g. 2019" value={form.graduationYear} onChange={e => update('graduationYear', e.target.value)} /></div>
              </div>
              <div className="auth-field"><label>SKILLS (comma-separated)</label><input className="onboarding-input" placeholder="React, Cloud, System Design..." value={form.skills} onChange={e => update('skills', e.target.value)} /></div>
            </div>
          )}
          {step === 3 && (
            <div className="onboarding-fields">
              <h3>Mentorship Availability</h3>
              <p className="onboarding-desc">Would you like to mentor current DTU students?</p>
              <label className="onboarding-toggle">
                <input type="checkbox" checked={form.mentorshipAvailability} onChange={e => update('mentorshipAvailability', e.target.checked)} />
                <span className="toggle-slider" />
                <span>I'm available to mentor students</span>
              </label>
              {form.mentorshipAvailability && (
                <div className="auth-field" style={{ marginTop: 16 }}>
                  <label>MAX MENTEES AT A TIME</label>
                  <input className="onboarding-input" type="number" min="1" max="10" value={form.mentorshipCapacity} onChange={e => update('mentorshipCapacity', e.target.value)} />
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="onboarding-nav">
        {step > 0 && <button className="onboarding-back-btn" onClick={() => setStep(step - 1)}><HiOutlineArrowLeft size={16} /> Back</button>}
        <div style={{ flex: 1 }} />
        {step < steps.length - 1 ? (
          <button className="auth-submit-btn" style={{ width: 'auto', padding: '12px 32px' }} onClick={() => setStep(step + 1)}>Next <HiOutlineArrowRight size={16} /></button>
        ) : (
          <button className="auth-submit-btn" style={{ width: 'auto', padding: '12px 32px' }} onClick={handleSubmit} disabled={loading}>{loading ? <span className="auth-spinner" /> : 'Complete Profile →'}</button>
        )}
      </div>
    </div>
  );
}
