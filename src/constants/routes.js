export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
    SIGNUP: "/signup",
    FORGOT_PASSWORD: "/forgot-password",
  },
  DASHBOARD: "/dashboard", // Assuming this is the main dashboard path
  // ... other main routes
  TASKS: {
    MANAGEMENT: "/tasks/management",
    DIRECTORY: "/tasks/directory",
    TEMPLATES: "/tasks/templates",
  },
  ATTENDANCE: {
    MY: "/attendance/my",
    ALL: "/attendance/all",
    SETTINGS: "/attendance/settings",
  },
  LEAVES: {
    MY: "/leaves/my",
    ALL: "/leaves/all",
    APPROVALS: "/leaves/approvals",
  },
  EVENTS: {
    MAIN: "/events",
    HOLIDAYS: "/events/holidays",
  },
  TEAM: {
    MY_TEAM: "/team/my-team",
  },
  MOBILE_APP: "/mobile-app",
  CHECKLIST: "/checklist",
  LINKS: "/links",
  REFER_EARN: "/refer-earn",
  SUPPORT: "/support",
  PROFILE: "/profile",
  SETTINGS: "/settings", // General settings page
  PROFILE_CHANGE_PASSWORD: "/profile/change-password", // New route
  // Add other routes as needed
};
