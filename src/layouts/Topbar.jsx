"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Bell,
  Settings,
} from "lucide-react";
import PropTypes from "prop-types";
import { ROUTES } from "../constants/routes";
import { toast } from "react-hot-toast";
import { logoutUser } from "@/api/authApi";
import { Button } from "@/components/ui/button"; // Assuming Button is modernized

const Topbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape" && searchOpen) setSearchOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  const handleLogout = async (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setDropdownOpen(false);
    try {
      await logoutUser();
      await logout();
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
      toast.success("Logged out successfully.");
    } catch (error) {
      toast.error(`Logout failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserDisplayName = () =>
    currentUser?.fullname ||
    currentUser?.name ||
    currentUser?.email?.split("@")[0] ||
    "User";
  const getUserInitial = () => getUserDisplayName().charAt(0).toUpperCase();
  const getUserRole = () =>
    currentUser?.accountType || currentUser?.role || "User";
  const getUserEmail = () => currentUser?.email || "";

  const itemVariants = {
    closed: { opacity: 0, y: -10 },
    open: { opacity: 1, y: 0 },
  };

  return (
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border shadow-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="mr-2 text-muted-foreground hover:text-foreground"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </Button>

        {/* Global Search (Optional - can be complex to implement fully) */}
        {/* <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 text-muted-foreground" onClick={() => setSearchOpen(true)}>
          <Search size={16} /> Search... <span className="text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</span>
        </Button> */}
      </div>

      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground relative"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {/* Example notification badge */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
          </Button>
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: { opacity: 1, y: 0, scale: 1 },
                  closed: { opacity: 0, y: -10, scale: 0.95 },
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-80 bg-popover text-popover-foreground rounded-lg shadow-2xl border border-border z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-border">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin p-2">
                  {/* Example Notification Item */}
                  <div className="p-2 hover:bg-accent rounded-md smooth-transition">
                    <p className="text-sm font-medium">
                      New task assigned: "Deploy to production"
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      2 minutes ago
                    </p>
                  </div>
                  <div className="p-2 hover:bg-accent rounded-md smooth-transition">
                    <p className="text-sm font-medium">
                      Comment on "Fix login bug"
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      1 hour ago
                    </p>
                  </div>
                  {/* Add more notifications here */}
                </div>
                <div className="p-2 border-t border-border text-center">
                  <Button variant="link" size="sm" className="text-primary">
                    View all notifications
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none p-1 rounded-md hover:bg-accent smooth-transition"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-semibold text-primary-foreground">
              {getUserInitial()}
            </div>
            <div className="hidden md:block text-left">
              <p
                className="text-sm font-semibold text-foreground truncate max-w-[120px]"
                title={getUserEmail()}
              >
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-muted-foreground">{getUserRole()}</p>
            </div>
            <ChevronDown
              size={16}
              className="text-muted-foreground hidden md:block"
            />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: { opacity: 1, y: 0, scale: 1 },
                  closed: { opacity: 0, y: -10, scale: 0.95 },
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-60 bg-popover text-popover-foreground rounded-lg shadow-2xl border border-border z-50 py-1.5 overflow-hidden"
              >
                <div className="px-3 py-2.5 border-b border-border md:hidden">
                  <p className="text-sm font-semibold text-foreground">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getUserEmail()}
                  </p>
                </div>
                {[
                  {
                    label: "Profile",
                    icon: User,
                    action: () => navigate(ROUTES.PROFILE),
                  },
                  {
                    label: "Settings",
                    icon: Settings,
                    action: () => navigate(ROUTES.SETTINGS),
                  },
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    variants={itemVariants}
                    onClick={() => {
                      item.action();
                      setDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-popover-foreground hover:bg-accent smooth-transition"
                  >
                    <item.icon
                      size={16}
                      className="mr-2.5 text-muted-foreground"
                    />
                    {item.label}
                  </motion.button>
                ))}
                <div className="my-1.5 h-px bg-border" />
                <motion.button
                  variants={itemVariants}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`flex items-center w-full px-3 py-2 text-sm smooth-transition ${
                    isLoggingOut
                      ? "text-muted-foreground cursor-not-allowed"
                      : "text-destructive hover:bg-destructive/10"
                  }`}
                >
                  <LogOut size={16} className="mr-2.5" />
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Modal (if used) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 z-50"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-popover rounded-xl shadow-2xl w-full max-w-xl mx-4 border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center border-b border-border p-4">
                <Search size={20} className="text-muted-foreground mr-3" />
                <input
                  type="text"
                  className="flex-1 bg-transparent outline-none text-lg placeholder:text-muted-foreground"
                  placeholder="Search tasks, users, projects..."
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchOpen(false)}
                  className="text-muted-foreground"
                >
                  Esc
                </Button>
              </div>
              <div className="p-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Start typing to see results.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

Topbar.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
};

export default Topbar;
