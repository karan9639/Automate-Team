"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Filter, RefreshCw, Clock4, PlusCircle } from "lucide-react"
import KPICards from "../components/dashboard/KPICards"
import TaskDistributionChart from "../components/dashboard/TaskDistributionChart"
import UserActivityFeed from "../components/dashboard/UserActivityFeed"
import DateFilterModal from "../components/dashboard/DateFilterModal"
import GenerateReportModal from "../components/dashboard/GenerateReportModal"
import ConfirmDeleteModal from "../components/dashboard/ConfirmDeleteModal"
import AssignTaskModal from "../components/modals/AssignTaskModal" // Assuming this is styled or uses styled base components
import { userApi } from "../api/userApi"
import { setOverDue } from "../api/tasksApi"
import toast from "react-hot-toast"
import FAB from "@/components/common/FAB" // Modern FAB

// Dummy data for dashboard (Tasks and Users)
const DUMMY_TASKS = [
  {
    id: 1,
    name: "Implement user authentication",
    description: "Set up login and registration functionality with JWT tokens",
    dueDate: "2024-02-15",
    assignedUser: "John Doe",
    assignedUserId: "user1",
    status: "In Progress",
    priority: "High",
    createdAt: "2024-01-20",
    completedAt: null,
    category: "Development",
    frequency: "One-time",
    comments: [
      {
        id: 1,
        user: "John Doe",
        text: "Started working on the authentication flow",
        timestamp: "2024-01-21T10:30:00Z",
      },
      {
        id: 2,
        user: "Jane Smith",
        text: "Please make sure to implement password reset functionality",
        timestamp: "2024-01-22T14:15:00Z",
      },
    ],
  },
  {
    id: 2,
    name: "Design dashboard UI",
    description: "Create wireframes and mockups for the main dashboard",
    dueDate: "2024-02-10",
    assignedUser: "Jane Smith",
    assignedUserId: "user2",
    status: "Done",
    priority: "Medium",
    createdAt: "2024-01-15",
    completedAt: "2024-01-25",
    category: "Design",
    frequency: "One-time",
    comments: [
      {
        id: 3,
        user: "Jane Smith",
        text: "Completed the initial design mockups",
        timestamp: "2024-01-25T09:00:00Z",
      },
    ],
  },
  {
    id: 3,
    name: "Database optimization",
    description: "Optimize database queries for better performance",
    dueDate: "2024-02-20",
    assignedUser: "Mike Johnson",
    assignedUserId: "user3",
    status: "To Do",
    priority: "Low",
    createdAt: "2024-01-25",
    completedAt: null,
    category: "Backend",
    frequency: "Monthly",
    comments: [],
  },
  {
    id: 4,
    name: "API documentation",
    description: "Write comprehensive API documentation for all endpoints",
    dueDate: "2024-02-12",
    assignedUser: "Sarah Wilson",
    assignedUserId: "user4",
    status: "In Progress",
    priority: "Medium",
    createdAt: "2024-01-18",
    completedAt: null,
    category: "Documentation",
    frequency: "One-time",
    comments: [
      {
        id: 4,
        user: "Sarah Wilson",
        text: "Working on the authentication endpoints documentation",
        timestamp: "2024-01-26T11:45:00Z",
      },
    ],
  },
  {
    id: 5,
    name: "Mobile app testing",
    description: "Conduct thorough testing of the mobile application",
    dueDate: "2024-02-08",
    assignedUser: "Alex Brown",
    assignedUserId: "user5",
    status: "Overdue",
    priority: "High",
    createdAt: "2024-01-10",
    completedAt: null,
    category: "Testing",
    frequency: "Weekly",
    comments: [
      {
        id: 5,
        user: "Alex Brown",
        text: "Found several bugs in the iOS version",
        timestamp: "2024-01-27T16:20:00Z",
      },
    ],
  },
  {
    id: 6,
    name: "Weekly team meeting",
    description: "Conduct weekly team sync-up meeting",
    dueDate: "2024-02-05",
    assignedUser: "John Doe",
    assignedUserId: "user1",
    status: "To Do",
    priority: "Medium",
    createdAt: "2024-01-22",
    completedAt: null,
    category: "Meetings",
    frequency: "Weekly",
    comments: [],
  },
  {
    id: 7,
    name: "Monthly performance review",
    description: "Review team performance metrics and set goals",
    dueDate: "2024-02-28",
    assignedUser: "Jane Smith",
    assignedUserId: "user2",
    status: "To Do",
    priority: "High",
    createdAt: "2024-01-15",
    completedAt: null,
    category: "Management",
    frequency: "Monthly",
    comments: [],
  },
]

const DUMMY_USERS = [
  { id: "user1", name: "John Doe", email: "john@example.com" },
  { id: "user2", name: "Jane Smith", email: "jane@example.com" },
  { id: "user3", name: "Mike Johnson", email: "mike@example.com" },
  { id: "user4", name: "Sarah Wilson", email: "sarah@example.com" },
  { id: "user5", name: "Alex Brown", email: "alex@example.com" },
]

const Dashboard = () => {
  // State variables remain the same
  const [tasks, setTasks] = useState(DUMMY_TASKS)
  const [users, setUsers] = useState(DUMMY_USERS)
  const [activities, setActivities] = useState([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [activitiesError, setActivitiesError] = useState(null)
  const [filteredTasks, setFilteredTasks] = useState(DUMMY_TASKS)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [userFilter, setUserFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [frequencyFilter, setFrequencyFilter] = useState("All")
  const [selectedTask, setSelectedTask] = useState(null)
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false)
  const [isGenerateReportOpen, setIsGenerateReportOpen] = useState(false)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
    filterType: "dueDate",
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCheckingOverdue, setIsCheckingOverdue] = useState(false)
  const [lastOverdueCheck, setLastOverdueCheck] = useState(null)

  // All functions (executeOverdueCheck, calculateKPIs, applyDateFilter, fetchActivitiesData, etc.) remain the same logic-wise.
  // The visual changes will come from the updated base components (Button, Card, etc.) and new layout classes.
  // Execute setOverDue API on dashboard load
  const executeOverdueCheck = async (showToast = true) => {
    setIsCheckingOverdue(true)
    try {
      console.log("🔄 Executing setOverDue API...")
      const response = await setOverDue()
      console.log("✅ setOverDue API response:", response.data)

      // Update last check timestamp
      setLastOverdueCheck(new Date().toISOString())

      // Update local tasks based on API response if needed
      if (response.data && response.data.updatedTasks) {
        const updatedTaskIds = response.data.updatedTasks
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (updatedTaskIds.includes(task.id) || updatedTaskIds.includes(task._id)) {
              // Mark task as overdue if it's not completed
              const completedStatuses = ["Done", "Completed", "Complete", "Finished"]
              if (!completedStatuses.includes(task.status) && !task.completedAt) {
                return { ...task, status: "Overdue" }
              }
            }
            return task
          }),
        )

        if (showToast) {
          toast.success(`Overdue check completed. ${updatedTaskIds.length} task(s) updated.`)
        }

        // Add activity log
        const newActivity = {
          id: Date.now().toString(),
          user: "System",
          action: `marked ${updatedTaskIds.length} task(s) as overdue`,
          task: updatedTaskIds.length === 1 ? "task" : `${updatedTaskIds.length} tasks`,
          timestamp: new Date().toISOString(),
          messageType: "system_overdue_update",
        }
        setActivities((prev) => [newActivity, ...prev])
      } else {
        if (showToast) {
          toast.success("Overdue check completed. No tasks needed updating.")
        }
      }
    } catch (error) {
      console.error("❌ Error executing setOverDue API:", error)
      if (showToast) {
        toast.error("Failed to check for overdue tasks")
      }
    } finally {
      setIsCheckingOverdue(false)
    }
  }

  // Execute overdue check on dashboard load
  useEffect(() => {
    console.log("🚀 Dashboard loaded, executing overdue check...")
    executeOverdueCheck(false) // Don't show toast on initial load
  }, [])

  // Manual overdue check function
  const handleManualOverdueCheck = async () => {
    await executeOverdueCheck(true) // Show toast for manual check
  }

  // Generate unique ID for new tasks
  const generateTaskId = () => {
    return Math.max(...tasks.map((t) => t.id), 0) + 1
  }

  // Calculate KPIs from filtered data
  const calculateKPIs = (taskList) => {
    const completedStatuses = ["Done", "Completed", "Complete", "Finished"]

    // Only count tasks as overdue if they have "Overdue" status
    const overdueTasks = taskList.filter((task) => task.status === "Overdue")

    return {
      totalTasks: taskList.length,
      completedTasks: taskList.filter((task) => completedStatuses.includes(task.status) || task.completedAt).length,
      pendingTasks: taskList.filter((task) => task.status === "To Do").length,
      inProgressTasks: taskList.filter((task) => task.status === "In Progress").length,
      overdueTasks: overdueTasks.length,
      activeUsers: [...new Set(taskList.map((task) => task.assignedUser))].length,
    }
  }

  const kpis = calculateKPIs(filteredTasks)

  // Task distribution data for chart
  const taskDistribution = {
    "To Do": filteredTasks.filter((task) => task.status === "To Do").length,
    "In Progress": filteredTasks.filter((task) => task.status === "In Progress").length,
    Done: filteredTasks.filter((task) => {
      const completedStatuses = ["Done", "Completed", "Complete", "Finished"]
      return completedStatuses.includes(task.status) || task.completedAt
    }).length,
    Overdue: filteredTasks.filter((task) => task.status === "Overdue").length,
  }

  // Apply date filter to tasks
  const applyDateFilter = (taskList, filter) => {
    if (!filter.startDate && !filter.endDate) return taskList

    return taskList.filter((task) => {
      let taskDate
      switch (filter.filterType) {
        case "dueDate":
          taskDate = new Date(task.dueDate)
          break
        case "createdDate":
          taskDate = new Date(task.createdAt)
          break
        case "completedDate":
          if (!task.completedAt) return false
          taskDate = new Date(task.completedAt)
          break
        default:
          taskDate = new Date(task.dueDate)
      }

      const startDate = filter.startDate ? new Date(filter.startDate) : null
      const endDate = filter.endDate ? new Date(filter.endDate) : null

      if (startDate && endDate) {
        return taskDate >= startDate && taskDate <= endDate
      } else if (startDate) {
        return taskDate >= startDate
      } else if (endDate) {
        return taskDate <= endDate
      }
      return true
    })
  }

  // Fetch activities from API
  useEffect(() => {
    const fetchActivitiesData = async () => {
      setActivitiesLoading(true)
      setActivitiesError(null)
      try {
        const response = await userApi.fetchActivities()
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          const fetchedActivities = response.data.data.map((activity) => {
            const fullMessage = activity.message
            const messageType = activity.messageType
            const task = activity.task
            const userNameMatch = fullMessage.match(/^([^\s]+)/)
            const userName = userNameMatch ? userNameMatch[0] : "User"

            let actionDescription = messageType.replace(/_/g, " ")
            let targetName = null

            let actionAndTargetDetails = fullMessage
            if (fullMessage.toLowerCase().startsWith(userName.toLowerCase())) {
              actionAndTargetDetails = fullMessage.substring(userName.length).trim()
            }

            const colonIndex = actionAndTargetDetails.indexOf(":")
            if (colonIndex > -1) {
              actionDescription = actionAndTargetDetails.substring(0, colonIndex).trim()
              targetName = actionAndTargetDetails.substring(colonIndex + 1).trim()
            } else {
              actionDescription = actionAndTargetDetails.trim()
            }
            if (!actionDescription && messageType) {
              actionDescription = messageType.replace(/_/g, " ")
            }

            return {
              id: activity._id,
              user: userName,
              action: actionDescription,
              task: task,
              timestamp: activity.createdAt,
              messageType: messageType,
            }
          })
          setActivities(fetchedActivities)
        } else {
          const errorMsg = response.data?.message || "Failed to fetch activities structure."
          setActivitiesError(errorMsg)
          toast.error(errorMsg)
          setActivities([])
        }
      } catch (error) {
        console.error("Error fetching activities:", error)
        const errorMessage =
          error.response?.data?.message || error.message || "An error occurred while fetching activities."
        setActivitiesError(errorMessage)
        toast.error(errorMessage)
        setActivities([])
      } finally {
        setActivitiesLoading(false)
        if (isRefreshing) setIsRefreshing(false)
      }
    }

    fetchActivitiesData()
  }, [isRefreshing])

  // Filter tasks based on all criteria
  useEffect(() => {
    let filtered = tasks
    filtered = applyDateFilter(filtered, dateFilter)
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.assignedUser.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }
    if (statusFilter !== "All") {
      if (statusFilter === "Overdue") {
        filtered = filtered.filter((task) => task.status === "Overdue")
      } else if (statusFilter === "Pending") {
        filtered = filtered.filter((task) => task.status === "To Do")
      } else if (statusFilter === "In Progress") {
        filtered = filtered.filter((task) => task.status === "In Progress")
      } else if (statusFilter === "Completed") {
        filtered = filtered.filter((task) => task.status === "Done")
      } else {
        filtered = filtered.filter((task) => task.status === statusFilter)
      }
    }
    if (userFilter !== "All") {
      filtered = filtered.filter((task) => task.assignedUser === userFilter)
    }
    if (priorityFilter !== "All") {
      filtered = filtered.filter((task) => task.priority === priorityFilter)
    }
    if (categoryFilter !== "All") {
      filtered = filtered.filter((task) => task.category === categoryFilter)
    }
    if (frequencyFilter !== "All") {
      filtered = filtered.filter((task) => task.frequency === frequencyFilter)
    }
    setFilteredTasks(filtered)
  }, [searchQuery, statusFilter, userFilter, priorityFilter, categoryFilter, frequencyFilter, dateFilter, tasks])

  const uniqueUsers = [...new Set(tasks.map((task) => task.assignedUser))]
  const uniqueCategories = [...new Set(tasks.map((task) => task.category))]
  const uniqueFrequencies = [...new Set(tasks.map((task) => task.frequency))]

  const handleCreateTask = () => {
    setEditingTask(null)
    setIsTaskFormOpen(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setIsTaskFormOpen(true)
  }

  const handleTaskSubmit = async (taskData) => {
    try {
      let activityAction = ""
      let taskNameForActivity = ""
      let messageType = ""

      if (editingTask) {
        const updatedTask = {
          ...editingTask,
          ...taskData,
          assignedUser: users.find((u) => u.id === taskData.assignedUserId)?.name || taskData.assignedUser,
        }
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === editingTask.id ? updatedTask : task)))
        activityAction = "updated task"
        taskNameForActivity = updatedTask.name
        messageType = "task_edited"
        if (selectedTask?.id === editingTask.id) setSelectedTask(updatedTask)
      } else {
        const newTask = {
          id: generateTaskId(),
          ...taskData,
          assignedUser: users.find((u) => u.id === taskData.assignedUserId)?.name || taskData.assignedUser,
          createdAt: new Date().toISOString(),
          completedAt: null,
          comments: [],
        }
        setTasks((prevTasks) => [...prevTasks, newTask])
        activityAction = "created task"
        taskNameForActivity = newTask.name
        messageType = "task_created"
      }

      const newActivity = {
        id: Date.now().toString(),
        user: "Current User",
        action: activityAction,
        task: taskNameForActivity,
        timestamp: new Date().toISOString(),
        messageType: messageType,
      }
      setActivities((prev) => [newActivity, ...prev])
      setIsTaskFormOpen(false)
      setEditingTask(null)
      return { success: true }
    } catch (error) {
      console.error("Error saving task:", error)
      return { success: false, error: error.message }
    }
  }

  const handleDeleteTask = (task) => {
    setTaskToDelete(task)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      if (taskToDelete) {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskToDelete.id))
        const newActivity = {
          id: Date.now().toString(),
          user: "Current User",
          action: "deleted task",
          task: taskToDelete.name,
          timestamp: new Date().toISOString(),
          messageType: "task_deleted",
        }
        setActivities((prev) => [newActivity, ...prev])
        if (selectedTask?.id === taskToDelete.id) setSelectedTask(null)
      }
      setIsDeleteModalOpen(false)
      setTaskToDelete(null)
      return { success: true }
    } catch (error) {
      console.error("Error deleting task:", error)
      return { success: false, error: error.message }
    }
  }

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const updatedTask = tasks.find((task) => task.id === taskId)
      if (!updatedTask) return { success: false, error: "Task not found" }

      // Determine completion timestamp
      const completedStatuses = ["Done", "Completed", "Complete", "Finished"]
      const isCompleting = completedStatuses.includes(newStatus)
      const wasCompleted = completedStatuses.includes(updatedTask.status)
      const wasOverdue = updatedTask.status === "Overdue"

      const taskUpdate = {
        ...updatedTask,
        status: newStatus,
        completedAt: isCompleting
          ? new Date().toISOString()
          : wasCompleted && !isCompleting
            ? null
            : updatedTask.completedAt,
      }

      setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? taskUpdate : task)))

      const newActivity = {
        id: Date.now().toString(),
        user: "Current User",
        action: `marked task as ${newStatus.toLowerCase()}`,
        task: updatedTask.name,
        timestamp: new Date().toISOString(),
        messageType: "task_status_changed",
      }
      setActivities((prev) => [newActivity, ...prev])

      if (selectedTask?.id === taskId) setSelectedTask(taskUpdate)

      // Show specific message for status changes
      if (wasOverdue) {
        if (isCompleting) {
          toast.success(`Task "${updatedTask.name}" completed and removed from overdue list`)
        } else {
          toast.success(`Task "${updatedTask.name}" status changed to ${newStatus} and removed from overdue list`)
        }
      }

      return { success: true }
    } catch (error) {
      console.error("Error updating task status:", error)
      return { success: false, error: error.message }
    }
  }

  const handleDateFilterApply = (filter) => {
    setDateFilter(filter)
    setIsDateFilterOpen(false)
  }

  const handleDateFilterClear = () => {
    setDateFilter({ startDate: null, endDate: null, filterType: "dueDate" })
    setIsDateFilterOpen(false)
  }

  const handleGenerateReport = async (reportConfig) => {
    try {
      const dataStr = JSON.stringify({ ...reportConfig, tasks: filteredTasks, kpis, activities }, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
      const exportFileDefaultName = `dashboard-report-${new Date().toISOString().split("T")[0]}.json`
      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()
      setIsGenerateReportOpen(false)

      const newActivity = {
        id: Date.now().toString(),
        user: "Current User",
        action: "generated report",
        task: null,
        timestamp: new Date().toISOString(),
        messageType: "report_generated",
      }
      setActivities((prev) => [newActivity, ...prev])
      return { success: true }
    } catch (error) {
      console.error("Error generating report:", error)
      return { success: false, error: error.message }
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    toast.success("Refreshing dashboard data...")
    // Also trigger overdue check on refresh
    handleManualOverdueCheck()
  }

  const handleAddComment = async (taskId, commentText) => {
    try {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return { success: false, error: "Task not found" }

      const newComment = {
        id: Date.now(),
        user: "Current User",
        text: commentText,
        timestamp: new Date().toISOString(),
      }
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? { ...t, comments: [...(t.comments || []), newComment] } : t)),
      )
      const newActivity = {
        id: Date.now().toString(),
        user: "Current User",
        action: "commented on task",
        task: task.name,
        timestamp: new Date().toISOString(),
        messageType: "comment_added",
      }
      setActivities((prev) => [newActivity, ...prev])
      if (selectedTask?.id === taskId) {
        setSelectedTask((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), newComment],
        }))
      }
      return { success: true }
    } catch (error) {
      console.error("Error adding comment:", error)
      return { success: false, error: error.message }
    }
  }

  const getDateRangeDisplay = () => {
    if (!dateFilter.startDate && !dateFilter.endDate) return "All Time"
    const formatDate = (date) =>
      new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    if (dateFilter.startDate && dateFilter.endDate)
      return `${formatDate(dateFilter.startDate)} - ${formatDate(dateFilter.endDate)}`
    if (dateFilter.startDate) return `From ${formatDate(dateFilter.startDate)}`
    if (dateFilter.endDate) return `Until ${formatDate(dateFilter.endDate)}`
    return "All Time"
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setStatusFilter("All")
    setUserFilter("All")
    setPriorityFilter("All")
    setCategoryFilter("All")
    setFrequencyFilter("All")
    setDateFilter({ startDate: null, endDate: null, filterType: "dueDate" })
  }

  const hasActiveFilters = () =>
    searchQuery ||
    statusFilter !== "All" ||
    userFilter !== "All" ||
    priorityFilter !== "All" ||
    categoryFilter !== "All" ||
    frequencyFilter !== "All" ||
    dateFilter.startDate ||
    dateFilter.endDate

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-8 relative flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1.5 text-base">
            Welcome back! Here&apos;s your team&apos;s performance at a glance.
          </p>
          {(dateFilter.startDate || dateFilter.endDate) && (
            <p className="text-sm text-primary mt-1">
              Date Range: {getDateRangeDisplay()} ({dateFilter.filterType})
            </p>
          )}
          {lastOverdueCheck && (
            <p className="text-xs text-muted-foreground/80 mt-1">
              Overdue tasks last checked: {new Date(lastOverdueCheck).toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualOverdueCheck}
            disabled={isCheckingOverdue}
            title="Check for overdue tasks"
          >
            <Clock4 className={`h-4 w-4 mr-2 ${isCheckingOverdue ? "animate-spin" : ""}`} />
            {isCheckingOverdue ? "Checking..." : "Check Overdue"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing || activitiesLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing || activitiesLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {hasActiveFilters() && (
        <div className="flex items-center gap-2 flex-wrap p-3.5 bg-accent rounded-lg border border-primary/20">
          <Filter className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-accent-foreground">Active Filters:</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 ml-auto"
            onClick={clearAllFilters}
          >
            Clear All Filters
          </Button>
        </div>
      )}

      <KPICards kpis={kpis} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 flex-grow">
        <div className="xl:col-span-2">
          <TaskDistributionChart tasks={filteredTasks} />
        </div>
        <div className="xl:col-span-1">
          <UserActivityFeed activities={activities} isLoading={activitiesLoading} error={activitiesError} />
        </div>
      </div>

      {/* Footer - Added as requested */}
      <footer className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <p>© All rights reserved 2025 KPS Automate Business</p>
          <p className="mt-2 sm:mt-0 mr-16 sm:mr-20">v 1.0.0</p>
        </div>
      </footer>

      {/* Modals will use the new Modal styling */}
      <DateFilterModal
        isOpen={isDateFilterOpen}
        onClose={() => setIsDateFilterOpen(false)}
        onApply={handleDateFilterApply}
        onClear={handleDateFilterClear}
        currentFilter={dateFilter}
      />
      <GenerateReportModal
        isOpen={isGenerateReportOpen}
        onClose={() => setIsGenerateReportOpen(false)}
        onGenerate={handleGenerateReport}
        tasksCount={filteredTasks.length}
        kpis={kpis}
      />
      <AssignTaskModal
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false)
          setEditingTask(null)
        }}
        task={editingTask}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setTaskToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        task={taskToDelete}
      />

      <FAB onClick={handleCreateTask} icon={<PlusCircle size={24} />} label="Create New Task" />
    </div>
  )
}

export default Dashboard
