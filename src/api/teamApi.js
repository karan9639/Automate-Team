import API from "./axiosInstance.js"

// Team API endpoints
export const teamApi = {
  // Get team members
  getTeamMembers: async (params = {}) => {
    try {
      const response = await API.get("/team/members", { params })
      return response.data
    } catch (error) {
      console.error("Get team members API error:", error)
      throw error
    }
  },

  // Add team member
  addTeamMember: async (memberData) => {
    try {
      const response = await API.post("/team/members", memberData)
      return response.data
    } catch (error) {
      console.error("Add team member API error:", error)
      throw error
    }
  },

  // Update team member
  updateTeamMember: async (memberId, memberData) => {
    try {
      const response = await API.put(`/team/members/${memberId}`, memberData)
      return response.data
    } catch (error) {
      console.error("Update team member API error:", error)
      throw error
    }
  },

  // Remove team member
  removeTeamMember: async (memberId) => {
    try {
      const response = await API.delete(`/team/members/${memberId}`)
      return response.data
    } catch (error) {
      console.error("Remove team member API error:", error)
      throw error
    }
  },

  // Get team statistics
  getTeamStats: async () => {
    try {
      const response = await API.get("/team/stats")
      return response.data
    } catch (error) {
      console.error("Get team stats API error:", error)
      throw error
    }
  },

  // Invite team member
  inviteTeamMember: async (inviteData) => {
    try {
      const response = await API.post("/team/invite", inviteData)
      return response.data
    } catch (error) {
      console.error("Invite team member API error:", error)
      throw error
    }
  },

  // Get team roles
  getTeamRoles: async () => {
    try {
      const response = await API.get("/team/roles")
      return response.data
    } catch (error) {
      console.error("Get team roles API error:", error)
      throw error
    }
  },

  // Update member role
  updateMemberRole: async (memberId, roleData) => {
    try {
      const response = await API.patch(`/team/members/${memberId}/role`, roleData)
      return response.data
    } catch (error) {
      console.error("Update member role API error:", error)
      throw error
    }
  },
}
