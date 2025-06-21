"use client"

import { useState, useEffect } from "react"
import { X, AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { useSelector } from "react-redux"
import { selectAllTeamMembers } from "../../store/slices/teamSlice"
import { reassignAllTask } from "../../api/tasksApi"
import { userApi } from "../../api/userApi"
import { useAuth } from "../../contexts/AuthContext" // Import to get current user info

const ReassignAllTasksModal = ({ isOpen, onClose, selectedMember, onConfirm }) => {
  const [selectedUserId, setSelectedUserId] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingMembers, setIsFetchingMembers] = useState(false)
  const [apiTeamMembers, setApiTeamMembers] = useState([])
  const [fetchError, setFetchError] = useState(null)

  // Get current user info for creatorName
  const { user } = useAuth()

  // Fallback to Redux state if API fails
  const reduxTeamMembers = useSelector(selectAllTeamMembers) || []

  const memberData = selectedMember?.newMember || selectedMember
  const memberEmail = memberData?.email || ""

  // Fetch team members from API using userApi
  const fetchTeamMembersFromAPI = async () => {
    setIsFetchingMembers(true)
    setFetchError(null)
    try {
      console.log("Fetching team members from userApi...")
      const response = await userApi.fetchAllTeamMembers()

      console.log("Team members API response:", response)

      // Extract team members from userApi response structure
      let members = []
      if (response?.data?.success && response?.data?.data) {
        // Handle successful response with data wrapper
        if (Array.isArray(response.data.data)) {
          members = response.data.data
        } else if (response.data.data.teamMembers && Array.isArray(response.data.data.teamMembers)) {
          members = response.data.data.teamMembers
        } else if (response.data.data.members && Array.isArray(response.data.data.members)) {
          members = response.data.data.members
        }
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        // Direct array in data.data
        members = response.data.data
      } else if (response?.data && Array.isArray(response.data)) {
        // Direct array in data
        members = response.data
      }

      console.log("Extracted team members:", members)
      setApiTeamMembers(members)

      if (members.length === 0) {
        console.warn("No team members found in API response")
        setFetchError("No team members found")
      }
    } catch (error) {
      console.error("Error fetching team members:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch team members"
      setFetchError(errorMessage)
      // Don't show toast error here, we'll fall back to Redux state
    } finally {
      setIsFetchingMembers(false)
    }
  }

  // Use API members if available, otherwise fall back to Redux
  const teamMembers = apiTeamMembers.length > 0 ? apiTeamMembers : reduxTeamMembers

  useEffect(() => {
    if (isOpen) {
      setSelectedUserId("")
      setConfirmEmail("")
      setApiTeamMembers([])
      setFetchError(null)

      // Fetch team members when modal opens
      fetchTeamMembersFromAPI()
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
      // Get creator name from current user
      const creatorName = user?.name || user?.fullname || user?.email || "Unknown User"

      // Prepare data for backend API with required creatorName field
      const reassignData = {
        newTeamMemberToWhichTaskAssignId: selectedUserId,
        confirmEmail: confirmEmail,
        creatorName: creatorName, // Add the missing creatorName field
      }

      console.log("Sending reassign data:", reassignData)

      // Call the reassign API
      const response = await reassignAllTask(reassignData)

      console.log("Reassign API response:", response)

      // Call the parent onConfirm if provided (for additional handling)
      if (onConfirm) {
        await onConfirm(selectedMember, selectedUserId)
      }

      onClose()
      toast.success("Tasks reassignment initiated successfully")
    } catch (error) {
      console.error("Error reassigning tasks:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to reassign tasks"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetryFetch = () => {
    fetchTeamMembersFromAPI()
  }

  // Filter out the current member from available options
  const availableMembers = teamMembers.filter((member) => {
    // Handle different member data structures
    const memberInfo = member.newMember || member
    const currentMemberInfo = selectedMember?.newMember || selectedMember

    // Compare using _id or id
    const memberId = memberInfo._id || memberInfo.id
    const currentMemberId = currentMemberInfo?._id || currentMemberInfo?.id

    return memberId !== currentMemberId
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
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select User</label>
              {isFetchingMembers && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Loader2 size={12} className="animate-spin" />
                  Loading...
                </div>
              )}
            </div>

            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              disabled={isFetchingMembers}
            >
              <option value="">{isFetchingMembers ? "Loading team members..." : "Reassign To"}</option>
              {availableMembers.map((member) => {
                const memberInfo = member.newMember || member
                const memberId = memberInfo._id || memberInfo.id
                const memberName = memberInfo.fullname || memberInfo.name || "Unknown"

                return (
                  <option key={memberId} value={memberId}>
                    {memberName}
                  </option>
                )
              })}
            </select>

            {/* Error state with retry option */}
            {fetchError && apiTeamMembers.length === 0 && (
              <div className="text-xs text-red-600 dark:text-red-400 flex items-center justify-between">
                <span>Error: {fetchError}</span>
                <button
                  type="button"
                  onClick={handleRetryFetch}
                  className="text-blue-600 hover:text-blue-800 underline"
                  disabled={isFetchingMembers}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Fallback notice */}
            {fetchError && reduxTeamMembers.length > 0 && apiTeamMembers.length === 0 && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400">
                Using cached team members (API unavailable)
              </div>
            )}

            {/* Members count info */}
            {!isFetchingMembers && availableMembers.length > 0 && (
              <div className="text-xs text-gray-500">
                {availableMembers.length} team member{availableMembers.length !== 1 ? "s" : ""} available
              </div>
            )}

            {/* No members available */}
            {!isFetchingMembers && availableMembers.length === 0 && !fetchError && (
              <div className="text-xs text-red-600 dark:text-red-400">No team members available for reassignment</div>
            )}
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
              disabled={
                isLoading ||
                !selectedUserId ||
                confirmEmail !== memberEmail ||
                isFetchingMembers ||
                availableMembers.length === 0
              }
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
