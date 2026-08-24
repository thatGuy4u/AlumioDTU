import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectCurrentUser, setCredentials } from '../../store/slices/authSlice';
import { BRANCHES } from '../../utils/constants';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import { selectToken } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { HiOutlineAcademicCap, HiOutlineUser, HiOutlineCodeBracket, HiOutlineRocketLaunch, HiOutlineCheck, HiOutlineArrowRight, HiOutlineArrowLeft, HiOutlineClock } from 'react-icons/hi2';
import EmailVerificationPopup from '../../components/EmailVerificationPopup';

const steps = ['Basic Info', 'Academics', 'Skills & Interests', 'Career Goals'];

// Required fields per step
const requiredByStep = [
  ['bio'],                          // Step 0: Basic Info
  ['branch', 'year', 'graduationYear', 'rollNumber'], // Step 1: Academics
  ['skills'],                       // Step 2: Skills & Interests
  ['careerGoals'],                  // Step 3: Career Goals
];

const fieldLabels = {
  bio: 'Bio', branch: 'Branch', year: 'Current Year', graduationYear: 'Graduation Year',
  rollNumber: 'Roll Number', skills: 'Skills', careerGoals: 'Career Goals',
};

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bio: '', branch: '', year: '', graduationYear: '', rollNumber: '',
    skills: '', interests: '', careerGoals: '', linkedinUrl: '', githubUrl: '',
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
        bio: form.bio,
        branch: form.branch || undefined,
        year: form.year ? parseInt(form.year) : undefined,
        graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined,
        rollNumber: form.rollNumber,
        skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        interests: form.interests ? form.interests.split(',').map(s => s.trim()).filter(Boolean) : [],
        careerGoals: form.careerGoals,
        socialLinks: { linkedin: form.linkedinUrl, github: form.githubUrl },
      };
      const res = await axios.put(`${API_URL}/users/onboarding`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        dispatch(setCredentials({ user: res.data.data.user, accessToken: token, profile: res.data.data.profile }));
        navigate('/app/dashboard');
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const stepIcons = [HiOutlineUser, HiOutlineAcademicCap, HiOutlineCodeBracket, HiOutlineRocketLaunch];

  // Helper to render label with required asterisk
  const Label = ({ text, required }) => (
    <label>{text}{required && <span className="required-mark"> *</span>}</label>
  );

  return (
    <div className="onboarding-page">
      <EmailVerificationPopup />
      <div className="onboarding-header">
        <h1>Welcome, <span className="text-gold">{user?.name?.split(' ')[0]}</span> 🎓</h1>
        <p>Let's set up your student profile to get the most out of AlumioDTU</p>
      </div>

      {/* Motivational Banner */}
      <div className="onboarding-motivation-banner">
        <div className="onboarding-motivation-inner">
          <div className="onboarding-motivation-icon student">⚡</div>
          <div className="onboarding-motivation-text">
            <strong>Just ~2 minutes to complete your profile!</strong>
            <span>Set up now to <span className="motivation-highlight">connect with alumni, find mentors, and discover opportunities</span> — your DTU network is waiting for you.</span>
          </div>
          <div className="onboarding-motivation-badge student">
            <HiOutlineClock size={13} /> ~2 min
          </div>
        </div>
      </div>

      {/* Step Indicator */}
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

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div key={step} className="onboarding-card" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
          {step === 0 && (
            <div className="onboarding-fields">
              <h3>Tell us about yourself</h3>
              <div className="auth-field"><Label text="BIO" required /><textarea className="onboarding-textarea" placeholder="A short bio about yourself..." value={form.bio} onChange={e => update('bio', e.target.value)} rows={3} /></div>
              <div className="onboarding-row">
                <div className="auth-field"><Label text="LINKEDIN URL" /><input className="onboarding-input" placeholder="https://linkedin.com/in/..." value={form.linkedinUrl} onChange={e => update('linkedinUrl', e.target.value)} /></div>
                <div className="auth-field"><Label text="GITHUB URL" /><input className="onboarding-input" placeholder="https://github.com/..." value={form.githubUrl} onChange={e => update('githubUrl', e.target.value)} /></div>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="onboarding-fields">
              <h3>Academic Details</h3>
              <div className="onboarding-row">
                <div className="auth-field"><Label text="BRANCH" required />
                  <select className="onboarding-input" value={form.branch} onChange={e => update('branch', e.target.value)}>
                    <option value="">Select Branch</option>
                    {BRANCHES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>
                <div className="auth-field"><Label text="CURRENT YEAR" required /><input className="onboarding-input" type="number" min="1" max="5" placeholder="e.g. 3" value={form.year} onChange={e => update('year', e.target.value)} /></div>
              </div>
              <div className="onboarding-row">
                <div className="auth-field"><Label text="GRADUATION YEAR" required /><input className="onboarding-input" type="number" min="2020" max="2035" placeholder="e.g. 2026" value={form.graduationYear} onChange={e => update('graduationYear', e.target.value)} /></div>
                <div className="auth-field"><Label text="ROLL NUMBER" required /><input className="onboarding-input" placeholder="e.g. 2K21/CO/123" value={form.rollNumber} onChange={e => update('rollNumber', e.target.value)} /></div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="onboarding-fields">
              <h3>Skills & Interests</h3>
              <div className="auth-field"><Label text="SKILLS (comma-separated)" required /><input className="onboarding-input" placeholder="React, Node.js, Python, ML..." value={form.skills} onChange={e => update('skills', e.target.value)} /></div>
              <div className="auth-field"><Label text="INTERESTS (comma-separated)" /><input className="onboarding-input" placeholder="Web Dev, AI/ML, Open Source..." value={form.interests} onChange={e => update('interests', e.target.value)} /></div>
            </div>
          )}
          {step === 3 && (
            <div className="onboarding-fields">
              <h3>Career Goals</h3>
              <div className="auth-field"><Label text="WHAT ARE YOUR CAREER ASPIRATIONS?" required /><textarea className="onboarding-textarea" rows={4} placeholder="Tell us where you see yourself in 5 years..." value={form.careerGoals} onChange={e => update('careerGoals', e.target.value)} /></div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
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
