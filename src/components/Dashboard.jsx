export default function Dashboard({ userName }) {
  return (
    <div id="dashboard" style={{ display: 'block' }}>
      <div className="dash-greeting">
        Hello, <span>{userName}</span> 👋
      </div>
      <p className="dash-sub">
        Your DTU network is growing — here's your command center (more features coming soon).
      </p>
      <div className="quick-actions">
        <button className="qa-btn"><span>👤</span> My Profile</button>
        <button className="qa-btn"><span>💼</span> Browse Jobs</button>
        <button className="qa-btn"><span>📅</span> Events</button>
        <button className="qa-btn"><span>🎯</span> Find Mentor</button>
      </div>
      <div className="dash-grid">
        <div className="dash-card">
          <div className="dash-card-title">✨ Welcome to AlumioDTU Pro</div>
          <p style={{ lineHeight: 1.6, color: 'rgba(232,234,246,0.7)' }}>
            Your personalized alumni dashboard is under construction — but you're connected! Soon you'll see smart recommendations, mentorship matches, and live alumni events.
          </p>
          <div style={{ marginTop: 20, padding: 12, background: 'rgba(245,200,66,0.08)', borderRadius: 12 }}>
            <span style={{ color: 'var(--gold)' }}>📢 Coming soon:</span> AI-powered job matches, 1:1 video mentoring, and exclusive DTU networking rooms.
          </div>
        </div>
        <div className="dash-card">
          <div className="dash-card-title">🌟 Quick Stats</div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ color: 'var(--gold)' }}>245</span> new alumni joined this week
          </div>
          <div>
            <span style={{ color: 'var(--gold)' }}>18</span> exclusive jobs posted by alumni
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="qa-btn" style={{ width: '100%', textAlign: 'center' }}>
              Explore Empty State →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
