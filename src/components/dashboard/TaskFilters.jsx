"use client"
import { Button } from "../../components/ui/button"
import { X } from "lucide-react"

const TaskFilters = ({
  statusFilter,
  setStatusFilter,
  userFilter,
  setUserFilter,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter,
  frequencyFilter,
  setFrequencyFilter,
  uniqueUsers,
  uniqueCategories,
  uniqueFrequencies,
  clearAllFilters,
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-700">Filter Tasks</h3>
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 px-2">
          <X className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        {/* Assigned To Filter */}
        <div>
          <label htmlFor="userFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Assigned To
          </label>
          <select
            id="userFilter"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Users</option>
            {uniqueUsers.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label htmlFor="priorityFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priorityFilter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Frequency Filter */}
        <div>
          <label htmlFor="frequencyFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Frequency
          </label>
          <select
            id="frequencyFilter"
            value={frequencyFilter}
            onChange={(e) => setFrequencyFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Frequencies</option>
            {uniqueFrequencies.map((frequency) => (
              <option key={frequency} value={frequency}>
                {frequency}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default TaskFilters
