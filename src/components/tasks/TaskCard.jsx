"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { MoreHorizontal, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { formatDate } from "../../utils/helpers"
import { updateTask } from "../../store/slices/taskSlice"

const TaskCard = ({ task }) => {
  const dispatch = useDispatch()
  const [showActions, setShowActions] = useState(false)

  const handleStatusChange = (newStatus) => {
    dispatch(
      updateTask({
        id: task.id,
        task: { ...task, status: newStatus },
      }),
    )
    setShowActions(false)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 mr-1" />
      case "in-progress":
        return <Clock className="h-4 w-4 mr-1" />
      case "pending":
        return <Clock className="h-4 w-4 mr-1" />
      case "overdue":
        return <AlertCircle className="h-4 w-4 mr-1" />
      default:
        return null
    }
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-lg">{task.title}</h3>
        <div className="relative">
          <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={() => setShowActions(!showActions)}>
            <MoreHorizontal className="h-5 w-5" />
          </Button>

          {showActions && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => handleStatusChange("in-progress")}
                >
                  Mark as In Progress
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => handleStatusChange("completed")}
                >
                  Mark as Completed
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => handleStatusChange("pending")}
                >
                  Mark as Pending
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {task.description && <p className="text-gray-600 text-sm mb-3">{task.description}</p>}

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="outline" className={getPriorityColor(task.priority)}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
        </Badge>

        <Badge variant="outline" className={getStatusColor(task.status)}>
          <span className="flex items-center">
            {getStatusIcon(task.status)}
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
        </Badge>

        {task.category && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {task.category}
          </Badge>
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          <span>Due: {formatDate(task.dueDate)}</span>
        </div>

        <div className="flex -space-x-2">
          {task.assignees &&
            task.assignees.map((assignee, index) => (
              <div
                key={index}
                className="h-6 w-6 rounded-full bg-gray-300 border border-white flex items-center justify-center text-xs"
                title={`Assignee ${assignee}`}
              >
                {assignee.charAt(0).toUpperCase()}
              </div>
            ))}
        </div>
      </div>
    </Card>
  )
}

export default TaskCard
