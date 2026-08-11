import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from './store/slices/authSlice';
import { BYPASS_AUTH_FOR_TESTING } from './utils/constants';
import './App.css';

// Existing landing page components
import LampEffect from './components/LampEffect';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Dashboard
import DashboardRouter from './pages/dashboard/DashboardRouter';

// Onboarding
import StudentOnboarding from './pages/onboarding/StudentOnboarding';
import AlumniOnboarding from './pages/onboarding/AlumniOnboarding';
import AlumniTransitionPage from './pages/onboarding/AlumniTransitionPage';

// Core pages
import ProfilePage from './pages/profile/ProfilePage';
import EditProfilePage from './pages/profile/EditProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import DirectoryPage from './pages/directory/DirectoryPage';
import MentorshipPage from './pages/mentorship/MentorshipPage';
import MessagesPage from './pages/messages/MessagesPage';
import JobsPage from './pages/jobs/JobsPage';
import JobDetailPage from './pages/jobs/JobDetailPage';
import PostJobPage from './pages/jobs/PostJobPage';
import MyApplicationsPage from './pages/jobs/MyApplicationsPage';
import CommunityPage from './pages/community/CommunityPage';
import PostDetailPage from './pages/community/PostDetailPage';
import EventsPage from './pages/events/EventsPage';
import EventDetailPage from './pages/events/EventDetailPage';
import CreateEventPage from './pages/events/CreateEventPage';
import AchievementsPage from './pages/achievements/AchievementsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ContactUsPage from './pages/settings/ContactUsPage';
import PrivacyPolicyPage from './pages/auth/PrivacyPolicyPage';

// Admin pages
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminVerificationsPage from './pages/admin/AdminVerificationsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminModerationPage from './pages/admin/AdminModerationPage';

// Landing Page Component
function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!BYPASS_AUTH_FOR_TESTING && isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleOpenModal = (tab) => {
    if (BYPASS_AUTH_FOR_TESTING) {
      navigate('/app/dashboard');
      return;
    }
    window.location.href = tab === 'login' ? '/auth/login' : '/auth/signup';
  };
  
  return (
    <>
      <LampEffect>
        <Navbar
          isLoggedIn={false}
          userName=""
          onOpenModal={handleOpenModal}
          onLogout={() => {}}
        />
        <Hero onOpenModal={handleOpenModal} />
      </LampEffect>

      <div style={{ position: 'relative', zIndex: 1, background: '#000' }}>
        <Features />
        <HowItWorks />
        <Testimonials />
        <Footer />
      </div>
    </>
  );
}

// Onboarding router — routes by role
function OnboardingRouter() {
  const user = useSelector(selectCurrentUser);
  if (user?.role === 'alumni') return <AlumniOnboarding />;
  return <StudentOnboarding />;
}



function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Pages */}
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

      {/* Auth Pages */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="verify-email/:token" element={<VerifyEmailPage />} />
      </Route>

      {/* Authenticated App */}
      <Route path="/app" element={<AppLayout />}>
        <Route path="dashboard" element={<DashboardRouter />} />
        <Route path="onboarding" element={<OnboardingRouter />} />
        <Route path="transition" element={<AlumniTransitionPage />} />

        {/* Profile */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/edit" element={<EditProfilePage />} />
        <Route path="profile/:userId" element={<ProfilePage />} />

        {/* Directory */}
        <Route path="directory" element={<DirectoryPage />} />

        {/* Mentorship */}
        <Route path="mentorship" element={<MentorshipPage />} />
        <Route path="mentorship/:mentorId" element={<MentorshipPage />} />

        {/* Messages */}
        <Route path="messages" element={<MessagesPage />} />
        <Route path="messages/:conversationId" element={<MessagesPage />} />

        {/* Jobs */}
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/:jobId" element={<JobDetailPage />} />
        <Route path="jobs/post" element={<PostJobPage />} />
        <Route path="jobs/my-applications" element={<MyApplicationsPage />} />

        {/* Community */}
        <Route path="community" element={<CommunityPage />} />
        <Route path="community/:postId" element={<PostDetailPage />} />
        <Route path="community/create" element={<CommunityPage />} />

        {/* Events */}
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:eventId" element={<EventDetailPage />} />
        <Route path="events/create" element={<CreateEventPage />} />

        {/* Others */}
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="contact" element={<ContactUsPage />} />

        {/* Admin */}
        <Route path="admin/users" element={<AdminUsersPage />} />
        <Route path="admin/verifications" element={<AdminVerificationsPage />} />
        <Route path="admin/reports" element={<AdminAnalyticsPage />} />
        <Route path="admin/moderation" element={<AdminModerationPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
