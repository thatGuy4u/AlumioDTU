import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/slices/authSlice';
import { API_URL } from '../../utils/constants';
import {
  HiOutlineArrowLeft, HiOutlinePlusCircle, HiOutlineXMark,
  HiOutlineBriefcase, HiOutlineRocketLaunch,
} from 'react-icons/hi2';

const JOB_TYPES = [
  { value: 'internship', label: 'Internship' },
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
];
const WORK_MODES = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'Onsite' },
  { value: 'hybrid', label: 'Hybrid' },
];

export default function PostJobPage() {
  const token = useSelector(selectToken);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [reqInput, setReqInput] = useState('');

  const [form, setForm] = useState({
    title: '', company: '', type: 'full_time', workMode: 'onsite',
    location: '', description: '', requirements: [], skills: [],
    salaryMin: '', salaryMax: '', stipendMin: '', stipendMax: '',
    experienceMin: '0', experienceMax: '', applicationDeadline: '',
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !form.skills.includes(v)) set('skills', [...form.skills, v]);
    setSkillInput('');
  };

  const addReq = () => {
    const v = reqInput.trim();
    if (v) set('requirements', [...form.requirements, v]);
    setReqInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.description) {
      return toast.error('Title, company, and description are required');
    }
    setSaving(true);
    try {
      const body = {
        title: form.title, company: form.company, type: form.type,
        workMode: form.workMode, location: form.location || undefined,
        description: form.description, requirements: form.requirements, skills: form.skills,
        experienceMin: parseInt(form.experienceMin) || 0,
        experienceMax: form.experienceMax ? parseInt(form.experienceMax) : undefined,
        applicationDeadline: form.applicationDeadline || undefined,
      };
      if (form.type === 'internship') {
        if (form.stipendMin) body.stipendMin = parseInt(form.stipendMin);
        if (form.stipendMax) body.stipendMax = parseInt(form.stipendMax);
      } else {
        if (form.salaryMin) body.salaryMin = parseInt(form.salaryMin);
        if (form.salaryMax) body.salaryMax = parseInt(form.salaryMax);
      }
      const res = await axios.post(`${API_URL}/jobs`, body, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Job posted successfully! 🎉');
      navigate(`/app/jobs/${res.data.data.id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to post job');
    }
    setSaving(false);
  };

  const isInternship = form.type === 'internship';

  return (
    <div className="post-job-page">
      <button className="onboarding-back-btn" onClick={() => navigate(-1)}>
        <HiOutlineArrowLeft size={18} /> Back
      </button>

      <motion.div className="post-job-content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="post-job-header">
          <HiOutlineBriefcase size={28} />
          <div>
            <h1>Post a <span className="text-gold">Job</span></h1>
            <p>Share an opportunity with DTU students</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="post-job-form">
          {/* Basic Info */}
          <section className="edit-section">
            <h3>Basic Information</h3>
            <div className="edit-fields-row">
              <div className="edit-field full">
                <label>Job Title *</label>
                <input className="onboarding-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Frontend Developer Intern" required />
              </div>
              <div className="edit-field">
                <label>Company *</label>
                <input className="onboarding-input" value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. Google" required />
              </div>
              <div className="edit-field">
                <label>Job Type</label>
                <select className="onboarding-input" value={form.type} onChange={e => set('type', e.target.value)}>
                  {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="edit-field">
                <label>Work Mode</label>
                <select className="onboarding-input" value={form.workMode} onChange={e => set('workMode', e.target.value)}>
                  {WORK_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div className="edit-field">
                <label>Location</label>
                <input className="onboarding-input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Bangalore, India" />
              </div>
            </div>
          </section>

          {/* Compensation */}
          <section className="edit-section">
            <h3>{isInternship ? 'Stipend' : 'Salary'} (₹)</h3>
            <div className="edit-fields-row">
              <div className="edit-field">
                <label>Minimum</label>
                <input className="onboarding-input" type="number" value={isInternship ? form.stipendMin : form.salaryMin} onChange={e => set(isInternship ? 'stipendMin' : 'salaryMin', e.target.value)} placeholder={isInternship ? '10000' : '500000'} />
              </div>
              <div className="edit-field">
                <label>Maximum</label>
                <input className="onboarding-input" type="number" value={isInternship ? form.stipendMax : form.salaryMax} onChange={e => set(isInternship ? 'stipendMax' : 'salaryMax', e.target.value)} placeholder={isInternship ? '25000' : '1200000'} />
              </div>
              <div className="edit-field">
                <label>Min Experience (years)</label>
                <input className="onboarding-input" type="number" min={0} value={form.experienceMin} onChange={e => set('experienceMin', e.target.value)} />
              </div>
              <div className="edit-field">
                <label>Max Experience</label>
                <input className="onboarding-input" type="number" min={0} value={form.experienceMax} onChange={e => set('experienceMax', e.target.value)} />
              </div>
              <div className="edit-field">
                <label>Application Deadline</label>
                <input className="onboarding-input" type="date" value={form.applicationDeadline} onChange={e => set('applicationDeadline', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="edit-section">
            <h3>Description *</h3>
            <textarea className="onboarding-input" rows={6} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the role, responsibilities, and what the candidate will be working on..." required />
          </section>

          {/* Requirements */}
          <section className="edit-section">
            <h3>Requirements</h3>
            <div className="edit-tag-input-row">
              <input className="onboarding-input" value={reqInput} onChange={e => setReqInput(e.target.value)} placeholder="Add a requirement..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addReq())} />
              <button type="button" className="profile-edit-btn" onClick={addReq}><HiOutlinePlusCircle size={16} /> Add</button>
            </div>
            <ul className="job-requirements-list">
              {form.requirements.map((r, i) => (
                <li key={i}>{r} <button type="button" onClick={() => set('requirements', form.requirements.filter((_, j) => j !== i))}><HiOutlineXMark size={14} /></button></li>
              ))}
            </ul>
          </section>

          {/* Skills */}
          <section className="edit-section">
            <h3>Required Skills</h3>
            <div className="edit-tag-input-row">
              <input className="onboarding-input" value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
              <button type="button" className="profile-edit-btn" onClick={addSkill}><HiOutlinePlusCircle size={16} /> Add</button>
            </div>
            <div className="edit-tags">
              {form.skills.map((s, i) => (
                <span key={i} className="dash-tag">{s} <button type="button" onClick={() => set('skills', form.skills.filter(x => x !== s))}><HiOutlineXMark size={12} /></button></span>
              ))}
            </div>
          </section>

          <div className="edit-save-bar">
            <button type="button" className="onboarding-back-btn" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="auth-submit-btn" disabled={saving} style={{ width: 'auto', padding: '14px 36px' }}>
              {saving ? <span className="auth-spinner" /> : <><HiOutlineRocketLaunch size={18} /> Post Job</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
