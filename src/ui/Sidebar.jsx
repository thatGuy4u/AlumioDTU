import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectCurrentUser } from '../store/slices/authSlice';
import { useGetUnreadCountQuery } from '../store/api/chatApi';
import LeftDrawer from './LeftDrawer';
import {
  HiOutlineHome, HiOutlineUser, HiOutlineUsers,
  HiOutlineAcademicCap, HiOutlineChatBubbleLeftRight,
  HiOutlineBriefcase, HiOutlineChatBubbleOvalLeft,
  HiOutlineCalendarDays, HiOutlineTrophy,
  HiOutlineBell, HiOutlineCog6Tooth,
  HiOutlineShieldCheck, HiOutlineChartBarSquare,
  HiOutlineChevronLeft, HiOutlineChevronRight,
  HiOutlineEnvelope, HiOutlineMegaphone,
} from 'react-icons/hi2';

const studentLinks = [
  { to: '/app/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
  { to: '/app/profile', icon: HiOutlineUser, label: 'Profile' },
  { to: '/app/directory', icon: HiOutlineUsers, label: 'Users Directory' },
  { to: '/app/mentorship', icon: HiOutlineAcademicCap, label: 'Mentorship' },
  { to: '/app/messages', icon: HiOutlineChatBubbleLeftRight, label: 'Messages' },
  { to: '/app/jobs', icon: HiOutlineBriefcase, label: 'Jobs & Internships' },
  { to: '/app/community', icon: HiOutlineChatBubbleOvalLeft, label: 'Community' },
  { to: '/app/events', icon: HiOutlineCalendarDays, label: 'Events' },
  { to: '/app/achievements', icon: HiOutlineTrophy, label: 'Achievements' },
  { to: '/app/notifications', icon: HiOutlineBell, label: 'Notifications' },
  { to: '/app/settings', icon: HiOutlineCog6Tooth, label: 'Settings' },
  { to: '/app/contact', icon: HiOutlineEnvelope, label: 'Contact Us' },
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
  { to: '/app/settings', icon: HiOutlineCog6Tooth, label: 'Settings' },
  { to: '/app/contact', icon: HiOutlineEnvelope, label: 'Contact Us' },
];

const adminLinks = [
  { to: '/app/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
  { to: '/app/admin/users', icon: HiOutlineUsers, label: 'Users' },
  { to: '/app/admin/verifications', icon: HiOutlineShieldCheck, label: 'Verifications' },
  { to: '/app/admin/reports', icon: HiOutlineChartBarSquare, label: 'Analytics' },
  { to: '/app/admin/moderation', icon: HiOutlineCog6Tooth, label: 'Moderation' },
  { to: '/app/admin/broadcast', icon: HiOutlineMegaphone, label: 'Broadcast' },
  { to: '/app/messages', icon: HiOutlineChatBubbleLeftRight, label: 'Messages' },
  { to: '/app/community', icon: HiOutlineChatBubbleOvalLeft, label: 'Community' },
  { to: '/app/events', icon: HiOutlineCalendarDays, label: 'Events' },
  { to: '/app/notifications', icon: HiOutlineBell, label: 'Notifications' },
  { to: '/app/settings', icon: HiOutlineCog6Tooth, label: 'Settings' },
  { to: '/app/contact', icon: HiOutlineEnvelope, label: 'Contact Us' },
];

function SidebarLinks({ links, collapsed, isMobile, location, onNavigate }) {
  const { data: unreadData } = useGetUnreadCountQuery();
  const unreadCount = unreadData?.data?.count || 0;

  return (
    <div className="sidebar-nav" role="navigation" aria-label="App navigation">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.to
          || (link.to !== '/app/dashboard' && location.pathname.startsWith(link.to));
        const isMessages = link.to === '/app/messages';

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
              {isMessages && unreadCount > 0 && collapsed && !isMobile && (
                <span className="sidebar-badge sidebar-badge--dot" />
              )}
            </span>
            {(!collapsed || isMobile) && (
              <span className="sidebar-link-label">{link.label}</span>
            )}
            {isMessages && unreadCount > 0 && (!collapsed || isMobile) && (
              <span className="sidebar-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
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

          {/* User card at bottom — matches reference design */}
          {!collapsed && user && (
            <div className="sidebar-user-card">
              <div className="sidebar-user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{user.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user.name}</span>
                <span className="sidebar-user-role">{user.role}</span>
              </div>
            </div>
          )}

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
