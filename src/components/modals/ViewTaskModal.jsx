"use client"
import { X, Calendar, User, Tag, AlertCircle, Clock, FileText } from "lucide-react"
import { formatDate } from "../../utils/helpers"

const ViewTaskModal = ({ isOpen, onClose, task, loading, error }) => {
  if (!isOpen) return null

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in-progress":
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getFrequencyDisplay = (frequency) => {
    if (!frequency) return "One-time"

    if (frequency.type === "weekly" && frequency.details?.daysOfWeek?.length > 0) {
      const days = frequency.details.daysOfWeek.map((d) => d.day).join(", ")
      return `Weekly (${days})`
    }

    return frequency.type || "One-time"
  }

  // Handle different API response field names
  const taskTitle = task?.taskTitle || task?.title || "Untitled Task"
  const taskDescription = task?.taskDescription || task?.description || ""
  const taskStatus = task?.status || task?.taskStatus || "pending"
  const taskPriority = task?.taskPriority || task?.priority || "medium"
  const taskCategory = task?.taskCategory || task?.category || ""
  const taskDueDate = task?.taskDueDate || task?.dueDate || task?.due_date
  const taskAssignedTo = task?.taskAssignedTo || task?.assignedTo || "Not assigned"
  const taskCreatedBy = task?.taskCreatedBy || task?.createdBy || "Unknown"
  const taskFrequency = task?.taskFrequency || task?.frequency

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? "" : "hidden"}`}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      {/* Modal */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Task Details</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              <p className="ml-3 text-gray-600">Loading task details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                <AlertCircle className="h-8 w-8" />
              </div>
              <p className="text-red-600 font-medium">Error loading task details</p>
              <p className="text-gray-500 mt-2">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          ) : task ? (
            <div className="space-y-6">
              {/* Task Header */}
              <div className="border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{taskTitle}</h1>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(taskPriority)}`}>
                    <span className="flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {taskPriority.charAt(0).toUpperCase() + taskPriority.slice(1)} Priority
                    </span>
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(taskStatus)}`}>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {taskStatus.charAt(0).toUpperCase() + taskStatus.slice(1)}
                    </span>
                  </span>
                  {taskCategory && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                      <span className="flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        {taskCategory}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Task Description */}
              {taskDescription && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="flex items-center text-lg font-medium mb-2">
                    <FileText className="h-5 w-5 mr-2" />
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{taskDescription}</p>
                </div>
              )}

              {/* Task Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assignment Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="flex items-center text-lg font-medium mb-4">
                    <User className="h-5 w-5 mr-2" />
                    Assignment Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Assigned To</label>
                      <p className="text-gray-900">{taskAssignedTo.fullname}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created By</label>
                      <p className="text-gray-900">{taskCreatedBy.fullname}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Frequency</label>
                      <p className="text-gray-900">{getFrequencyDisplay(taskFrequency)}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="flex items-center text-lg font-medium mb-4">
                    <Calendar className="h-5 w-5 mr-2" />
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Due Date</label>
                      <p className="text-gray-900">{taskDueDate ? formatDate(taskDueDate) : "No due date"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created</label>
                      <p className="text-gray-900">{task.createdAt ? formatDate(task.createdAt) : "Unknown"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-gray-900">{task.updatedAt ? formatDate(task.updatedAt) : "Unknown"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Only Close button */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Task not found</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ViewTaskModal
