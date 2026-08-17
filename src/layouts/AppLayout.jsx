import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectSidebarCollapsed, toggleSidebarCollapse } from '../store/slices/uiSlice';
import { selectIsAuthenticated, selectCurrentUser, selectToken, selectProfile } from '../store/slices/authSlice';
import { useGetMeQuery } from '../store/api/authApi';
import { BYPASS_AUTH_FOR_TESTING } from '../utils/constants';
import { setAuthToken } from '../utils/apiClient';
import { useMobileNav } from '../hooks/useMediaQuery';
import Sidebar from '../ui/Sidebar';
import Topbar from '../ui/Topbar';

export default function AppLayout() {
  const sidebarCollapsed = useSelector(selectSidebarCollapsed);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);
  const profile = useSelector(selectProfile);
  const dispatch = useDispatch();
  const location = useLocation();
  const isMobileNav = useMobileNav();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch fresh user + profile data on mount (populates authSlice.profile)
  useGetMeQuery(undefined, { skip: BYPASS_AUTH_FOR_TESTING || !isAuthenticated });

  // Keep the centralized API client in sync with the current auth token
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileNav) setMobileOpen(false);
  }, [isMobileNav]);

  useEffect(() => {
    document.body.style.overflow = isMobileNav && mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileNav, mobileOpen]);

  useEffect(() => {
    if (!isMobileNav || !mobileOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileNav, mobileOpen]);

  if (!BYPASS_AUTH_FOR_TESTING && !isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Block unverified users — force them to the pending-verification page
  if (
    !BYPASS_AUTH_FOR_TESTING
    && user
    && !user.isEmailVerified
  ) {
    return <Navigate to="/app/pending-verification" replace />;
  }

  if (
    !BYPASS_AUTH_FOR_TESTING
    && user
    && !user.isProfileComplete
    && !location.pathname.includes('/onboarding')
  ) {
    return <Navigate to="/app/onboarding" replace />;
  }

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobileNav ? 'app-layout--mobile-nav' : ''}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => dispatch(toggleSidebarCollapse())}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        isMobileNav={isMobileNav}
      />
      <div className="app-main">
        {/* Persistent graduation warning strip for graduating students */}
        {(() => {
          if (user?.role !== 'student' || !profile?.graduationYear) return null;
          const now = new Date();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth() + 1;
          const isGraduating = profile.graduationYear <= currentYear && currentMonth >= 6;
          if (!isGraduating || location.pathname.includes('/transition')) return null;
          const isUrgent = currentMonth >= 9;
          return (
            <div className={`graduation-warning-strip ${isUrgent ? 'urgent' : ''}`}>
              <span>
                {isUrgent ? '⚠️' : '🎓'}{' '}
                {isUrgent
                  ? 'Your student account will be deleted on September 30! '
                  : `Class of ${profile.graduationYear} — Convert to alumni before Sept 30 to keep your account. `}
              </span>
              <Link to="/app/transition">Convert Now →</Link>
            </div>
          );
        })()}
        <Topbar
          isMobileNav={isMobileNav}
          mobileOpen={mobileOpen}
          onMenuToggle={() => setMobileOpen((prev) => !prev)}
        />
        <main className="app-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="app-page"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
