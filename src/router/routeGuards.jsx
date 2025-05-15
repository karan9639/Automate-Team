"use client";

import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants/routes";

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="text-center">
      <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p>Loading...</p>
    </div>
  </div>
);

// Protected route component - enhanced with better redirection
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // If not authenticated, redirect to login with return path
  if (!isAuthenticated) {
    console.log("Access to protected route denied - redirecting to login");
    return (
      <Navigate
        to={ROUTES.AUTH.LOGIN}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // If authenticated, render the protected content
  return children;
};

// Auth route component (redirects to dashboard if authenticated)
export const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // If already authenticated, redirect to the intended destination or dashboard
  if (isAuthenticated) {
    const destination = location.state?.from || ROUTES.DASHBOARD;
    console.log(`User already authenticated, redirecting to: ${destination}`);
    return <Navigate to={destination} replace />;
  }

  // If not authenticated, render the auth content (login/signup)
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

AuthRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
