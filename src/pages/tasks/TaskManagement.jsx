"use client"

import { useState } from "react"
import PropTypes from "prop-types"

// Mock data for tasks
const mockTasks = [
  { id: 1, title: "Complete project proposal", status: "In Progress", dueDate: "2023-06-15", priority: "High" },
  { id: 2, title: "Review client feedback", status: "Pending", dueDate: "2023-06-18", priority: "Medium" },
  { id: 3, title: "Update documentation", status: "Completed", dueDate: "2023-06-10", priority: "Low" },
  { id: 4, title: "Schedule team meeting", status: "In Progress", dueDate: "2023-06-20", priority: "Medium" },
  { id: 5, title: "Prepare presentation", status: "Pending", dueDate: "2023-06-25", priority: "High" },
]

// Task Card Component
const TaskCard = ({ task }) => {
  // Status color mapping
  const statusColors = {
    Completed: "bg-green-100 text-green-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Pending: "bg-yellow-100 text-yellow-800",
  }

  // Priority color mapping
  const priorityColors = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-orange-100 text-orange-800",
    Low: "bg-gray-100 text-gray-800",
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
      <div className="flex justify-between items-center mb-2">
        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[task.status]}`}>{task.status}</span>
        <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[task.priority]}`}>{task.priority}</span>
      </div>
      <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
    </div>
  )
}

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    dueDate: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
  }).isRequired,
}

// Main Task Management Component
const TaskManagement = () => {
  const [tasks] = useState(mockTasks)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  // Filter tasks based on search term and status filter
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Task Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Add New Task
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No tasks found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskManagement
