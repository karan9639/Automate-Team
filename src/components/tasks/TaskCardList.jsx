"use client"

import { useState, useEffect } from "react"
import { myTask } from "@/api/tasksApi"
import TaskCard from "./TaskCard"
import EmptyState from "../common/EmptyState"
import { Loader2, AlertCircle, CheckSquare } from "lucide-react"
import toast from "react-hot-toast"

const TaskCardList = ({ filters = {}, searchQuery = "", refreshTrigger = 0 }) => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)

      // Prepare userData parameters
      const userData = {
        ...filters,
        ...(searchQuery && { search: searchQuery }),
      }

      // Call your API function
      const response = await myTask(userData)

      // Handle different response structures
      const taskData = response.data?.tasks || response.data?.data || response.data || []

      if (Array.isArray(taskData)) {
        setTasks(taskData)
      } else {
        console.warn("API response is not an array:", taskData)
        setTasks([])
      }

      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError(err)

      // Show user-friendly error message
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.")
      } else if (err.response?.status === 403) {
        toast.error("You don't have permission to view these tasks.")
      } else if (err.response?.status >= 500) {
        toast.error("Server error. Please try again later.")
      } else if (err.code === "NETWORK_ERROR") {
        toast.error("Network error. Please check your connection.")
      } else {
        toast.error("Failed to load tasks. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Retry mechanism
  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount((prev) => prev + 1)
      fetchTasks()
    } else {
      toast.error("Maximum retry attempts reached. Please refresh the page.")
    }
  }

  // Fetch tasks on component mount and when dependencies change
  useEffect(() => {
    fetchTasks()
  }, [filters, searchQuery, refreshTrigger])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Failed to load tasks</h3>
          <p className="text-gray-600 mb-4">
            {error.response?.data?.message || error.message || "Something went wrong"}
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            disabled={retryCount >= 3}
          >
            {retryCount >= 3 ? "Max retries reached" : `Retry (${retryCount}/3)`}
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        icon={<CheckSquare className="h-16 w-16 text-gray-400" />}
        title="No Tasks Found"
        description={
          searchQuery ? `No tasks found matching "${searchQuery}"` : "You don't have any tasks assigned at the moment."
        }
        className="py-12"
      />
    )
  }

  // Render task cards
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          Showing {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task, index) => (
          <TaskCard key={task.id || task._id || index} task={task} />
        ))}
      </div>
    </div>
  )
}

export default TaskCardList
