import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiOutlinePaperAirplane } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const footerLinks = {
  Product: ['Features', 'Mentorship', 'Job Board', 'Events'],
  Community: ['Forums', 'Alumni Directory', 'Success Stories'],
};

export default function Footer() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const contactRef = useRef(null);
  const nameInputRef = useRef(null);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setSending(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Message sent! We\'ll get back to you soon.');
        setContactForm({ name: '', email: '', subject: '', message: '' });
        setShowContact(false);
      } else {
        toast.error(data.message || 'Failed to send');
      }
    } catch {
      toast.error('Failed to send message');
    }
    setSending(false);
  };

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="nav-logo">Alumio<span>DTU</span></div>
            <p className="footer-tagline">
              Bridging generations of DTU excellence.<br />
              Connect, mentor & grow together.
            </p>
          </div>
          <div className="footer-links-grid">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div className="footer-col" key={category}>
                <h4>{category}</h4>
                {links.map((link) => (
                  <a key={link} href="#">{link}</a>
                ))}
              </div>
            ))}
            <div className="footer-col">
              <h4>Connect</h4>
              <a href="#" onClick={(e) => { e.preventDefault(); window.open('https://en.wikipedia.org/wiki/Delhi_Technological_University', '_blank'); }}>About DTU</a>
              <a href="#contact-form" onClick={(e) => { e.preventDefault(); document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>Contact Us</a>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </div>
          </div>
        </div>

        {/* Contact Form — Always Visible */}
        <div id="contact-form" ref={contactRef} style={{ padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 16 }}>
          <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 460 }}>
            <h4 style={{ color: '#F5C842', fontSize: '1rem', marginBottom: 4 }}>📧 Contact Us</h4>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: -4, marginBottom: 4 }}>Have a question or feedback? We'd love to hear from you.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input
                  ref={nameInputRef}
                  style={{ flex: 1, minWidth: 180, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e8eaf6', fontSize: '0.85rem' }}
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                  required
                />
                <input
                  style={{ flex: 1, minWidth: 180, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e8eaf6', fontSize: '0.85rem' }}
                  type="email"
                  placeholder="your@email.com"
                  value={contactForm.email}
                  onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
              <input
                style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e8eaf6', fontSize: '0.85rem' }}
                placeholder="Subject"
                value={contactForm.subject}
                onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))}
                required
              />
              <textarea
                style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e8eaf6', fontSize: '0.85rem', resize: 'vertical', minHeight: 80 }}
                placeholder="Your message..."
                rows={3}
                value={contactForm.message}
                onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                required
              />
              <button
                type="submit"
                disabled={sending}
                style={{
                  padding: '10px 24px', borderRadius: 50, border: 'none', width: 'fit-content',
                  background: 'linear-gradient(135deg, #F5C842, #c9a227)', color: '#0a0f2e',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                {sending ? 'Sending...' : <><HiOutlinePaperAirplane size={14} /> Send Message</>}
              </button>
            </form>
          </div>

        <div className="footer-divider" />
        <div className="footer-bottom">
          <p>© 2026 AlumioDTU. Built with <HiOutlineHeart style={{ verticalAlign: 'middle', color: '#f43f5e', width: 14, height: 14 }} /> by Aman.</p>
          <div className="footer-socials">
            <a href="#" aria-label="X">𝕏</a>
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="#" aria-label="GitHub">GH</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
