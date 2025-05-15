/**
 * Application routes - centralized route definitions
 * All routes should be defined here and referenced elsewhere for consistency
 */
export const ROUTES = {
  // Root and fallback
  ROOT: "/",
  NOT_FOUND: "*",

  // Auth routes
  AUTH: {
    LOGIN: "/login",
    SIGNUP: "/signup",
    FORGOT_PASSWORD: "/forgot-password",
  },

  // Main routes
  DASHBOARD: "/dashboard",

  // Task routes
  TASKS: {
    MANAGEMENT: "/tasks",
    DIRECTORY: "/tasks/directory",
    TEMPLATES: "/tasks/templates",
  },

  // Attendance routes
  ATTENDANCE: {
    MY: "/attendance",
    ALL: "/attendance/all",
    SETTINGS: "/attendance/settings",
  },

  // Leave routes
  LEAVES: {
    MY: "/leaves",
    ALL: "/leaves/all",
    APPROVALS: "/leaves/approvals",
  },

  // Event routes
  EVENTS: {
    MAIN: "/events",
    HOLIDAYS: "/events/holidays",
  },

  // Team routes
  TEAM: {
    MY_TEAM: "/team",
  },

  // Other routes
  MOBILE_APP: "/mobile-app",
  CHECKLIST: "/checklist",
  LINKS: "/links",
  REFER_EARN: "/refer-earn",
  SETTINGS: "/settings",
};
