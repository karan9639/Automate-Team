"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Plus, Search, Trash2, Edit, MoreHorizontal, CheckCircle } from "lucide-react"
import MainLayout from "../layouts/MainLayout"
import DataTable from "../components/DataTable"
import FilterDropdown from "../components/FilterDropdown"
import DateFilterTabs from "../components/DateFilterTabs"
import TaskFormModal from "../components/TaskFormModal"
import ConfirmModal from "../components/ConfirmModal"
import FAB from "../components/FAB"
import { deleteTaskLocal, updateTaskLocal } from "../store/slices/taskSlice"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"

const TaskManagement = () => {
  const dispatch = useDispatch()
  const { tasks } = useSelector((state) => state.tasks)
  const { members } = useSelector((state) => state.team)

  // State for filters and search
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("This Week")
  const [filters, setFilters] = useState({
    status: null,
    priority: null,
    assignee: null,
  })

  // State for modals
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  // Update pagination total when tasks change
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: filteredTasks.length,
    }))
  }, [tasks, filters, searchQuery, dateFilter])

  // Filter tasks based on search query and filters
  const filteredTasks = tasks.filter((task) => {
    // Search filter
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Status filter
    if (filters.status && task.status !== filters.status) {
      return false
    }

    // Priority filter
    if (filters.priority && task.priority !== filters.priority) {
      return false
    }

    // Assignee filter
    if (filters.assignee && task.assigneeId !== filters.assignee) {
      return false
    }

    // Date filter logic would go here
    // For now, we'll just return true for all date filters
    return true
  })

  // Paginated tasks
  const paginatedTasks = filteredTasks.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit,
  )

  // Handle page change
  const handlePageChange = (page) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }))
  }

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      status: null,
      priority: null,
      assignee: null,
    })
    setSearchQuery("")
  }

  // Handle add task
  const handleAddTask = () => {
    setSelectedTask(null)
    setIsTaskFormOpen(true)
  }

  // Handle edit task
  const handleEditTask = (task) => {
    setSelectedTask(task)
    setIsTaskFormOpen(true)
  }

  // Handle delete task
  const handleDeleteTask = (task) => {
    setSelectedTask(task)
    setIsDeleteModalOpen(true)
  }

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (selectedTask) {
      dispatch(deleteTaskLocal(selectedTask.id))
    }
  }

  // Handle mark as complete
  const handleMarkComplete = (task) => {
    dispatch(
      updateTaskLocal({
        id: task.id,
        status: "completed",
      }),
    )
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

  // Filter options
  const statusOptions = [
    { label: "All", value: null },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" },
    { label: "Overdue", value: "overdue" },
  ]

  const priorityOptions = [
    { label: "All", value: null },
    { label: "High", value: "high" },
    { label: "Medium", value: "medium" },
    { label: "Low", value: "low" },
  ]

  const assigneeOptions = [
    { label: "All", value: null },
    ...members.map((member) => ({
      label: member.name,
      value: member.id,
    })),
  ]

  // Table columns
  const columns = [
    {
      key: "title",
      header: "Task",
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium">{row.title}</div>
          <div className="text-xs text-gray-500 truncate max-w-xs">{row.description}</div>
        </div>
      ),
    },
    {
      key: "assignee",
      header: "Assignee",
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const statusColors = {
          pending: "bg-amber-100 text-amber-800",
          completed: "bg-green-100 text-green-800",
          overdue: "bg-red-100 text-red-800",
          "in-progress": "bg-blue-100 text-blue-800",
        }

        const statusLabels = {
          pending: "Pending",
          completed: "Completed",
          overdue: "Overdue",
          "in-progress": "In Progress",
        }

        return <Badge className={`${statusColors[row.status]}`}>{statusLabels[row.status]}</Badge>
      },
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (row) => {
        const priorityColors = {
          high: "bg-red-100 text-red-800",
          medium: "bg-amber-100 text-amber-800",
          low: "bg-green-100 text-green-800",
        }

        return (
          <Badge className={`${priorityColors[row.priority]}`}>
            {row.priority.charAt(0).toUpperCase() + row.priority.slice(1)}
          </Badge>
        )
      },
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      render: (row) => {
        const date = new Date(row.dueDate)
        return date.toLocaleDateString()
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center space-x-2">
          {row.status !== "completed" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleMarkComplete(row)
              }}
              title="Mark as Complete"
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleEditTask(row)
            }}
            title="Edit Task"
          >
            <Edit className="h-4 w-4 text-blue-500" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteTask(row)
                }}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Task Management</h1>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search tasks..."
                className="w-full sm:w-[200px] pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Button onClick={handleAddTask} className="gap-1">
              <Plus size={16} />
              <span>New Task</span>
            </Button>
          </div>
        </div>

        {/* Date Filter Tabs */}
        <DateFilterTabs options={dateFilterOptions} activeFilter={dateFilter} onFilterChange={setDateFilter} />

        {/* Filters */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            <FilterDropdown
              label="Status"
              options={statusOptions}
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
            />
            <FilterDropdown
              label="Priority"
              options={priorityOptions}
              value={filters.priority}
              onChange={(value) => handleFilterChange("priority", value)}
            />
            <FilterDropdown
              label="Assignee"
              options={assigneeOptions}
              value={filters.assignee}
              onChange={(value) => handleFilterChange("assignee", value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="px-4 py-2 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Task Table */}
        <div className="mt-6">
          <DataTable
            data={paginatedTasks}
            columns={columns}
            onRowClick={handleEditTask}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Task Form Modal */}
        <TaskFormModal isOpen={isTaskFormOpen} onClose={() => setIsTaskFormOpen(false)} task={selectedTask} />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Task"
          description="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />

        {/* Floating Action Button */}
        <FAB onClick={handleAddTask} />
      </div>
    </MainLayout>
  )
}

export default TaskManagement
