"use client";

import { Routes, Route, Navigate } from "react-router-dom";
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
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

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

      {/* Protected routes with MainLayout */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
      </Route>

      {/* Task Routes */}
      <Route
        path={ROUTES.TASKS.MANAGEMENT}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TaskManagement />} />
      </Route>

      <Route
        path={ROUTES.TASKS.DIRECTORY}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TaskDirectory />} />
      </Route>

      <Route
        path={ROUTES.TASKS.TEMPLATES}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TaskTemplates />} />
      </Route>

      {/* Attendance Routes */}
      <Route
        path={ROUTES.ATTENDANCE.MY}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MyAttendance />} />
      </Route>

      <Route
        path={ROUTES.ATTENDANCE.ALL}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AllAttendance />} />
      </Route>

      <Route
        path={ROUTES.ATTENDANCE.SETTINGS}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AttendanceSettings />} />
      </Route>

      {/* Leave Routes */}
      <Route
        path={ROUTES.LEAVES.MY}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MyLeaves />} />
      </Route>

      <Route
        path={ROUTES.LEAVES.ALL}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AllLeaves />} />
      </Route>

      <Route
        path={ROUTES.LEAVES.APPROVALS}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Approvals />} />
      </Route>

      {/* Event Routes */}
      <Route
        path={ROUTES.EVENTS.MAIN}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Events />} />
      </Route>

      <Route
        path={ROUTES.EVENTS.HOLIDAYS}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Holidays />} />
      </Route>

      {/* Team Routes */}
      <Route
        path={ROUTES.TEAM.MY_TEAM}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MyTeam />} />
      </Route>

      {/* Other Routes */}
      <Route
        path={ROUTES.MOBILE_APP}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MobileApp />} />
      </Route>

      <Route
        path={ROUTES.CHECKLIST}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Checklist />} />
      </Route>

      <Route
        path={ROUTES.LINKS}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Links />} />
      </Route>

      <Route
        path={ROUTES.REFER_EARN}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ReferAndEarn />} />
      </Route>

      <Route
        path={ROUTES.SETTINGS}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Settings />} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
