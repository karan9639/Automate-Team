"use client";

import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { ROUTES } from "../../constants/routes";
import AutomateLogo from "../common/AutomateLogo";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  CheckSquare,
  Calendar,
  Users,
  Clock,
  Settings,
  LinkIcon,
  Smartphone,
  Gift,
  ChevronRight,
  ChevronDown,
  LogOut,
} from "lucide-react";

// Using JavaScript default parameters instead of defaultProps
const Sidebar = ({
  isOpen = true,
  isMobile = false,
  toggleSidebar = () => {},
}) => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState({
    tasks: true,
    attendance: true,
    leaves: true,
    events: true,
  });

  // Update expanded groups based on current route
  useEffect(() => {
    const path = location.pathname;

    // Auto-expand relevant section based on current path
    if (path.includes("/tasks")) {
      setExpandedGroups((prev) => ({ ...prev, tasks: true }));
    } else if (path.includes("/attendance")) {
      setExpandedGroups((prev) => ({ ...prev, attendance: true }));
    } else if (path.includes("/leaves")) {
      setExpandedGroups((prev) => ({ ...prev, leaves: true }));
    } else if (path.includes("/events")) {
      setExpandedGroups((prev) => ({ ...prev, events: true }));
    }
  }, [location.pathname]);

  // Toggle a group's expanded state
  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  // Helper function to determine if a route is active
  const isRouteActive = (path) => {
    if (location.pathname === path) return true;
    if (path !== ROUTES.DASHBOARD && location.pathname.startsWith(path + "/"))
      return true;
    return false;
  };

  // Navigation structure with grouping
  const navigationGroups = [
    {
      id: "main",
      items: [
        {
          title: "Dashboard",
          icon: <Home size={18} />,
          path: ROUTES.DASHBOARD,
        },
      ],
    },
    {
      id: "tasks",
      title: "Tasks",
      icon: <CheckSquare size={18} />,
      items: [
        {
          title: "Task Management",
          path: ROUTES.TASKS.MANAGEMENT,
        },
        {
          title: "Task Directory",
          path: ROUTES.TASKS.DIRECTORY,
        },
        {
          title: "Task Templates",
          path: ROUTES.TASKS.TEMPLATES,
        },
      ],
    },
    {
      id: "attendance",
      title: "Attendance",
      icon: <Clock size={18} />,
      items: [
        {
          title: "My Attendance",
          path: ROUTES.ATTENDANCE.MY,
        },
        {
          title: "All Attendance",
          path: ROUTES.ATTENDANCE.ALL,
        },
        {
          title: "Attendance Settings",
          path: ROUTES.ATTENDANCE.SETTINGS,
        },
      ],
    },
    {
      id: "leaves",
      title: "Leaves",
      icon: <Calendar size={18} />,
      items: [
        {
          title: "My Leaves",
          path: ROUTES.LEAVES.MY,
        },
        {
          title: "All Leaves",
          path: ROUTES.LEAVES.ALL,
        },
        {
          title: "Approvals",
          path: ROUTES.LEAVES.APPROVALS,
        },
      ],
    },
    {
      id: "events",
      title: "Events",
      icon: <Calendar size={18} />,
      items: [
        {
          title: "Events",
          path: ROUTES.EVENTS.MAIN,
        },
        {
          title: "Holidays",
          path: ROUTES.EVENTS.HOLIDAYS,
        },
      ],
    },
    {
      id: "team",
      items: [
        {
          title: "My Team",
          icon: <Users size={18} />,
          path: ROUTES.TEAM.MY_TEAM,
        },
      ],
    },
    {
      id: "other",
      items: [
        {
          title: "Mobile App",
          icon: <Smartphone size={18} />,
          path: ROUTES.MOBILE_APP,
        },
        {
          title: "Checklist",
          icon: <CheckSquare size={18} />,
          path: ROUTES.CHECKLIST,
        },
        {
          title: "Links",
          icon: <LinkIcon size={18} />,
          path: ROUTES.LINKS,
        },
        {
          title: "Refer & Earn",
          icon: <Gift size={18} />,
          path: ROUTES.REFER_EARN,
        },
        {
          title: "Settings",
          icon: <Settings size={18} />,
          path: ROUTES.SETTINGS,
        },
      ],
    },
  ];

  // Handle navigation click
  const handleNavClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  // Sidebar animation variants
  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  // Backdrop for mobile
  const backdropVariants = {
    open: { opacity: 1, pointerEvents: "auto" },
    closed: { opacity: 0, pointerEvents: "none" },
  };

  return (
    <>
      {/* Mobile backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        initial="closed"
        animate={isOpen && isMobile ? "open" : "closed"}
        variants={backdropVariants}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <motion.div
        className="fixed top-0 left-0 z-40 h-screen bg-white shadow-lg w-64 overflow-hidden"
        initial="closed"
        animate={isOpen || !isMobile ? "open" : "closed"}
        variants={sidebarVariants}
      >
        {/* Logo header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <AutomateLogo />
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Close sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation menu */}
        <div className="overflow-y-auto h-[calc(100vh-64px)] py-2 px-3">
          {navigationGroups.map((group) => (
            <div key={group.id} className="mb-2">
              {/* Group header (if it has a title) */}
              {group.title && (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-500">{group.icon}</span>
                    <span>{group.title}</span>
                  </div>
                  <span className="text-gray-400">
                    {expandedGroups[group.id] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </span>
                </button>
              )}

              {/* Group items */}
              <AnimatePresence>
                {(!group.title || expandedGroups[group.id]) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {group.items.map((item, index) => {
                      const isActive = isRouteActive(item.path);

                      return (
                        <NavLink
                          key={index}
                          to={item.path}
                          className={`
                            flex items-center px-3 py-2 my-1 text-sm rounded-md transition-all
                            ${group.title ? "pl-9" : "pl-3"}
                            ${
                              isActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            }
                          `}
                          onClick={handleNavClick}
                          end={item.path === ROUTES.DASHBOARD}
                        >
                          {item.icon && (
                            <span className="mr-2">{item.icon}</span>
                          )}
                          <span>{item.title}</span>
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Logout button at bottom */}
          <div className="mt-auto pt-4 border-t border-gray-100 mx-2">
            <button
              className="flex items-center w-full px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors"
              onClick={() => console.log("Logout clicked")}
            >
              <LogOut size={18} className="mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  isMobile: PropTypes.bool,
  toggleSidebar: PropTypes.func,
};

export default Sidebar;
