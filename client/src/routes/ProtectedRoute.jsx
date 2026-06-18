import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Wrapper component to protect private routes.
 * If the user is not authenticated, redirects to the login page.
 * Optionally checks for specific roles.
 */
const ProtectedRoute = ({ requiredRoles }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    // Redirect to login if they aren't logged in
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    // Redirect to a forbidden/unauthorized page if they lack permissions
    return <Navigate to="/unauthorized" replace />;
  }

  // Render the nested child routes
  return <Outlet />;
};

export default ProtectedRoute;
