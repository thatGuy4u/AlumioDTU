import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectCurrentUser } from '../store/slices/authSlice';
import LeftDrawer from './LeftDrawer';
import {
  HiOutlineHome, HiOutlineUser, HiOutlineUsers,
  HiOutlineAcademicCap, HiOutlineChatBubbleLeftRight,
  HiOutlineBriefcase, HiOutlineChatBubbleOvalLeft,
  HiOutlineCalendarDays, HiOutlineTrophy,
  HiOutlineBell, HiOutlineCog6Tooth,
  HiOutlineShieldCheck, HiOutlineChartBarSquare,
  HiOutlineChevronLeft, HiOutlineChevronRight,
} from 'react-icons/hi2';

const studentLinks = [
  { to: '/app/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
  { to: '/app/profile', icon: HiOutlineUser, label: 'Profile' },
  { to: '/app/directory', icon: HiOutlineUsers, label: 'Alumni Directory' },
  { to: '/app/mentorship', icon: HiOutlineAcademicCap, label: 'Mentorship' },
  { to: '/app/messages', icon: HiOutlineChatBubbleLeftRight, label: 'Messages' },
  { to: '/app/jobs', icon: HiOutlineBriefcase, label: 'Jobs & Internships' },
  { to: '/app/community', icon: HiOutlineChatBubbleOvalLeft, label: 'Community' },
  { to: '/app/events', icon: HiOutlineCalendarDays, label: 'Events' },
  { to: '/app/achievements', icon: HiOutlineTrophy, label: 'Achievements' },
  { to: '/app/notifications', icon: HiOutlineBell, label: 'Notifications' },
];

const alumniLinks = [
  { to: '/app/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
  { to: '/app/profile', icon: HiOutlineUser, label: 'Profile' },
  { to: '/app/mentorship', icon: HiOutlineAcademicCap, label: 'Mentorship' },
  { to: '/app/messages', icon: HiOutlineChatBubbleLeftRight, label: 'Messages' },
  { to: '/app/jobs', icon: HiOutlineBriefcase, label: 'Job Board' },
  { to: '/app/community', icon: HiOutlineChatBubbleOvalLeft, label: 'Community' },
  { to: '/app/events', icon: HiOutlineCalendarDays, label: 'Events' },
  { to: '/app/achievements', icon: HiOutlineTrophy, label: 'Achievements' },
  { to: '/app/notifications', icon: HiOutlineBell, label: 'Notifications' },
];

const adminLinks = [
  { to: '/app/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
  { to: '/app/admin/users', icon: HiOutlineUsers, label: 'Users' },
  { to: '/app/admin/verifications', icon: HiOutlineShieldCheck, label: 'Verifications' },
  { to: '/app/admin/reports', icon: HiOutlineChartBarSquare, label: 'Analytics' },
  { to: '/app/admin/moderation', icon: HiOutlineCog6Tooth, label: 'Moderation' },
  { to: '/app/community', icon: HiOutlineChatBubbleOvalLeft, label: 'Community' },
  { to: '/app/events', icon: HiOutlineCalendarDays, label: 'Events' },
  { to: '/app/notifications', icon: HiOutlineBell, label: 'Notifications' },
];

function SidebarLinks({ links, collapsed, isMobile, location, onNavigate }) {
  return (
    <div className="sidebar-nav" role="navigation" aria-label="App navigation">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.to
          || (link.to !== '/app/dashboard' && location.pathname.startsWith(link.to));

        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={`sidebar-link ${isActive ? 'active' : ''}`}
            title={collapsed && !isMobile ? link.label : undefined}
            onClick={onNavigate}
          >
            <span className="sidebar-link-icon">
              <Icon size={20} />
            </span>
            {(!collapsed || isMobile) && (
              <span className="sidebar-link-label">{link.label}</span>
            )}
          </NavLink>
        );
      })}
    </div>
  );
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose, isMobileNav = false }) {
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  const links = user?.role === 'admin' ? adminLinks
    : user?.role === 'alumni' ? alumniLinks
    : studentLinks;

  const handleNavClick = () => {
    if (mobileOpen && onMobileClose) onMobileClose();
  };

  const logo = (
    <NavLink to="/app/dashboard" className="sidebar-logo" onClick={handleNavClick}>
      <span className="sidebar-logo-icon">A</span>
      <span className="sidebar-logo-text">
        Alumio<span className="sidebar-logo-accent">DTU</span>
      </span>
    </NavLink>
  );

  return (
    <>
      {!isMobileNav && (
        <motion.aside
          className="sidebar sidebar-desktop"
          animate={{ width: collapsed ? 72 : 260 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="sidebar-header">
            <NavLink to="/app/dashboard" className="sidebar-logo" title="Dashboard">
              <span className="sidebar-logo-icon">A</span>
              {!collapsed && (
                <span className="sidebar-logo-text">
                  Alumio<span className="sidebar-logo-accent">DTU</span>
                </span>
              )}
            </NavLink>
          </div>
          <SidebarLinks
            links={links}
            collapsed={collapsed}
            isMobile={false}
            location={location}
            onNavigate={undefined}
          />
          <button type="button" className="sidebar-toggle" onClick={onToggle}>
            {collapsed ? <HiOutlineChevronRight size={16} /> : <HiOutlineChevronLeft size={16} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </motion.aside>
      )}

      <LeftDrawer
        open={isMobileNav && mobileOpen}
        onClose={onMobileClose}
        className="sidebar sidebar-mobile"
        width={300}
        logo={logo}
      >
        <SidebarLinks
          links={links}
          collapsed={false}
          isMobile
          location={location}
          onNavigate={handleNavClick}
        />
      </LeftDrawer>
    </>
  );
}
