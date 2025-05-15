"use client"

import { NavLink } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  CheckSquare,
  Send,
  ListChecks,
  FileText,
  Folder,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"

const TaskSidebar = ({ isOpen, isMobile, toggleSidebar }) => {
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/my-tasks", label: "My Tasks", icon: CheckSquare },
    { path: "/delegated-tasks", label: "Delegated Tasks", icon: Send },
    { path: "/all-tasks", label: "All Tasks", icon: ListChecks },
    { path: "/task-templates", label: "Task Templates", icon: FileText },
    { path: "/task-directory", label: "Task Directory", icon: Folder },
  ]

  // If mobile and sidebar is closed, don't render anything
  if (isMobile && !isOpen) return null

  return (
    <AnimatePresence>
      {(isOpen || !isMobile) && (
        <>
          {/* Mobile overlay */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-10"
              onClick={toggleSidebar}
            />
          )}

          {/* Sidebar */}
          <motion.aside
            initial={isMobile ? { x: -250 } : { width: 60 }}
            animate={isMobile ? { x: 0 } : { width: isOpen ? 250 : 60 }}
            exit={isMobile ? { x: -250 } : { width: 60 }}
            transition={{ duration: 0.3 }}
            className={`relative h-full bg-gray-900 text-white z-20 flex flex-col border-r border-gray-800`}
          >
            {/* Toggle button */}
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-20 bg-gray-800 text-white p-1 rounded-full border border-gray-700"
              >
                {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center p-2 rounded-md transition-colors ${
                          isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`
                      }
                    >
                      <item.icon size={20} className="min-w-[20px]" />
                      {isOpen && <span className="ml-3">{item.label}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export default TaskSidebar
