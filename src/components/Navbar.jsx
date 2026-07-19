import { useState, useEffect } from 'react';
import { HiOutlineBars3, HiOutlineXMark } from 'react-icons/hi2';
import { useMobileNav } from '../hooks/useMediaQuery';
import LeftDrawer from '../ui/LeftDrawer';
import logo from "../assets/logo.png";

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how', label: 'How It Works' },
  { href: '#testimonials', label: 'Stories' },
];

export default function Navbar({ isLoggedIn, userName, onOpenModal, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isCompactNav = useMobileNav();

  // Track scroll for navbar styling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (!isCompactNav) setMenuOpen(false);
  }, [isCompactNav]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleNavClick = (href) => {
    closeMenu();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header id="navbar" className={scrolled ? 'navbar-scrolled' : ''}>
        <div className="nav-left">
          {!isLoggedIn && isCompactNav && (
            <button
              type="button"
              className="nav-hamburger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <HiOutlineXMark size={20} /> : <HiOutlineBars3 size={20} />}
            </button>
          )}
          <div className="nav-logo"><img src={logo} alt="Logo" />Alumio<span>DTU</span></div>
        </div>

        <div className="nav-links">
          {!isLoggedIn && !isCompactNav && (
            <div className="nav-menu">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          <div className="nav-actions">
            {isLoggedIn ? (
              <>
                <span className="user-greeting">👋 {userName}</span>
                <button type="button" className="btn-logout" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <>
                {!isCompactNav && (
                  <>
                    <button type="button" className="btn-nav btn-nav-secondary" onClick={() => onOpenModal('login')}>Log In</button>
                    <button type="button" className="btn-nav btn-nav-primary" onClick={() => onOpenModal('signup')}>
                      Sign Up
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {!isLoggedIn && (
        <LeftDrawer
          open={menuOpen}
          onClose={closeMenu}
          className="landing-drawer"
          width={300}
          logo={<div className="nav-drawer-logo">Alumio<span>DTU</span></div>}
        >
          <div className="landing-drawer-links" role="navigation" aria-label="Landing navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="landing-drawer-actions">
            <button type="button" className="btn-nav btn-nav-secondary" onClick={() => { closeMenu(); onOpenModal('login'); }}>
              Log In
            </button>
            <button type="button" className="btn-nav btn-nav-primary" onClick={() => { closeMenu(); onOpenModal('signup'); }}>
              Sign Up
            </button>
          </div>
        </LeftDrawer>
      )}
    </>
  );
}
