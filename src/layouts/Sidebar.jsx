"use client";

import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { ROUTES } from "../constants/routes";
import AutomateLogo from "@/components/common/AutomateLogo";
import { motion, AnimatePresence } from "framer-motion";
import { Home, CheckSquare, Users, ChevronDown, Menu, X } from "lucide-react";

const Sidebar = ({
  isOpen = true,
  isMobile = false,
  toggleSidebar = () => {},
}) => {
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const isCompact = isMobile && !isOpen;

  useEffect(() => {
    const path = location.pathname;
    const newExpandedState = {};
    navigationGroups.forEach((group) => {
      if (
        group.items.some(
          (item) => path.startsWith(item.path) && item.path !== ROUTES.DASHBOARD
        )
      ) {
        newExpandedState[group.id] = true;
      } else if (
        group.items.some(
          (item) => path === item.path && item.path === ROUTES.DASHBOARD
        )
      ) {
        // Keep dashboard group open if it's the active page, but don't force others closed
      } else {
        newExpandedState[group.id] = expandedGroups[group.id] || false; // Preserve existing state if not active
      }
    });
    setExpandedGroups(newExpandedState);
  }, [location.pathname]);

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

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const isRouteActive = (path) => {
    if (path === ROUTES.DASHBOARD) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const navigationGroups = [
    {
      id: "main",
      items: [
        {
          title: "Dashboard",
          icon: <Home size={20} />,
          path: ROUTES.DASHBOARD,
        },
      ],
    },
    {
      id: "tasks",
      items: [
        {
          title: "Tasks",
          icon: <CheckSquare size={20} />,
          path: ROUTES.TASKS.MANAGEMENT,
        },
      ],
    },
    {
      id: "team",
      items: [
        {
          title: "My Team",
          icon: <Users size={20} />,
          path: ROUTES.TEAM.MY_TEAM,
        },
      ],
    },
    
    // Add other groups here if they were uncommented
  ];

  const handleNavClick = () => {
    if (isMobile) toggleSidebar();
  };

  const sidebarVariants = {
    open: {
      x: 0,
      width: isMobile ? "80%" : "256px",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    closed: {
      x: "-100%",
      width: isMobile ? "80%" : "256px",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const backdropVariants = {
    open: { opacity: 1, pointerEvents: "auto" },
    closed: { opacity: 0, pointerEvents: "none" },
  };

  return (
    <>
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-40 h-full bg-card text-card-foreground shadow-xl flex flex-col
                   ${isMobile ? "max-w-[80%]" : "w-64"}`}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          {!isCompact && <AutomateLogo className="h-8 text-primary" />}
          {isCompact && <Menu size={24} className="text-foreground mx-auto" />}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-accent smooth-transition"
              aria-label="Close sidebar"
            >
              <X size={22} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          {navigationGroups.map((group) => (
            <div key={group.id}>
              {group.title &&
                !isCompact && ( // For actual groups with titles
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground smooth-transition"
                    aria-expanded={expandedGroups[group.id]}
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{group.icon}</span>
                      <span>{group.title}</span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`smooth-transition ${
                        expandedGroups[group.id] ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              <AnimatePresence initial={false}>
                {(!group.title || expandedGroups[group.id] || isCompact) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <ul
                      className={`pt-1 ${
                        group.title && !isCompact ? "pl-4" : ""
                      }`}
                    >
                      {group.items.map((item) => {
                        const isActive = isRouteActive(item.path);
                        return (
                          <li key={item.title}>
                            <NavLink
                              to={item.path}
                              onClick={handleNavClick}
                              className={`flex items-center px-3 py-2.5 my-0.5 text-sm rounded-md smooth-transition group
                                ${isCompact ? "justify-center" : ""}
                                ${
                                  isActive
                                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                    : "text-foreground hover:bg-accent hover:text-accent-foreground font-medium"
                                }`}
                              title={isCompact ? item.title : ""}
                            >
                              <span
                                className={
                                  isCompact
                                    ? ""
                                    : "mr-3 group-hover:scale-110 smooth-transition"
                                }
                              >
                                {item.icon}
                              </span>
                              {!isCompact && <span>{item.title}</span>}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
        {/* Optional Footer for Sidebar */}
        {/* <div className="p-4 border-t border-border mt-auto">
          <p className="text-xs text-muted-foreground text-center">&copy; {new Date().getFullYear()} Jasmine Automate</p>
        </div> */}
      </motion.aside>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  isMobile: PropTypes.bool,
  toggleSidebar: PropTypes.func,
};

export default Sidebar;
