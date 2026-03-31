import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If user's role is not authorized, redirect to their respective dashboard
    const roleRoutes = {
      'Super Admin': '/admin',
      'Doctor': '/doctor',
      'Patient': '/patient',
      'Receptionist': '/staff',
      'Nurse': '/staff'
    };
    const redirectPath = roleRoutes[user?.role] || '/login';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
