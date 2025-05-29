import API from "./axiosInstance.js"

// Attendance API endpoints
export const attendanceApi = {
  // Clock in
  clockIn: async (attendanceData) => {
    try {
      const response = await API.post("/attendance/clock-in", attendanceData)
      return response.data
    } catch (error) {
      console.error("Clock in API error:", error)
      throw error
    }
  },

  // Clock out
  clockOut: async (attendanceData) => {
    try {
      const response = await API.post("/attendance/clock-out", attendanceData)
      return response.data
    } catch (error) {
      console.error("Clock out API error:", error)
      throw error
    }
  },

  // Get my attendance
  getMyAttendance: async (params = {}) => {
    try {
      const response = await API.get("/attendance/my-attendance", { params })
      return response.data
    } catch (error) {
      console.error("Get my attendance API error:", error)
      throw error
    }
  },

  // Get all attendance
  getAllAttendance: async (params = {}) => {
    try {
      const response = await API.get("/attendance/all-attendance", { params })
      return response.data
    } catch (error) {
      console.error("Get all attendance API error:", error)
      throw error
    }
  },

  // Get attendance by date range
  getAttendanceByDateRange: async (startDate, endDate, userId = null) => {
    try {
      const params = { startDate, endDate }
      if (userId) params.userId = userId

      const response = await API.get("/attendance/date-range", { params })
      return response.data
    } catch (error) {
      console.error("Get attendance by date range API error:", error)
      throw error
    }
  },

  // Update attendance
  updateAttendance: async (attendanceId, attendanceData) => {
    try {
      const response = await API.put(`/attendance/${attendanceId}`, attendanceData)
      return response.data
    } catch (error) {
      console.error("Update attendance API error:", error)
      throw error
    }
  },

  // Get attendance summary
  getAttendanceSummary: async (params = {}) => {
    try {
      const response = await API.get("/attendance/summary", { params })
      return response.data
    } catch (error) {
      console.error("Get attendance summary API error:", error)
      throw error
    }
  },
}
