import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/slices/authSlice';
import { API_URL, EVENT_TYPES } from '../../utils/constants';
import {
  HiOutlineArrowLeft, HiOutlinePlusCircle, HiOutlineXMark,
  HiOutlineCalendarDays, HiOutlineRocketLaunch,
} from 'react-icons/hi2';

export default function CreateEventPage() {
  const token = useSelector(selectToken);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState({
    title: '', description: '', type: 'webinar',
    date: '', endDate: '', location: 'Online',
    meetingLink: '', maxAttendees: 100, tags: [],
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const addTag = () => {
    const v = tagInput.trim().toLowerCase();
    if (v && !form.tags.includes(v)) set('tags', [...form.tags, v]);
    setTagInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.date) {
      return toast.error('Title, description, and date are required');
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        maxAttendees: parseInt(form.maxAttendees) || 100,
        endDate: form.endDate || undefined,
        meetingLink: form.meetingLink || undefined,
      };
      const res = await axios.post(`${API_URL}/events`, body, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Event created! 🎉');
      navigate(`/app/events/${res.data.data.id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create event');
    }
    setSaving(false);
  };

  return (
    <div className="create-event-page">
      <button className="onboarding-back-btn" onClick={() => navigate(-1)}>
        <HiOutlineArrowLeft size={18} /> Back
      </button>

      <motion.div className="post-job-content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="post-job-header">
          <HiOutlineCalendarDays size={28} />
          <div>
            <h1>Create an <span className="text-gold">Event</span></h1>
            <p>Organize a talk, workshop, or networking session</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="post-job-form">
          <section className="edit-section">
            <h3>Event Details</h3>
            <div className="edit-fields-row">
              <div className="edit-field full">
                <label>Event Title *</label>
                <input className="onboarding-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Career Roadmap for CSE Students" required />
              </div>
              <div className="edit-field">
                <label>Event Type</label>
                <select className="onboarding-input" value={form.type} onChange={e => set('type', e.target.value)}>
                  {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                </select>
              </div>
              <div className="edit-field">
                <label>Location</label>
                <input className="onboarding-input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Online or venue address" />
              </div>
              <div className="edit-field">
                <label>Meeting Link</label>
                <input className="onboarding-input" value={form.meetingLink} onChange={e => set('meetingLink', e.target.value)} placeholder="https://meet.google.com/..." />
              </div>
              <div className="edit-field">
                <label>Max Attendees</label>
                <input className="onboarding-input" type="number" min={1} max={10000} value={form.maxAttendees} onChange={e => set('maxAttendees', e.target.value)} />
              </div>
            </div>
          </section>

          <section className="edit-section">
            <h3>Date & Time</h3>
            <div className="edit-fields-row">
              <div className="edit-field">
                <label>Start Date & Time *</label>
                <input className="onboarding-input" type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} required />
              </div>
              <div className="edit-field">
                <label>End Date & Time</label>
                <input className="onboarding-input" type="datetime-local" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
              </div>
            </div>
          </section>

          <section className="edit-section">
            <h3>Description *</h3>
            <textarea className="onboarding-input" rows={6} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe what attendees will learn, who should attend, any prerequisites..." required />
          </section>

          <section className="edit-section">
            <h3>Tags</h3>
            <div className="edit-tag-input-row">
              <input className="onboarding-input" value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add a tag..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
              <button type="button" className="profile-edit-btn" onClick={addTag}><HiOutlinePlusCircle size={16} /> Add</button>
            </div>
            <div className="edit-tags">
              {form.tags.map((t, i) => (
                <span key={i} className="dash-tag">{t} <button type="button" onClick={() => set('tags', form.tags.filter(x => x !== t))}><HiOutlineXMark size={12} /></button></span>
              ))}
            </div>
          </section>

          <div className="edit-save-bar">
            <button type="button" className="onboarding-back-btn" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="auth-submit-btn" disabled={saving} style={{ width: 'auto', padding: '14px 36px' }}>
              {saving ? <span className="auth-spinner" /> : <><HiOutlineRocketLaunch size={18} /> Create Event</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
