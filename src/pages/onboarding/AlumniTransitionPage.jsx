import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectCurrentUser, selectToken, selectProfile, setCredentials } from '../../store/slices/authSlice';
import { BRANCHES, INDUSTRIES } from '../../utils/constants';
import api from '../../utils/apiClient';
import toast from 'react-hot-toast';
import {
  HiOutlineBriefcase, HiOutlineUser, HiOutlineAcademicCap,
  HiOutlineHeart, HiOutlineCheck, HiOutlineArrowRight,
  HiOutlineArrowLeft, HiOutlineExclamationTriangle,
} from 'react-icons/hi2';

const steps = ['Your Info', 'Work Experience', 'Mentorship'];

const requiredByStep = [
  [],                                                // Step 0: pre-filled, just confirm
  ['company', 'designation', 'industry', 'location'], // Step 1: Work
  [],                                                // Step 2: Mentorship (optional)
];

const fieldLabels = {
  company: 'Company', designation: 'Designation', industry: 'Industry',
  location: 'Location', experience: 'Years of Experience',
};

export default function AlumniTransitionPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);
  const profile = useSelector(selectProfile);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pre-fill from existing student profile
  const [form, setForm] = useState({
    bio: '', company: '', designation: '', industry: '', location: '',
    experience: '', linkedinProfile: '', mentorshipAvailability: false,
    mentorshipCapacity: '3',
  });

  // Pre-fill common fields from student profile on mount
  useEffect(() => {
    if (profile) {
      setForm(prev => ({
        ...prev,
        bio: profile.bio || '',
      }));
    }
  }, [profile]);

  // Redirect if not a student
  useEffect(() => {
    if (user && user.role !== 'student') {
      navigate('/app/dashboard');
    }
  }, [user, navigate]);

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
        company: form.company,
        designation: form.designation,
        industry: form.industry,
        location: form.location,
        experience: form.experience ? parseInt(form.experience) : 0,
        linkedinProfile: form.linkedinProfile,
        mentorshipAvailability: form.mentorshipAvailability,
        mentorshipCapacity: parseInt(form.mentorshipCapacity) || 3,
      };
      const res = await api.post('/users/convert-to-alumni', payload);
      if (res.data.success) {
        dispatch(setCredentials({
          user: res.data.data.user,
          accessToken: token,
          profile: res.data.data.profile,
        }));
        toast.success('🎉 Welcome to the Alumni Network!');
        navigate('/app/dashboard');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to convert account');
      console.error(e);
    }
    setLoading(false);
  };

  const graduationYear = profile?.graduationYear || new Date().getFullYear();
  const deadline = `September 30, ${graduationYear}`;
  const stepIcons = [HiOutlineUser, HiOutlineBriefcase, HiOutlineHeart];

  const Label = ({ text, required }) => (
    <label>{text}{required && <span className="required-mark"> *</span>}</label>
  );

  return (
    <div className="onboarding-page">
      <div className="onboarding-header">
        <h1>Congratulations, <span className="text-gold">{user?.name?.split(' ')[0]}</span> 🎓</h1>
        <p>You've graduated! Let's transition your student account to an alumni profile.</p>
      </div>

      {/* Deadline warning */}
      <motion.div
        className="graduation-transition-warning"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <HiOutlineExclamationTriangle size={20} />
        <div>
          <strong>Your student account will be deleted on {deadline}</strong>
          <span>Complete this transition to keep all your data, connections, and achievements.</span>
        </div>
      </motion.div>

      {/* Preserved data summary */}
      {step === 0 && (
        <motion.div
          className="transition-data-summary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3>Your data that will be preserved:</h3>
          <div className="transition-data-grid">
            <div className="transition-data-item">
              <span className="transition-data-label">Branch</span>
              <span className="transition-data-value">{profile?.branch || '—'}</span>
            </div>
            <div className="transition-data-item">
              <span className="transition-data-label">Graduation Year</span>
              <span className="transition-data-value">{profile?.graduationYear || '—'}</span>
            </div>
            <div className="transition-data-item">
              <span className="transition-data-label">Skills</span>
              <span className="transition-data-value">{profile?.skills?.join(', ') || '—'}</span>
            </div>
            <div className="transition-data-item">
              <span className="transition-data-label">Bio</span>
              <span className="transition-data-value">{profile?.bio?.substring(0, 80) || '—'}{profile?.bio?.length > 80 ? '...' : ''}</span>
            </div>
          </div>
          <p className="transition-data-note">
            ✅ Your posts, messages, achievements, and connections will also be preserved.
          </p>
        </motion.div>
      )}

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
              <h3>Confirm Your Information</h3>
              <p className="onboarding-desc">
                The fields below are pre-filled from your student profile. You can update your bio if you'd like.
              </p>
              <div className="auth-field">
                <Label text="BIO" />
                <textarea className="onboarding-textarea" placeholder="Your professional summary..." value={form.bio} onChange={e => update('bio', e.target.value)} rows={3} />
              </div>
              <div className="auth-field">
                <Label text="LINKEDIN PROFILE" />
                <input className="onboarding-input" placeholder="https://linkedin.com/in/..." value={form.linkedinProfile} onChange={e => update('linkedinProfile', e.target.value)} />
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="onboarding-fields">
              <h3>Current Work</h3>
              <p className="onboarding-desc">Tell us about your professional life after DTU.</p>
              <div className="onboarding-row">
                <div className="auth-field"><Label text="COMPANY" required /><input className="onboarding-input" placeholder="e.g. Google" value={form.company} onChange={e => update('company', e.target.value)} /></div>
                <div className="auth-field"><Label text="DESIGNATION" required /><input className="onboarding-input" placeholder="e.g. Senior SDE" value={form.designation} onChange={e => update('designation', e.target.value)} /></div>
              </div>
              <div className="onboarding-row">
                <div className="auth-field"><Label text="INDUSTRY" required />
                  <select className="onboarding-input" value={form.industry} onChange={e => update('industry', e.target.value)}>
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="auth-field"><Label text="LOCATION" required /><input className="onboarding-input" placeholder="e.g. Bangalore, India" value={form.location} onChange={e => update('location', e.target.value)} /></div>
              </div>
              <div className="auth-field"><Label text="YEARS OF EXPERIENCE" /><input className="onboarding-input" type="number" min="0" max="50" placeholder="e.g. 1" value={form.experience} onChange={e => update('experience', e.target.value)} /></div>
            </div>
          )}
          {step === 2 && (
            <div className="onboarding-fields">
              <h3>Mentorship Availability</h3>
              <p className="onboarding-desc">Would you like to give back by mentoring current DTU students?</p>
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

      {/* Navigation */}
      <div className="onboarding-nav">
        {step > 0 && <button className="onboarding-back-btn" onClick={() => setStep(step - 1)}><HiOutlineArrowLeft size={16} /> Back</button>}
        <div style={{ flex: 1 }} />
        {step < steps.length - 1 ? (
          <button className="auth-submit-btn" style={{ width: 'auto', padding: '12px 32px' }} onClick={handleNext}>Next <HiOutlineArrowRight size={16} /></button>
        ) : (
          <button className="auth-submit-btn" style={{ width: 'auto', padding: '12px 32px' }} onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="auth-spinner" /> : '🎓 Complete Transition →'}
          </button>
        )}
      </div>
    </div>
  );
}
