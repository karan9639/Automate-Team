import API from "./axiosInstance.js"

const USER_BASE_URL = "/user" // This will be appended to VITE_PUBLIC_API_BASE_URL

export const userApi = {
  register: async (userData) => {
    // userData: { fullname, email, whatsappNumber, password, confirmPassword }
    return API.post(`${USER_BASE_URL}/register`, userData)
  },

  login: async (credentials) => {
    // credentials: { email, password }
    return API.post(`${USER_BASE_URL}/login`, credentials)
  },

  changePassword: async (passwordData) => {
    // passwordData: { oldPassword, newPassword, confirmNewPassword }
    return API.post(`${USER_BASE_URL}/change-password`, passwordData)
  },

  logout: async () => {
    return API.post(`${USER_BASE_URL}/logout`)
  },

  refreshAccessToken: async () => {
    return API.post(`${USER_BASE_URL}/refresh-access-token`)
  },

  addNewMember: async (memberData) => {
    // memberData: { fullname, email, whatsappNumber, password, role (optional) }
    return API.post(`${USER_BASE_URL}/add-new-member`, memberData)
  },

  fetchReportingManagers: async () => {
    return API.get(`${USER_BASE_URL}/fetch-reporting-managers`)
  },

  fetchAllTeamMembers: async (params = {}) => {
    return API.get(`${USER_BASE_URL}/fetch-all-team-members`, { params })
  },

  deleteMember: async (memberId) => {
    return API.delete(`${USER_BASE_URL}/delete-member/${memberId}`)
  },

  sendOtp: async (otpSendData) => {
    // otpSendData: { email } or { whatsappNumber }
    return API.post(`${USER_BASE_URL}/send-otp`, otpSendData)
  },

  verifyOtp: async (otpVerifyData) => {
    // otpVerifyData: { email (or whatsappNumber), otp }
    return API.post(`${USER_BASE_URL}/verify-otp`, otpVerifyData)
  },
}
