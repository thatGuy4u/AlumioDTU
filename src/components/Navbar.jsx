export default function Navbar({ isLoggedIn, userName, onOpenModal, onLogout }) {
  return (
    <nav id="navbar">
      <div className="nav-logo">Alumio<span>DTU</span></div>
      <div className="nav-links">
        {!isLoggedIn && (
          <div className="nav-menu">
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a href="#testimonials">Stories</a>
          </div>
        )}
        <div className="nav-actions">
          {isLoggedIn ? (
            <>
              <span className="user-greeting">👋 {userName}</span>
              <button className="btn-logout" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn-nav" onClick={() => onOpenModal('login')}>Log In</button>
              <button
                className="btn-nav"
                style={{ background: 'transparent', color: 'var(--gold)', border: '1.5px solid var(--gold)' }}
                onClick={() => onOpenModal('signup')}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
