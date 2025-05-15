"use client"

import { useState } from "react"
import { X } from "lucide-react"
import ChevronRight from "./icons/ChevronRight"

const ExportTasksModal = ({ isOpen, onClose }) => {
  const [filters, setFilters] = useState({
    timeframe: "This Month",
    assignedTo: "",
    assignedBy: "",
    taskType: "",
  })

  const handleExport = () => {
    // TODO: Replace with real API call
    console.log("Exporting tasks with filters:", filters)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Export Tasks</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <div className="relative">
                <select
                  value={filters.timeframe}
                  onChange={(e) => setFilters({ ...filters, timeframe: e.target.value })}
                  className="appearance-none w-full bg-gray-700 border border-gray-600 rounded p-2 pr-8 text-white"
                >
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>This Week</option>
                  <option>Last Week</option>
                  <option>Custom Range</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronRight className="h-4 w-4 text-gray-400 transform rotate-90" />
                </div>
              </div>
            </div>

            <div>
              <div className="relative">
                <select
                  value={filters.assignedTo}
                  onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                  className="appearance-none w-full bg-gray-700 border border-gray-600 rounded p-2 pr-8 text-white"
                >
                  <option value="">Assigned To</option>
                  <option value="user1">User 1</option>
                  <option value="user2">User 2</option>
                  <option value="user3">User 3</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronRight className="h-4 w-4 text-gray-400 transform rotate-90" />
                </div>
              </div>
            </div>

            <div>
              <div className="relative">
                <select
                  value={filters.assignedBy}
                  onChange={(e) => setFilters({ ...filters, assignedBy: e.target.value })}
                  className="appearance-none w-full bg-gray-700 border border-gray-600 rounded p-2 pr-8 text-white"
                >
                  <option value="">Assigned By</option>
                  <option value="user1">User 1</option>
                  <option value="user2">User 2</option>
                  <option value="user3">User 3</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronRight className="h-4 w-4 text-gray-400 transform rotate-90" />
                </div>
              </div>
            </div>

            <div>
              <div className="relative">
                <select
                  value={filters.taskType}
                  onChange={(e) => setFilters({ ...filters, taskType: e.target.value })}
                  className="appearance-none w-full bg-gray-700 border border-gray-600 rounded p-2 pr-8 text-white"
                >
                  <option value="">Task Type</option>
                  <option value="general">General</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                  <option value="support">Customer Support</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronRight className="h-4 w-4 text-gray-400 transform rotate-90" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleExport}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Export Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportTasksModal
