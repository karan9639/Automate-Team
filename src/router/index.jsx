import { createBrowserRouter, Navigate } from "react-router-dom"
import MainLayout from "../layouts/MainLayout"
import Dashboard from "../pages/Dashboard"
import TaskManagement from "../pages/TaskManagement"
import MyAttendance from "../pages/MyAttendance"
import MyLeaves from "../pages/MyLeaves"
import Approvals from "../pages/Approvals"
import AllLeaves from "../pages/AllLeaves"
import MyTeam from "../pages/MyTeam"
import Settings from "../pages/Settings"
import NotFound from "../pages/NotFound"

// Auth guard for admin routes
const AdminRoute = ({ element }) => {
  const isAdmin = true // In a real app, this would check the user's role from Redux
  return isAdmin ? element : <Navigate to="/" replace />
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "tasks",
        element: <TaskManagement />,
      },
      {
        path: "attendance",
        element: <MyAttendance />,
      },
      {
        path: "my-leaves",
        element: <MyLeaves />,
      },
      {
        path: "approvals",
        element: <AdminRoute element={<Approvals />} />,
      },
      {
        path: "all-leaves",
        element: <AdminRoute element={<AllLeaves />} />,
      },
      {
        path: "team",
        element: <MyTeam />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
])
