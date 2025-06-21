import API from "./axiosInstance.js";

const USER_BASE_URL = "user"; // Removed leading slash

export const userApi = {
  register: async (userData) => {
    // userData: { fullname, email, whatsappNumber, password, confirmPassword }
    return API.post(`${USER_BASE_URL}/register`, userData);
  },

  login: async (credentials) => {
    // credentials: { email, password }
    return API.post(`${USER_BASE_URL}/login`, credentials);
  },

  changePassword: async (data) => {
    // passwordData: { oldPassword, newPassword, confirmNewPassword }
    return API.post(`${USER_BASE_URL}/change-password`, data);
  },

  logout: async () => {
    return API.post(`${USER_BASE_URL}/logout`);
  },

  refreshAccessToken: async () => {
    return API.post(`${USER_BASE_URL}/refresh-access-token`);
  },

  addNewMember: async (memberData) => {
    // memberData: { fullname, email, whatsappNumber, password, role (optional) }
    return API.post(`${USER_BASE_URL}/add-new-member`, memberData);
  },

  fetchReportingManagers: async () => {
    return API.get(`${USER_BASE_URL}/fetch-reporting-managers`);
  },

  fetchAllTeamMembers: async (params = {}) => {
    return API.get(`${USER_BASE_URL}/fetch-all-team-members`, { params });
  },

  deleteMember: async (memberId) => {
    return API.delete(`${USER_BASE_URL}/delete-member/${memberId}`);
  },

  sendOtp: async (otpSendData) => {
    // otpSendData: { email } or { whatsappNumber }
    return API.post(`${USER_BASE_URL}/send-otp`, otpSendData);
  },

  verifyOtp: async (otpVerifyData) => {
    // otpVerifyData is expected to be an object like { email: "user@example.com", otp: "1234" }

    const otpString = otpVerifyData.otp;
    let otpAsNumber;

    if (typeof otpString === "string" && /^\d+$/.test(otpString)) {
      otpAsNumber = Number.parseInt(otpString, 10);
    } else if (typeof otpString === "number") {
      otpAsNumber = otpString; // Already a number
    } else {
      // Handle cases where OTP might not be a numeric string or already a number
      console.error("Invalid OTP format received for parsing:", otpString);
      // You might want to throw an error or return a promise rejection here
      // For now, let's proceed with NaN which will likely fail backend validation
      // and provide a clear signal.
      otpAsNumber = Number.NaN;
    }
    // Backend expects 'incomingOTP' field name
    const payload = {
      incomingEmail: otpVerifyData.email,
      incomingOTP: otpAsNumber, // Changed from 'otp' to 'incomingOTP'
    };

    console.log("Sending OTP verification with payload:", payload);
    return API.post(`${USER_BASE_URL}/verify-otp`, payload);
  },

  updateUserProfile: async (profileData) => {
    // profileData should contain fields like:
    // { fullname, whatsappNumber, bio, department, designation, location }
    return API.put(`${USER_BASE_URL}/edit-profile`, profileData);
  },

  deleteMyAccount: async (otp) => {
    // The backend needs the OTP to verify the deletion request.
    // The user's identity is determined by the JWT token sent in the headers.
    // The backend expects the OTP as a number.
    const payload = { incomingOTP: Number(otp) };
    return API.delete(`${USER_BASE_URL}/delete-my-account`, { data: payload });
  },

  fetchActivities: async (params = {}) => {
    return API.get(`${USER_BASE_URL}/activities`, { params });
  },
};
