"use client"

import { Button } from "../../components/ui/button"

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, task }) => {
  if (!isOpen || !task) return null

  const handleConfirm = async () => {
    try {
      await onConfirm()
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirm Delete</h2>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete the task <span className="font-medium">"{task.name}"</span>? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Delete Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal
