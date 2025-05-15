"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { motion } from "framer-motion"
import { Search, Bell, Menu, X, User, LogOut, Settings } from "lucide-react"
import AutomateLogo from "./AutomateLogo"

const Topbar = ({ toggleSidebar, toggleTaskSidebar, showTaskSidebarToggle }) => {
  const [searchOpen, setSearchOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".user-dropdown")) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownOpen])

  // Handle keyboard shortcut for search
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

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-10">
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
            className="flex items-center bg-gray-800 text-gray-400 rounded-md px-3 py-1.5 cursor-pointer"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={16} />
            <span className="ml-2 text-sm hidden md:inline">Search (CTRL/CMD+K)</span>
          </div>

          {/* Full-screen search overlay */}
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50"
            >
              <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
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
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex items-center">
        {/* Notification bell */}
        <button className="p-1.5 text-gray-400 rounded-md hover:bg-gray-800 hover:text-white relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User dropdown */}
        <div className="relative ml-4 user-dropdown">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {user?.name?.charAt(0) || "K"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-white text-sm font-medium">{user?.name || "Karan"}</p>
              <p className="text-gray-400 text-xs">{user?.role || "Admin"}</p>
            </div>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
            >
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
                  navigate("/settings")
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
                Logout
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar
