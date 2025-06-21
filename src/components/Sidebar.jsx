"use client"

import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileText,
  Users,
  Settings,
  CreditCard,
  LinkIcon,
  HelpCircle,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import AutomateLogo from "@/components/common/AutomateLogo";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState({
    tasks: false,
    leaves: false,
    attendance: false,
  })
  const location = useLocation()

  const toggleMenu = (menu) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }))
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const isSubActive = (paths) => {
    return paths.some((path) => location.pathname === path)
  }

  const sidebarItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <CheckSquare size={20} />,
      label: "Tasks",
      submenu: true,
      key: "tasks",
      items: [
        { label: "My Tasks", path: "/tasks" },
        { label: "Delegated Tasks", path: "/delegated-tasks" },
        { label: "All Tasks", path: "/all-tasks" },
        { label: "Task Templates", path: "/task-templates" },
        { label: "Task Directory", path: "/task-directory" },
      ],
    },
    {
      icon: <Calendar size={20} />,
      label: "Leaves",
      submenu: true,
      key: "leaves",
      items: [
        { label: "My Leaves", path: "/my-leaves" },
        { label: "All Leaves", path: "/all-leaves" },
        { label: "Approvals", path: "/approvals" },
      ],
    },
    {
      icon: <FileText size={20} />,
      label: "Attendance",
      submenu: true,
      key: "attendance",
      items: [
        { label: "My Attendance", path: "/my-attendance" },
        { label: "All Attendance", path: "/all-attendance" },
        { label: "Settings", path: "/attendance-settings" },
      ],
    },
    {
      icon: <Calendar size={20} />,
      label: "Events",
      path: "/events",
    },
    {
      icon: <Calendar size={20} />,
      label: "Holidays",
      path: "/holidays",
    },
    {
      icon: <Users size={20} />,
      label: "My Team",
      path: "/my-team",
    },
    {
      icon: <LinkIcon size={20} />,
      label: "Links",
      path: "/links",
    },
    {
      icon: <CheckSquare size={20} />,
      label: "Checklist",
      path: "/checklist",
    },
    {
      icon: <Calendar size={20} />,
      label: "Mobile App",
      path: "/mobile-app",
    },
    {
      icon: <CreditCard size={20} />,
      label: "Billing",
      path: "/billing",
    },
    {
      icon: <LinkIcon size={20} />,
      label: "Refer & Earn",
      path: "/refer-and-earn",
    },
    {
      icon: <Settings size={20} />,
      label: "Settings",
      path: "/settings",
    },
    {
      icon: <HelpCircle size={20} />,
      label: "Support",
      path: "/support",
    },
  ]

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={toggleMobileMenu} className="p-2 rounded-md bg-green-500 text-white hover:bg-green-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar for Desktop */}
      <div
        className={`hidden lg:flex flex-col h-screen bg-green-500 transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <div className={`${isCollapsed ? "hidden" : "block"}`}>
            <AutomateLogo />
          </div>
          <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-green-600 text-white">
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {sidebarItems.map((item, index) => (
              <div key={index}>
                {item.submenu ? (
                  <div className="mb-1">
                    <button
                      onClick={() => toggleMenu(item.key)}
                      className={`w-full flex items-center justify-between px-4 py-2 rounded-md text-white hover:bg-green-600 ${
                        isSubActive(item.items.map((subItem) => subItem.path)) ? "bg-green-600" : ""
                      }`}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        {!isCollapsed && <span className="ml-3">{item.label}</span>}
                      </div>
                      {!isCollapsed && (
                        <div>{expandedMenus[item.key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</div>
                      )}
                    </button>
                    {(expandedMenus[item.key] || isCollapsed) && (
                      <div
                        className={`mt-1 space-y-1 ${
                          isCollapsed ? "absolute left-16 bg-green-500 rounded-md p-2 w-48" : ""
                        }`}
                      >
                        {item.items.map((subItem, subIndex) => (
                          <NavLink
                            key={subIndex}
                            to={subItem.path}
                            className={({ isActive }) =>
                              `flex items-center px-4 py-2 rounded-md text-white hover:bg-green-600 ${
                                isActive ? "bg-green-600" : ""
                              }`
                            }
                          >
                            {isCollapsed && <div className="w-5">{item.icon}</div>}
                            <span className={isCollapsed ? "ml-3" : "ml-8"}>{subItem.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-md text-white hover:bg-green-600 ${
                        isActive ? "bg-green-600" : ""
                      }`
                    }
                  >
                    {item.icon}
                    {!isCollapsed && <span className="ml-3">{item.label}</span>}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isMobileMenuOpen ? 0 : "-100%" }}
        transition={{ duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-40 w-64 bg-green-500 lg:hidden"
      >
        <div className="flex items-center justify-between p-4">
          <AutomateLogo />
          <button onClick={toggleMobileMenu} className="p-1 rounded-md hover:bg-green-600 text-white">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {sidebarItems.map((item, index) => (
              <div key={index}>
                {item.submenu ? (
                  <div className="mb-1">
                    <button
                      onClick={() => toggleMenu(item.key)}
                      className={`w-full flex items-center justify-between px-4 py-2 rounded-md text-white hover:bg-green-600 ${
                        isSubActive(item.items.map((subItem) => subItem.path)) ? "bg-green-600" : ""
                      }`}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                      </div>
                      <div>{expandedMenus[item.key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</div>
                    </button>
                    {expandedMenus[item.key] && (
                      <div className="mt-1 space-y-1">
                        {item.items.map((subItem, subIndex) => (
                          <NavLink
                            key={subIndex}
                            to={subItem.path}
                            className={({ isActive }) =>
                              `flex items-center px-4 py-2 rounded-md text-white hover:bg-green-600 ${
                                isActive ? "bg-green-600" : ""
                              }`
                            }
                            onClick={toggleMobileMenu}
                          >
                            <span className="ml-8">{subItem.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-md text-white hover:bg-green-600 ${
                        isActive ? "bg-green-600" : ""
                      }`
                    }
                    onClick={toggleMobileMenu}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </NavLink>
                )}
              </div>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleMobileMenu}
        ></motion.div>
      )}
    </>
  )
}

export default Sidebar
