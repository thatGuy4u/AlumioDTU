import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectCurrentUser, selectToken, setCredentials } from '../../store/slices/authSlice';
import { BRANCHES, INDUSTRIES, API_URL } from '../../utils/constants';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiOutlineBriefcase, HiOutlineUser, HiOutlineAcademicCap, HiOutlineHeart, HiOutlineCheck, HiOutlineArrowRight, HiOutlineArrowLeft, HiOutlineShieldCheck } from 'react-icons/hi2';
import EmailVerificationPopup from '../../components/EmailVerificationPopup';

const steps = ['About You', 'Work Experience', 'DTU Background', 'Mentorship'];

// Required fields per step
const requiredByStep = [
  [],                                           // Step 0: About You (optional)
  [],                                           // Step 1: Work (optional)
  ['rollNumber', 'branch', 'graduationYear'],   // Step 2: DTU Background
  [],                                           // Step 3: Mentorship (optional toggle)
];

const fieldLabels = {
  bio: 'Bio', company: 'Company', designation: 'Designation', industry: 'Industry',
  location: 'Location', experience: 'Years of Experience', branch: 'Branch',
  graduationYear: 'Graduation Year', rollNumber: 'Roll Number', skills: 'Skills',
};

export default function AlumniOnboarding() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bio: '', company: '', designation: '', industry: '', location: '', experience: '',
    branch: '', graduationYear: '', rollNumber: '', skills: '', linkedinProfile: '',
    mentorshipAvailability: false, mentorshipCapacity: '3',
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const validateStep = (s) => {
    const missing = requiredByStep[s].filter(f => !form[f]?.toString().trim());
    if (missing.length > 0) {
      toast.error(`Please fill: ${missing.map(f => fieldLabels[f]).join(', ')}`);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    setLoading(true);
    try {
      const payload = {
        bio: form.bio || undefined, company: form.company || undefined, designation: form.designation || undefined,
        industry: form.industry || undefined, location: form.location || undefined,
        experience: form.experience ? parseInt(form.experience) : undefined,
        branch: form.branch || undefined,
        graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
        rollNumber: form.rollNumber || undefined,
        skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        linkedinProfile: form.linkedinProfile || undefined,
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

  // Helper to render label with required asterisk
  const Label = ({ text, required }) => (
    <label>{text}{required && <span className="required-mark"> *</span>}</label>
  );

  return (
    <div className="onboarding-page">
      <EmailVerificationPopup />
      <div className="onboarding-header">
        <h1>Welcome back, <span className="text-gold">{user?.name?.split(' ')[0]}</span> 💼</h1>
        <p>Set up your alumni profile and start giving back to the DTU community</p>
      </div>

      {/* Motivational Banner */}
      <div className="onboarding-motivation-banner">
        <div className="onboarding-motivation-inner">
          <div className="onboarding-motivation-icon alumni">🔓</div>
          <div className="onboarding-motivation-text">
            <strong>Complete required details to make your profile visible</strong>
            <span>Fill in your <span className="motivation-highlight">Roll No, Branch & Graduation Year</span> — work details like company, role & experience are optional and can be added anytime if your company allows.</span>
          </div>
          <div className="onboarding-motivation-badge alumni">
            <HiOutlineShieldCheck size={13} /> Required
          </div>
        </div>
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
              <div className="auth-field"><Label text="BIO" /><textarea className="onboarding-textarea" placeholder="Your professional summary..." value={form.bio} onChange={e => update('bio', e.target.value)} rows={3} /></div>
              <div className="auth-field"><Label text="LINKEDIN PROFILE" /><input className="onboarding-input" placeholder="https://linkedin.com/in/..." value={form.linkedinProfile} onChange={e => update('linkedinProfile', e.target.value)} /></div>
            </div>
          )}
          {step === 1 && (
            <div className="onboarding-fields">
              <h3>Current Work</h3>
              <div className="onboarding-row">
                <div className="auth-field"><Label text="COMPANY" /><input className="onboarding-input" placeholder="e.g. Google" value={form.company} onChange={e => update('company', e.target.value)} /></div>
                <div className="auth-field"><Label text="DESIGNATION" /><input className="onboarding-input" placeholder="e.g. Senior SDE" value={form.designation} onChange={e => update('designation', e.target.value)} /></div>
              </div>
              <div className="onboarding-row">
                <div className="auth-field"><Label text="INDUSTRY" />
                  <select className="onboarding-input" value={form.industry} onChange={e => update('industry', e.target.value)}>
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="auth-field"><Label text="LOCATION" /><input className="onboarding-input" placeholder="e.g. Bangalore, India" value={form.location} onChange={e => update('location', e.target.value)} /></div>
              </div>
              <div className="auth-field"><Label text="YEARS OF EXPERIENCE" /><input className="onboarding-input" type="number" min="0" max="50" placeholder="e.g. 5" value={form.experience} onChange={e => update('experience', e.target.value)} /></div>
            </div>
          )}
          {step === 2 && (
            <div className="onboarding-fields">
              <h3>DTU Background</h3>
              <div className="auth-field"><Label text="ROLL NUMBER" required /><input className="onboarding-input" placeholder="e.g. 2K19/CO/123" value={form.rollNumber} onChange={e => update('rollNumber', e.target.value)} /></div>
              <div className="onboarding-row">
                <div className="auth-field"><Label text="BRANCH" required />
                  <select className="onboarding-input" value={form.branch} onChange={e => update('branch', e.target.value)}>
                    <option value="">Select Branch</option>
                    {BRANCHES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>
                <div className="auth-field"><Label text="GRADUATION YEAR" required /><input className="onboarding-input" type="number" min="1960" max="2025" placeholder="e.g. 2019" value={form.graduationYear} onChange={e => update('graduationYear', e.target.value)} /></div>
              </div>
              <div className="auth-field"><Label text="SKILLS (comma-separated)" /><input className="onboarding-input" placeholder="React, Cloud, System Design..." value={form.skills} onChange={e => update('skills', e.target.value)} /></div>
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
                  <Label text="MAX MENTEES AT A TIME" />
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
          <button className="auth-submit-btn" style={{ width: 'auto', padding: '12px 32px' }} onClick={handleNext}>Next <HiOutlineArrowRight size={16} /></button>
        ) : (
          <button className="auth-submit-btn" style={{ width: 'auto', padding: '12px 32px' }} onClick={handleSubmit} disabled={loading}>{loading ? <span className="auth-spinner" /> : 'Complete Profile →'}</button>
        )}
      </div>
    </div>
  );
}
