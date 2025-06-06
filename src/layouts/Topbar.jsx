"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Assuming AuthContext is in src/contexts
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Menu, X, User, LogOut, Settings } from "lucide-react";
import AutomateLogo from "@/components/common/AutomateLogo";
import useActivities from "@/hooks/useActivities"; // Corrected default import
import Button from "@/components/ui/button"; // Assuming Button is in src/components/ui

const Topbar = ({
  toggleSidebar,
  toggleTaskSidebar,
  showTaskSidebarToggle,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Use the custom hook for activities
  // This assumes useActivities returns an object like { activities, isLoading, error, refreshActivities }
  // and refreshActivities can be called to re-fetch.
  const [isActivitiesRefreshing, setIsActivitiesRefreshing] = useState(false);
  const { activities, activitiesLoading, activitiesError } = useActivities(
    isActivitiesRefreshing
  );

  const userDropdownRef = useRef(null);
  const notificationsDropdownRef = useRef(null);
  const notificationBellRef = useRef(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownOpen &&
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target) &&
        !event.target.closest(".user-dropdown-button") // Ensure not clicking the button itself
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userDropdownOpen]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsOpen &&
        notificationsDropdownRef.current &&
        !notificationsDropdownRef.current.contains(event.target) &&
        notificationBellRef.current && // Check bell ref as well
        !notificationBellRef.current.contains(event.target) // Ensure not clicking bell
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen]);

  // Handle keyboard shortcut for search and escape for modals/dropdowns
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        if (searchOpen) setSearchOpen(false);
        if (notificationsOpen) setNotificationsOpen(false);
        if (userDropdownOpen) setUserDropdownOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, notificationsOpen, userDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login"); // Adjust to your login route if different
  };

  const handleRefreshNotifications = (e) => {
    e.stopPropagation(); // Prevent dropdown from closing if it's part of the dropdown itself
    setIsActivitiesRefreshing((prev) => !prev); // Or use a counter: setIsActivitiesRefreshing(c => c + 1) if it's a number
  };

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-20 relative">
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="p-1 mr-2 text-gray-400 rounded-md hover:bg-gray-800 hover:text-white lg:hidden"
          aria-label="Toggle main sidebar"
        >
          <Menu size={24} />
        </button>

        {/* Task sidebar toggle for mobile */}
        {showTaskSidebarToggle && (
          <button
            onClick={toggleTaskSidebar}
            className="p-1 mr-2 text-gray-400 rounded-md hover:bg-gray-800 hover:text-white lg:hidden"
            aria-label="Toggle task sidebar"
          >
            <Menu size={24} />
          </button>
        )}

        {/* Logo - visible on larger screens */}
        <div className="hidden md:block">
          <AutomateLogo />
        </div>

        {/* Search bar */}
        <div className="relative ml-4">
          <div
            className="flex items-center bg-gray-800 text-gray-400 rounded-md px-3 py-1.5 cursor-pointer hover:bg-gray-700 smooth-transition"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={16} />
            <span className="ml-2 text-sm hidden md:inline">
              Search (CTRL/CMD+K)
            </span>
          </div>

          {/* Full-screen search overlay */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 flex items-start justify-center pt-16 sm:pt-20 z-50 backdrop-blur-sm"
                onClick={() => setSearchOpen(false)} // Close on overlay click
              >
                <motion.div
                  initial={{ scale: 0.95, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: -20, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-xl mx-4"
                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                >
                  <div className="flex items-center border-b border-gray-700 p-3">
                    <Search size={20} className="text-gray-400 mr-3" />
                    <input
                      type="text"
                      className="flex-1 bg-transparent outline-none text-lg text-gray-200 placeholder-gray-500"
                      placeholder="Search..."
                      autoFocus
                    />
                    <button
                      onClick={() => setSearchOpen(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-500 text-sm text-center">
                      No recent searches
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center">
        {/* Notification bell and dropdown */}
        <div className="relative">
          <button
            ref={notificationBellRef}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-1.5 text-gray-400 rounded-md hover:bg-gray-800 hover:text-white relative"
            aria-label="Toggle notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell size={20} />
            {activities &&
              activities.length > 0 && ( // Show dot if there are activities
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-900"></span>
              )}
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                ref={notificationsDropdownRef}
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: { opacity: 1, y: 0, scale: 1 },
                  closed: { opacity: 0, y: -10, scale: 0.95 },
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute mt-2 bg-gray-800 text-gray-200 rounded-lg shadow-2xl border border-gray-700 z-50 overflow-hidden flex flex-col
                       w-[calc(100vw-2rem)] max-w-sm left-1/2 -translate-x-1/2 
                       sm:w-80 sm:max-w-none sm:left-auto sm:right-0 sm:translate-x-0"
              >
                <div className="p-3 border-b border-gray-700 flex-shrink-0">
                  {" "}
                  {/* Header - flex-shrink-0 to prevent shrinking */}
                  <h3 className="text-sm font-semibold">Notifications</h3>
                </div>
                <div className="overflow-y-auto scrollbar-thin max-h-80">
                  {" "}
                  {/* List container - will take available space and scroll */}
                  {activitiesLoading ? (
                    <div className="p-4 text-center">
                      <p className="text-xs text-gray-400">
                        Loading notifications...
                      </p>
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-xs text-gray-400">
                        No recent activity.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-700/50">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="p-3 hover:bg-gray-700/70 smooth-transition cursor-pointer"
                          onClick={() => {
                            // Handle notification click, e.g., navigate
                            setNotificationsOpen(false); // Close dropdown on item click
                          }}
                        >
                          <p className="text-sm font-medium leading-tight">
                            <span className="font-semibold">
                              {activity.user}
                            </span>{" "}
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(activity.timestamp).toLocaleString([], {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Footer Actions - flex-shrink-0 to prevent shrinking */}
                {activities && activities.length > 0 && (
                  <div className="p-2 border-t border-gray-700 text-center flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefreshNotifications}
                      className="text-blue-400 hover:text-blue-300 w-full sm:w-auto text-xs"
                    >
                      Refresh Notifications
                    </Button>
                  </div>
                )}
                <div className="p-2 border-t border-gray-700 text-center flex-shrink-0">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      // navigate to all notifications page if you have one
                      setNotificationsOpen(false);
                    }}
                    className="text-gray-400 hover:text-gray-200 w-full sm:w-auto text-xs"
                  >
                    View all notifications
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User dropdown */}
        <div className="relative ml-3">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none user-dropdown-button"
            aria-label="User menu"
            aria-expanded={userDropdownOpen}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-white text-sm font-medium">
                {user?.name || "User Name"}
              </p>
              <p className="text-gray-400 text-xs">{user?.role || "Role"}</p>
            </div>
          </button>

          <AnimatePresence>
            {userDropdownOpen && (
              <motion.div
                ref={userDropdownRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95,
                  transition: { duration: 0.15 },
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-2xl py-1 z-50"
              >
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate("/profile"); // Adjust to your profile route
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/70 hover:text-white"
                >
                  <User size={16} className="mr-2" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate("/settings"); // Adjust to your settings route
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/70 hover:text-white"
                >
                  <Settings size={16} className="mr-2" />
                  Settings
                </button>
                <div className="border-t border-gray-700/50 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
