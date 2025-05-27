"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  ChevronDown
} from "lucide-react"
import AutomateLogo from "../components/common/AutomateLogo"
import PropTypes from "prop-types"
import { ROUTES } from "../constants/routes"
import { logoutUser } from "../api/authApi"
import { toast } from "react-hot-toast"

const Topbar = ({ toggleSidebar, isSidebarOpen, isMobile }) => {
  const [searchOpen, setSearchOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".user-dropdown")) {
        setDropdownOpen(false)
      }
      if (notificationsOpen && !event.target.closest(".notifications-dropdown")) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownOpen, notificationsOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [searchOpen])

  const handleLogout = async (event) => {
    event?.preventDefault()
    event?.stopPropagation()

    try {
      setDropdownOpen(false)

      const apiResponse = await logoutUser()

      if (!apiResponse?.success) {
        toast.error("API Logout failed. Please try again.")
        console.error("Logout API failed:", apiResponse)
        return
      }

      await logout()
      toast.success("Logged out successfully.")
      navigate(ROUTES.AUTH.LOGIN, { replace: true })
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Logout failed. Please try again.")
    }
  }

  const getUserDisplayName = () => {
    if (!currentUser) return "User"
    if (currentUser.fullname?.trim()) return currentUser.fullname.trim()
    if (currentUser.name?.trim()) return currentUser.name.trim()
    if (currentUser.email) return currentUser.email.split("@")[0]
    return "User"
  }

  const getUserInitial = () => {
    return getUserDisplayName().charAt(0).toUpperCase()
  }

  const getUserRole = () => {
    return currentUser?.accountType || currentUser?.role || "User"
  }

  const getUserEmail = () => {
    return currentUser?.email || ""
  }

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-10 sticky top-0">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-1 mr-3 text-gray-400 rounded-md hover:bg-gray-800 hover:text-white"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu size={24} />
        </button>

        {isMobile && !isSidebarOpen && (
          <div className="mr-3">
            <AutomateLogo />
          </div>
        )}

        <div className="relative">
          <div
            className="flex items-center bg-gray-800 text-gray-400 rounded-md px-3 py-1.5 cursor-pointer"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={16} />
            <span className="ml-2 text-sm hidden md:inline">Search (CTRL/CMD+K)</span>
          </div>

          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setSearchOpen(false)
                }}
              >
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center border-b p-4">
                    <Search size={20} className="text-gray-500 mr-2" />
                    <input type="text" className="flex-1 outline-none text-lg" placeholder="Search..." autoFocus />
                    <button onClick={() => setSearchOpen(false)}>
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-500 text-sm">No recent searches</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative notifications-dropdown">
          <button
            className="p-1.5 text-gray-400 rounded-md hover:bg-gray-800 hover:text-white relative"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50"
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-medium">New task assigned</p>
                    <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-medium">Leave request approved</p>
                    <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50">
                    <p className="text-sm font-medium">Team meeting reminder</p>
                    <p className="text-xs text-gray-500 mt-1">Tomorrow, 10:00 AM</p>
                  </div>
                </div>
                <div className="px-4 py-2 border-t border-gray-100">
                  <button className="text-sm text-blue-600 hover:text-blue-800">View all notifications</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative user-dropdown">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {getUserInitial()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-white text-sm font-medium" title={getUserEmail()}>
                {getUserDisplayName()}
              </p>
              <p className="text-gray-400 text-xs">{getUserRole()}</p>
            </div>
            <ChevronDown size={16} className="text-gray-400 hidden md:block" />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50"
              >
                <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                  <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500">{getUserEmail()}</p>
                  <p className="text-xs text-blue-600 font-medium">{getUserRole()}</p>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    navigate("/profile")
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User size={16} className="mr-2" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    navigate(ROUTES.SETTINGS)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings size={16} className="mr-2" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

Topbar.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
}

export default Topbar
