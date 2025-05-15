"use client"

import { Link, useLocation } from "react-router-dom"
import { ROUTES } from "../../constants/routes"
import { ChevronRight } from "lucide-react"

/**
 * BreadcrumbTrail component
 * Displays the current navigation path as clickable breadcrumbs
 */
const BreadcrumbTrail = () => {
  const location = useLocation()
  const pathSegments = location.pathname.split("/").filter(Boolean)

  // Map route paths to human-readable names
  const getRouteLabel = (path) => {
    // Handle special cases
    if (path === "dashboard" || path === "") return "Dashboard"
    if (path === "tasks") return "Task Management"
    if (path === "directory" && pathSegments[0] === "tasks") return "Task Directory"
    if (path === "templates" && pathSegments[0] === "tasks") return "Task Templates"
    if (path === "attendance") return "My Attendance"
    if (path === "all" && pathSegments[0] === "attendance") return "All Attendance"
    if (path === "settings" && pathSegments[0] === "attendance") return "Attendance Settings"
    if (path === "leaves") return "My Leaves"
    if (path === "all" && pathSegments[0] === "leaves") return "All Leaves"
    if (path === "approvals") return "Approvals"
    if (path === "events") return "Events"
    if (path === "holidays") return "Holidays"
    if (path === "team") return "My Team"
    if (path === "mobile-app") return "Mobile App"
    if (path === "checklist") return "Checklist"
    if (path === "links") return "Links"
    if (path === "refer-earn") return "Refer & Earn"
    if (path === "settings") return "Settings"

    // Default: capitalize the path
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  // Build breadcrumb items with proper paths
  const breadcrumbs = pathSegments.map((segment, index) => {
    // Build the path up to this point
    const path = "/" + pathSegments.slice(0, index + 1).join("/")

    return {
      label: getRouteLabel(segment),
      path,
      isLast: index === pathSegments.length - 1,
    }
  })

  // Add Dashboard as the first breadcrumb if we're not on the dashboard
  if (location.pathname !== ROUTES.DASHBOARD && location.pathname !== "/") {
    breadcrumbs.unshift({
      label: "Dashboard",
      path: ROUTES.DASHBOARD,
      isLast: breadcrumbs.length === 0,
    })
  }

  // If we have no breadcrumbs (e.g., on root), add Dashboard
  if (breadcrumbs.length === 0) {
    breadcrumbs.push({
      label: "Dashboard",
      path: ROUTES.DASHBOARD,
      isLast: true,
    })
  }

  return (
    <nav className="flex items-center text-sm text-gray-500 mb-4">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center">
          {index > 0 && <ChevronRight size={16} className="mx-2 text-gray-400" />}

          {crumb.isLast ? (
            <span className="font-medium text-gray-800">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-blue-600 hover:underline">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}

export default BreadcrumbTrail
