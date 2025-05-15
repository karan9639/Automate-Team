"use client";

import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { ROUTES } from "../constants/routes";
import AutomateLogo from "../components/AutomateLogo";
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
  Menu,
  X,
} from "lucide-react";

const Sidebar = ({
  isOpen = true,
  isMobile = false,
  isTablet = false,
  toggleSidebar = () => {},
}) => {
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [expandedGroups, setExpandedGroups] = useState({
    tasks: false,
    attendance: false,
    leaves: false,
    events: false,
    tools: false,
  });

  // Determine if sidebar is in compact mode - now only for mobile when closed
  // No longer using compact mode for tablet screens
  const isCompact = isMobile && !isOpen;

  // Update expanded groups based on current route
  useEffect(() => {
    const path = location.pathname;

    // Reset all to collapsed state
    const newExpandedState = {
      tasks: false,
      attendance: false,
      leaves: false,
      events: false,
      tools: false,
    };

    // Auto-expand relevant section based on current path
    if (path.includes("/tasks")) {
      newExpandedState.tasks = true;
    } else if (path.includes("/attendance")) {
      newExpandedState.attendance = true;
    } else if (path.includes("/leaves")) {
      newExpandedState.leaves = true;
    } else if (path.includes("/events")) {
      newExpandedState.events = true;
    } else if (
      path.includes("/checklist") ||
      path.includes("/links") ||
      path.includes("/mobile-app") ||
      path.includes("/refer-earn")
    ) {
      newExpandedState.tools = true;
    }

    setExpandedGroups(newExpandedState);
  }, [location.pathname]);

  // Handle click outside to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile &&
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        toggleSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isOpen, toggleSidebar]);

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
    if (path !== ROUTES.DASHBOARD && location.pathname.startsWith(path))
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
      id: "tools",
      title: "Tools",
      icon: <Settings size={18} />,
      items: [
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
          title: "Mobile App",
          icon: <Smartphone size={18} />,
          path: ROUTES.MOBILE_APP,
        },
        {
          title: "Refer & Earn",
          icon: <Gift size={18} />,
          path: ROUTES.REFER_EARN,
        },
      ],
    },
    {
      id: "settings",
      items: [
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

  // Sidebar animation variants - now using full width for tablet
  const sidebarVariants = {
    open: {
      x: 0,
      width: isMobile ? "85%" : "16rem", // Always use full width for tablet and desktop
      transition: { type: "spring", stiffness: 400, damping: 30 },
    },
    closed: {
      x: "-100%",
      width: isMobile ? "85%" : "16rem", // Always use full width for tablet and desktop
      transition: { type: "spring", stiffness: 400, damping: 30 },
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
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-30"
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-40 h-screen bg-gray-900 shadow-lg overflow-hidden
                   ${isMobile ? "max-w-[85%]" : "w-64"}`} // Always use full width for tablet
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
      >
        {/* Logo header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!isCompact && <AutomateLogo />}
          {isCompact && (
            <div className="mx-auto">
              <Menu size={24} className="text-white" />
            </div>
          )}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md text-gray-400 hover:bg-gray-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Navigation menu */}
        <div className="overflow-y-auto h-[calc(100vh-64px)] py-2 px-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {navigationGroups.map((group) => (
            <div key={group.id} className="mb-2">
              {/* Group header (if it has a title) */}
              {group.title && !isCompact && (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
                  aria-expanded={expandedGroups[group.id]}
                >
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-400">{group.icon}</span>
                    <span>{group.title}</span>
                  </div>
                  <span className="text-gray-500">
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
                {(!group.title || expandedGroups[group.id] || isCompact) && (
                  <motion.div
                    initial={!isCompact ? { height: 0, opacity: 0 } : false}
                    animate={!isCompact ? { height: "auto", opacity: 1 } : {}}
                    exit={!isCompact ? { height: 0, opacity: 0 } : {}}
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
                            flex items-center ${
                              isCompact ? "justify-center" : ""
                            } px-3 py-2 my-1 text-sm rounded-md transition-all
                            ${!isCompact && group.title ? "pl-9" : "pl-3"}
                            ${
                              isActive
                                ? "bg-blue-600/20 text-blue-400 font-medium"
                                : "text-gray-300 hover:bg-gray-800 hover:text-gray-100"
                            }
                          `}
                          onClick={handleNavClick}
                          end={item.path === ROUTES.DASHBOARD}
                          title={isCompact ? item.title : ""}
                        >
                          <span className={isCompact ? "mx-auto" : "mr-2"}>
                            {item.icon || group.icon}
                          </span>
                          {!isCompact && <span>{item.title}</span>}
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  isMobile: PropTypes.bool,
  isTablet: PropTypes.bool,
  toggleSidebar: PropTypes.func,
};

export default Sidebar;
