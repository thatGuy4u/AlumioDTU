import { useState } from 'react';

export default function AuthModal({ isOpen, initialTab, onClose, onLogin }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'login');
  const [selectedRole, setSelectedRole] = useState('student');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupDept, setSignupDept] = useState('');
  const [signupYear, setSignupYear] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Sync tab when modal opens with a specific tab
  useState(() => {
    setActiveTab(initialTab || 'login');
  }, [initialTab]);

  function switchTab(tab) {
    setActiveTab(tab);
    setAuthError('');
  }

  function handleLogin() {
    if (!loginEmail.trim() || !loginPassword) {
      setAuthError('Please fill fields');
      return;
    }
    const name = loginEmail
      .split('@')[0]
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    onLogin(name);
    resetForm();
  }

  function handleSignup() {
    if (!signupName.trim()) {
      alert('Please enter your name.');
      return;
    }
    onLogin(signupName.split(' ')[0]);
    resetForm();
  }

  function resetForm() {
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupDept('');
    setSignupYear('');
    setSignupPassword('');
    setAuthError('');
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">
          {activeTab === 'login' ? 'Welcome Back' : 'Join AlumioDTU'}
        </h2>
        <p className="modal-sub">
          {activeTab === 'login'
            ? 'Sign in to your AlumioDTU account'
            : 'Create your free DTU alumni profile'}
        </p>

        {/* Tabs */}
        <div className="tab-row">
          <button
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Log In
          </button>
          <button
            className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => switchTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Login Panel */}
        <div className={`form-panel ${activeTab === 'login' ? 'active' : ''}`}>
          <div className="input-group">
            <label>EMAIL</label>
            <input
              type="email"
              placeholder="you@dtu.ac.in"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </div>
          <button className="btn-submit" onClick={handleLogin}>Log In →</button>
          {authError && (
            <p style={{ textAlign: 'center', marginTop: 12, fontSize: '0.8rem', color: '#ef5350' }}>
              {authError}
            </p>
          )}
        </div>

        {/* Signup Panel */}
        <div className={`form-panel ${activeTab === 'signup' ? 'active' : ''}`}>
          <div className="role-pills">
            <button
              className={`role-pill ${selectedRole === 'student' ? 'active' : ''}`}
              onClick={() => setSelectedRole('student')}
            >
              🎓 Student
            </button>
            <button
              className={`role-pill ${selectedRole === 'alumni' ? 'active' : ''}`}
              onClick={() => setSelectedRole('alumni')}
            >
              💼 Alumni
            </button>
          </div>
          <div className="input-group">
            <label>FULL NAME</label>
            <input
              type="text"
              placeholder="Your full name"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>EMAIL</label>
            <input
              type="email"
              placeholder="you@dtu.ac.in"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>DEPARTMENT</label>
            <input
              type="text"
              placeholder="e.g. Computer Science"
              value={signupDept}
              onChange={(e) => setSignupDept(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>GRAD YEAR</label>
            <input
              type="text"
              placeholder="e.g. 2025"
              value={signupYear}
              onChange={(e) => setSignupYear(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>PASSWORD</label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
            />
          </div>
          <button className="btn-submit" onClick={handleSignup}>Create Account →</button>
        </div>
      </div>
    </div>
  );
}
