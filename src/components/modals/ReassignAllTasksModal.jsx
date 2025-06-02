"use client"

import { useState, useEffect } from "react"
import { X, AlertTriangle } from "lucide-react"
import { toast } from "react-hot-toast"
import { useSelector } from "react-redux"
import { selectAllTeamMembers } from "../../store/slices/teamSlice"

const ReassignAllTasksModal = ({ isOpen, onClose, selectedMember, onConfirm }) => {
  const [selectedUserId, setSelectedUserId] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const teamMembers = useSelector(selectAllTeamMembers) || []

  const memberData = selectedMember?.newMember || selectedMember
  const memberEmail = memberData?.email || ""

  useEffect(() => {
    if (isOpen) {
      setSelectedUserId("")
      setConfirmEmail("")
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (confirmEmail !== memberEmail) {
      toast.error("Email confirmation does not match")
      return
    }

    if (!selectedUserId) {
      toast.error("Please select a user to reassign tasks to")
      return
    }

    setIsLoading(true)
    try {
      await onConfirm(selectedMember, selectedUserId)
      onClose()
      toast.success("Tasks reassignment initiated successfully")
    } catch (error) {
      console.error("Error reassigning tasks:", error)
      toast.error("Failed to reassign tasks")
    } finally {
      setIsLoading(false)
    }
  }

  const availableMembers = teamMembers.filter((member) => {
    const memberInfo = member.newMember || member
    const currentMemberInfo = selectedMember?.newMember || selectedMember
    return memberInfo._id !== currentMemberInfo?._id
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reassign All Tasks</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to Reassign all tasks for{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{memberEmail}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              All tasks for this person will be Reassigned to the selected person.
            </p>
            <p className="text-red-600 dark:text-red-400 text-sm">
              <span className="font-semibold">Note:</span> All tasks will be queued for reassignment. You can check the
              user profile after a short while.
            </p>
          </div>

          {/* Warning Banner */}
          <div className="bg-orange-100 border border-orange-300 text-orange-800 px-4 py-3 rounded-md flex items-center gap-2">
            <AlertTriangle size={20} />
            <span className="font-medium">Warning: Please be certain.</span>
          </div>

          {/* User Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select User</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">Reassign To</option>
              {availableMembers.map((member) => {
                const memberInfo = member.newMember || member
                return (
                  <option key={memberInfo._id} value={memberInfo._id}>
                    {memberInfo.fullname} ({memberInfo.email})
                  </option>
                )
              })}
            </select>
          </div>

          {/* Email Confirmation */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter the User Email <span className="font-semibold">{memberEmail}</span> to continue:
            </label>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="User Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedUserId || confirmEmail !== memberEmail}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Reassigning..." : "Reassign Tasks"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReassignAllTasksModal
