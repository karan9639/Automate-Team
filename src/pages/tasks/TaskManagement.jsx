"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Button } from "../../components/ui/button"
import { PlusCircle, AlertCircle } from "lucide-react"
import AssignTaskModal from "../../components/modals/AssignTaskModal"
import TaskCard from "../../components/tasks/TaskCard"
import EmptyState from "../../components/common/EmptyState"
import { fetchTasks } from "../../store/slices/taskSlice"

const TaskManagement = () => {
  const dispatch = useDispatch()
  const { tasks, loading, error } = useSelector((state) => state.tasks || { tasks: [], loading: false, error: null })

  const [activeTab, setActiveTab] = useState("my-tasks")
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false)

  // Fetch tasks on component mount
  useEffect(() => {
    dispatch(fetchTasks())
  }, [dispatch])

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "my-tasks") {
      return task.assignees && task.assignees.includes("1") // Assuming "1" is the current user ID
    } else if (activeTab === "delegated-tasks") {
      return task.createdBy === "currentUser" && (!task.assignees || !task.assignees.includes("1"))
    }
    return true // all-tasks tab
  })

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Management</h1>
        <Button onClick={() => setIsAssignTaskModalOpen(true)} variant="green" className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Assign Task
        </Button>
      </div>

      <div className="mb-6">
        <div className="border-b">
          <nav className="flex space-x-8">
            {["my-tasks", "delegated-tasks", "all-tasks"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Error loading tasks: {error}</span>
        </div>
      )}

      {/* Task list or empty state */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          title={`No ${
            activeTab === "my-tasks" ? "Tasks" : activeTab === "delegated-tasks" ? "Delegated Tasks" : "Tasks"
          } Found`}
          description={
            activeTab === "my-tasks"
              ? "You don't have any tasks assigned to you."
              : activeTab === "delegated-tasks"
                ? "You haven't delegated any tasks yet."
                : "There are no tasks in the system."
          }
          className="py-16"
        />
      )}

      {/* Assign Task Modal */}
      <AssignTaskModal isOpen={isAssignTaskModalOpen} onClose={() => setIsAssignTaskModalOpen(false)} task={null} />
    </div>
  )
}

export default TaskManagement
