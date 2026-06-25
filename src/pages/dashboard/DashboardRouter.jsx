import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import StudentDashboard from './StudentDashboard';
import AlumniDashboard from './AlumniDashboard';
import AdminDashboard from './AdminDashboard';

export default function DashboardRouter() {
  const user = useSelector(selectCurrentUser);

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'alumni':
      return <AlumniDashboard />;
    default:
      return <StudentDashboard />;
  }
}
