"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { Button } from "../../components/ui/button"
import AssignTaskModal from "../../components/modals/AssignTaskModal"

const MyTasks = () => {
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("this-week")
  const [activeStatus, setActiveStatus] = useState(null)

  // Get tasks from Redux store
  const { tasks } = useSelector((state) => state.tasks)

  // Filter tasks based on active filters
  const filteredTasks = tasks.filter((task) => {
    // Filter by status if active
    if (activeStatus && task.status !== activeStatus) {
      return false
    }

    // Filter by date range
    // This is a simplified example - you would implement actual date filtering logic
    return true
  })

  // Open assign task modal
  const handleOpenAssignTaskModal = () => {
    setIsAssignTaskModalOpen(true)
  }

  // Close assign task modal
  const handleCloseAssignTaskModal = () => {
    setIsAssignTaskModalOpen(false)
  }

  // Handle date filter change
  const handleDateFilterChange = (filter) => {
    setActiveFilter(filter)
  }

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setActiveStatus(status === activeStatus ? null : status)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Trial account notice */}
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-6 flex justify-between items-center">
        <p className="text-amber-800">
          Your Trial Account will be expiring on May 18, 2025. Upgrade Now for uninterrupted access
        </p>
        <Button className="bg-amber-500 hover:bg-amber-600 text-white">Upgrade Now</Button>
      </div>

      {/* Header with search and user profile */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search (CTRL/CMD+K)"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
              KS
            </div>
            <div className="text-sm">
              <p className="font-medium">Karan</p>
              <p className="text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons and filters */}
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={handleOpenAssignTaskModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Assign Task
        </Button>

        <div className="flex gap-2">
          {["today", "yesterday", "this-week", "this-month", "next-week", "all-time", "custom"].map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              className={`${activeFilter === filter ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"} rounded-full`}
              onClick={() => handleDateFilterChange(filter)}
            >
              {filter
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Button>
          ))}
        </div>

        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">Filter</Button>
      </div>

      {/* Status filters */}
      <div className="flex gap-6 mb-8 border-b pb-4">
        {[
          { id: "overdue", label: "OverDue", color: "text-red-500", dot: "bg-red-500" },
          { id: "pending", label: "Pending", color: "text-gray-500", dot: "bg-gray-500" },
          { id: "in-progress", label: "In Progress", color: "text-amber-500", dot: "bg-amber-500" },
          { id: "completed", label: "Completed", color: "text-green-500", dot: "bg-green-500" },
        ].map((status) => (
          <button
            key={status.id}
            className={`flex items-center gap-2 pb-2 ${activeStatus === status.id ? `${status.color} border-b-2 border-current` : "text-gray-500"}`}
            onClick={() => handleStatusFilterChange(status.id)}
          >
            <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
            <span>{status.label} - 0</span>
          </button>
        ))}
      </div>

      {/* Task list or empty state */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {/* Task cards would go here */}
          <p>Tasks would be displayed here</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-48 h-48 mb-4">
            <img src="/placeholder-8swxm.png" alt="No tasks" className="w-full h-full object-contain" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Tasks Here</h3>
          <p className="text-gray-500">It seems that you don't have any tasks in this list</p>
        </div>
      )}

      {/* Assign Task Modal */}
      <AssignTaskModal isOpen={isAssignTaskModalOpen} onClose={handleCloseAssignTaskModal} />
    </div>
  )
}

export default MyTasks
