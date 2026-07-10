import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { selectSidebarCollapsed, toggleSidebarCollapse } from '../store/slices/uiSlice';
import { selectIsAuthenticated, selectCurrentUser, selectToken } from '../store/slices/authSlice';
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
  const dispatch = useDispatch();
  const location = useLocation();
  const isMobileNav = useMobileNav();
  const [mobileOpen, setMobileOpen] = useState(false);

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
