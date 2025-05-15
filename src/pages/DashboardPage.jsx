"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useSelector } from "react-redux"
import { Search, Plus, CheckCircle, Clock, AlertCircle, PlayCircle, XCircle } from "lucide-react"
import MainLayout from "../layouts/MainLayout"
import StatusCard from "../components/StatusCard"
import FilterDropdown from "../components/FilterDropdown"
import TaskTable from "../components/TaskTable"
import DateFilterTabs from "../components/DateFilterTabs"
import ViewTabs from "../components/ViewTabs"

const DashboardPage = () => {
  // State for active filters
  const [dateFilter, setDateFilter] = useState("This Week")
  const [activeView, setActiveView] = useState("Employee Wise")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    assignedTo: null,
    category: null,
    frequency: null,
  })

  // Get tasks from Redux store
  const { tasks } = useSelector((state) => state.tasks)

  // Calculate task counts by status
  const taskCounts = {
    overdue: tasks.filter((task) => task.status === "overdue").length,
    pending: tasks.filter((task) => task.status === "pending").length,
    inProgress: tasks.filter((task) => task.status === "in-progress").length,
    completed: tasks.filter((task) => task.status === "completed").length,
    inTime: tasks.filter((task) => task.status === "in-time").length,
    delayed: tasks.filter((task) => task.status === "delayed").length,
  }

  // Status cards configuration
  const statusCards = [
    {
      title: "Overdue",
      count: taskCounts.overdue,
      icon: AlertCircle,
      color: "red",
      bgColor: "bg-red-100",
      textColor: "text-red-700",
    },
    {
      title: "Pending",
      count: taskCounts.pending,
      icon: Clock,
      color: "orange",
      bgColor: "bg-orange-100",
      textColor: "text-orange-700",
    },
    {
      title: "In Progress",
      count: taskCounts.inProgress,
      icon: PlayCircle,
      color: "amber",
      bgColor: "bg-amber-100",
      textColor: "text-amber-700",
    },
    {
      title: "Completed",
      count: taskCounts.completed,
      icon: CheckCircle,
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
    },
    {
      title: "In Time",
      count: taskCounts.inTime,
      icon: Clock,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
    },
    {
      title: "Delayed",
      count: taskCounts.delayed,
      icon: XCircle,
      color: "red",
      bgColor: "bg-red-100",
      textColor: "text-red-700",
    },
  ]

  // Filter options
  const filterOptions = {
    assignedTo: [
      { label: "All", value: null },
      { label: "Karan", value: "1" },
      { label: "Prashant Tyagi", value: "2" },
      { label: "Rahul", value: "3" },
    ],
    category: [
      { label: "All", value: null },
      { label: "Development", value: "development" },
      { label: "Design", value: "design" },
      { label: "Marketing", value: "marketing" },
    ],
    frequency: [
      { label: "All", value: null },
      { label: "Daily", value: "daily" },
      { label: "Weekly", value: "weekly" },
      { label: "Monthly", value: "monthly" },
    ],
  }

  // Date filter options
  const dateFilterOptions = [
    "Today",
    "Yesterday",
    "This Week",
    "Last Week",
    "This Month",
    "Last Month",
    "This Year",
    "All Time",
    "Custom",
  ]

  // View options
  const viewOptions = [
    { id: "employee-wise", label: "Employee Wise", icon: "users" },
    { id: "category-wise", label: "Category Wise", icon: "tag" },
    { id: "my-report", label: "My Report", icon: "file-text" },
    { id: "delegated", label: "Delegated", icon: "send" },
    { id: "daily-report", label: "Daily Report", icon: "calendar" },
    { id: "monthly-report", label: "Monthly Report", icon: "bar-chart" },
    { id: "overdue-report", label: "OverDue Report", icon: "alert-circle" },
  ]

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      assignedTo: null,
      category: null,
      frequency: null,
    })
    setSearchQuery("")
  }

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        document.getElementById("search-input").focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        {/* Date Filter Tabs */}
        <DateFilterTabs options={dateFilterOptions} activeFilter={dateFilter} onFilterChange={setDateFilter} />

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          {statusCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <StatusCard
                title={card.title}
                count={card.count}
                icon={card.icon}
                bgColor={card.bgColor}
                textColor={card.textColor}
              />
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            <FilterDropdown
              label="Assigned To"
              options={filterOptions.assignedTo}
              value={filters.assignedTo}
              onChange={(value) => handleFilterChange("assignedTo", value)}
            />
            <FilterDropdown
              label="Category"
              options={filterOptions.category}
              value={filters.category}
              onChange={(value) => handleFilterChange("category", value)}
            />
            <FilterDropdown
              label="Frequency"
              options={filterOptions.frequency}
              value={filters.frequency}
              onChange={(value) => handleFilterChange("frequency", value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="search-input"
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full h-10 pl-3 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <ViewTabs options={viewOptions} activeView={activeView} onViewChange={setActiveView} />

        {/* Task Table */}
        <div className="mt-4">
          <TaskTable view={activeView} dateFilter={dateFilter} searchQuery={searchQuery} filters={filters} />
        </div>

        {/* Floating Action Button */}
        <motion.button
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus size={24} />
        </motion.button>
      </div>
    </MainLayout>
  )
}

export default DashboardPage
