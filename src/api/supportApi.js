import API from "./axiosInstance.js"

// Support API endpoints
export const supportApi = {
  // Create support ticket
  createTicket: async (ticketData) => {
    try {
      const response = await API.post("/support/raise-ticket", ticketData);
      return response.data;
    } catch (error) {
      console.error("Create ticket API error:", error);
      throw error;
    }
  },

  // Get my tickets
  getMyTickets: async (params = {}) => {
    try {
      const response = await API.get("/support/get-user-tickets", { params });
      return response.data;
    } catch (error) {
      console.error("Get my tickets API error:", error);
      throw error;
    }
  },

  // Get all tickets (support team)
  getAllTickets: async (params = {}) => {
    try {
      const response = await API.get("/support/get-all-tickets", { params });
      return response.data;
    } catch (error) {
      console.error("Get all tickets API error:", error);
      throw error;
    }
  },

  // Get ticket by ID
  getTicketById: async (ticketId) => {
    try {
      const response = await API.get(`support/view-ticket/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error("Get ticket by ID API error:", error);
      throw error;
    }
  },

  // Update ticket status
  updateTicketStatus: async (ticketId, status) => {
    try {
      const response = await API.patch(`support/change-ticket-status/${ticketId}`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error("Update ticket status API error:", error);
      throw error;
    }
  },

  // Add ticket reply
  // addTicketReply: async (ticketId, replyData) => {
  //   try {
  //     const response = await API.post(`/support/tickets/${ticketId}/replies`, replyData)
  //     return response.data
  //   } catch (error) {
  //     console.error("Add ticket reply API error:", error)
  //     throw error
  //   }
  // },

  // Get FAQ
  //   getFAQ: async () => {
  //     try {
  //       const response = await API.get("/support/faq")
  //       return response.data
  //     } catch (error) {
  //       console.error("Get FAQ API error:", error)
  //       throw error
  //     }
  //   },
};
