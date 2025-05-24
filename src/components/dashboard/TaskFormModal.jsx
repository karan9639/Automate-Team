"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"

const TaskFormModal = ({ isOpen, onClose, onSubmit, task, users }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueDate: "",
    assignedUserId: "",
    status: "To Do",
    priority: "Medium",
    category: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form data when editing a task
  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || "",
        description: task.description || "",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        assignedUserId: task.assignedUserId || "",
        status: task.status || "To Do",
        priority: task.priority || "Medium",
        category: task.category || "",
      })
    } else {
      // Reset form for new task
      setFormData({
        name: "",
        description: "",
        dueDate: "",
        assignedUserId: "",
        status: "To Do",
        priority: "Medium",
        category: "",
      })
    }
    setErrors({})
  }, [task, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = "Task name is required"
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required"
    }
    if (!formData.assignedUserId) {
      newErrors.assignedUserId = "Assigned user is required"
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await onSubmit(formData)
      if (result.success) {
        onClose()
      } else {
        setErrors({ submit: result.error || "Failed to save task" })
      }
    } catch (error) {
      setErrors({ submit: error.message || "An unexpected error occurred" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{task ? "Edit Task" : "Create New Task"}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Task Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                className={errors.dueDate ? "border-red-500" : ""}
              />
              {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
            </div>

            <div>
              <label htmlFor="assignedUserId" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To <span className="text-red-500">*</span>
              </label>
              <select
                id="assignedUserId"
                name="assignedUserId"
                value={formData.assignedUserId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.assignedUserId ? "border-red-500" : "border-gray-300"
                } rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              {errors.assignedUserId && <p className="text-red-500 text-xs mt-1">{errors.assignedUserId}</p>}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Development, Design, Marketing"
              />
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {errors.submit}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : task ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TaskFormModal
