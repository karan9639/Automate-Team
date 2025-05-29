import API from "./axiosInstance.js"

// Leave API endpoints
export const leaveApi = {
  // Apply for leave
  applyLeave: async (leaveData) => {
    try {
      const response = await API.post("/leave/apply", leaveData)
      return response.data
    } catch (error) {
      console.error("Apply leave API error:", error)
      throw error
    }
  },

  // Get my leaves
  getMyLeaves: async (params = {}) => {
    try {
      const response = await API.get("/leave/my-leaves", { params })
      return response.data
    } catch (error) {
      console.error("Get my leaves API error:", error)
      throw error
    }
  },

  // Get all leaves
  getAllLeaves: async (params = {}) => {
    try {
      const response = await API.get("/leave/all-leaves", { params })
      return response.data
    } catch (error) {
      console.error("Get all leaves API error:", error)
      throw error
    }
  },

  // Get pending approvals
  getPendingApprovals: async (params = {}) => {
    try {
      const response = await API.get("/leave/pending-approvals", { params })
      return response.data
    } catch (error) {
      console.error("Get pending approvals API error:", error)
      throw error
    }
  },

  // Approve/Reject leave
  updateLeaveStatus: async (leaveId, status, comments = "") => {
    try {
      const response = await API.patch(`/leave/${leaveId}/status`, {
        status,
        comments,
      })
      return response.data
    } catch (error) {
      console.error("Update leave status API error:", error)
      throw error
    }
  },

  // Cancel leave
  cancelLeave: async (leaveId) => {
    try {
      const response = await API.delete(`/leave/${leaveId}`)
      return response.data
    } catch (error) {
      console.error("Cancel leave API error:", error)
      throw error
    }
  },

  // Get leave balance
  getLeaveBalance: async (userId = null) => {
    try {
      const params = userId ? { userId } : {}
      const response = await API.get("/leave/balance", { params })
      return response.data
    } catch (error) {
      console.error("Get leave balance API error:", error)
      throw error
    }
  },

  // Get leave types
  getLeaveTypes: async () => {
    try {
      const response = await API.get("/leave/types")
      return response.data
    } catch (error) {
      console.error("Get leave types API error:", error)
      throw error
    }
  },
}
