"use client";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants/routes";

// Layouts
import MainLayout from "../layouts/MainLayout";

// Auth Pages
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

// Main Pages
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";

// Task Pages
import TaskManagement from "../pages/tasks/TaskManagement";
import TaskDirectory from "../pages/tasks/TaskDirectory";
import TaskTemplates from "../pages/tasks/TaskTemplates";

// Attendance Pages
import MyAttendance from "../pages/attendance/MyAttendance";
import AllAttendance from "../pages/attendance/AllAttendance";
import AttendanceSettings from "../pages/attendance/AttendanceSettings";

// Leave Pages
import MyLeaves from "../pages/leaves/MyLeaves";
import AllLeaves from "../pages/leaves/AllLeaves";
import Approvals from "../pages/leaves/Approvals";

// Event Pages
import Events from "../pages/events/Events";
import Holidays from "../pages/events/Holidays";

// Team Pages
import MyTeam from "../pages/team/MyTeam";

// Other Pages
import MobileApp from "../pages/MobileApp";
import Checklist from "../pages/Checklist";
import Links from "../pages/Links";
import ReferAndEarn from "../pages/ReferAndEarn";
import Settings from "../pages/settings/Settings";

// Loading Component
const LoadingSpinner = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="text-center">
      <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p>Loading...</p>
    </div>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    // Pass the current location to the login page so we can redirect after login
    return (
      <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />
    );
  }

  return children;
};

// Auth route component (redirects to dashboard if authenticated)
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    console.log("User already authenticated, redirecting to dashboard");
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

// Main routes component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route
        path={ROUTES.AUTH.LOGIN}
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        }
      />
      <Route
        path={ROUTES.AUTH.SIGNUP}
        element={
          <AuthRoute>
            <SignupPage />
          </AuthRoute>
        }
      />
      <Route
        path={ROUTES.AUTH.FORGOT_PASSWORD}
        element={
          <AuthRoute>
            <ForgotPasswordPage />
          </AuthRoute>
        }
      />

      {/* Protected routes with MainLayout */}
      <Route
        path={ROUTES.ROOT}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Dashboard />} />
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />

        {/* Task Routes */}
        <Route path={ROUTES.TASKS.MANAGEMENT} element={<TaskManagement />} />
        <Route path={ROUTES.TASKS.DIRECTORY} element={<TaskDirectory />} />
        <Route path={ROUTES.TASKS.TEMPLATES} element={<TaskTemplates />} />

        {/* Attendance Routes */}
        <Route path={ROUTES.ATTENDANCE.MY} element={<MyAttendance />} />
        <Route path={ROUTES.ATTENDANCE.ALL} element={<AllAttendance />} />
        <Route
          path={ROUTES.ATTENDANCE.SETTINGS}
          element={<AttendanceSettings />}
        />

        {/* Leave Routes */}
        <Route path={ROUTES.LEAVES.MY} element={<MyLeaves />} />
        <Route path={ROUTES.LEAVES.ALL} element={<AllLeaves />} />
        <Route path={ROUTES.LEAVES.APPROVALS} element={<Approvals />} />

        {/* Event Routes */}
        <Route path={ROUTES.EVENTS.MAIN} element={<Events />} />
        <Route path={ROUTES.EVENTS.HOLIDAYS} element={<Holidays />} />

        {/* Team Routes */}
        <Route path={ROUTES.TEAM.MY_TEAM} element={<MyTeam />} />

        {/* Other Routes */}
        <Route path={ROUTES.MOBILE_APP} element={<MobileApp />} />
        <Route path={ROUTES.CHECKLIST} element={<Checklist />} />
        <Route path={ROUTES.LINKS} element={<Links />} />
        <Route path={ROUTES.REFER_EARN} element={<ReferAndEarn />} />
        <Route path={ROUTES.SETTINGS} element={<Settings />} />
      </Route>

      {/* 404 route */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
