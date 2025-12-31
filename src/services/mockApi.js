// Mock API service that simulates backend API calls

const mockApi = {
  // Simulate GET request
  get: async (url, config = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Handle auth/me endpoint
    if (url === "/auth/me") {
      return {
        data: {
          isAuthenticated: true,
        },
      };
    }

    return {
      data: {},
      status: 200,
      config,
    };
  },

  // Simulate POST request
  post: async (url, data, config = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Handle login endpoint
    if (url === "/auth/login") {
      if (data.email === "admin@example.com" && data.password === "password") {
        return {
          data: {
            token: "mock-jwt-token-12345",
            user: {
              id: 1,
              name: "Admin User",
              email: "admin@example.com",
              role: "admin",
            },
          },
          status: 200,
        };
      } else {
        throw {
          response: {
            data: {
              message: "Invalid credentials",
            },
            status: 401,
          },
        };
      }
    }

    // Handle logout endpoint
    if (url === "/auth/logout") {
      return {
        data: {
          message: "Logged out successfully",
        },
        status: 200,
      };
    }

    // Handle register endpoint
    if (url === "/auth/register") {
      return {
        data: {
          token: "mock-jwt-token-67890",
          user: {
            id: 2,
            name: data.name,
            email: data.email,
            role: "user",
          },
        },
        status: 201,
      };
    }

    // Handle password reset endpoints
    if (url === "/auth/forgot-password" || url === "/auth/reset-password") {
      return {
        data: {
          message: "Success",
        },
        status: 200,
      };
    }

    return {
      data: {},
      status: 200,
      config,
    };
  },

  // Simulate PUT request
  put: async (url, data, config = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      data: {},
      status: 200,
      config,
    };
  },

  // Simulate DELETE request
  delete: async (url, config = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      data: {},
      status: 200,
      config,
    };
  },
};

// Mock API for Meeting Data
export const fetchMeetingData = async (meetingId) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock meeting data
  const meetings = {
    1: {
      id: 1,
      title: "Q1 Product Strategy Meeting",
      date: "15/01/2025",
      type: "Online",
      department: "IT",
      createdBy: "Rajesh Kumar",
      totalMembers: [1, 2, 3],
      members: [1, 2, 3, 4, 5],
      description: [
        "Review Q1 objectives and key results",
        "Discuss product roadmap for next quarter",
        "Analyze customer feedback and feature requests",
        "Assign action items to team members",
      ],
    },
    2: {
      id: 2,
      title: "HR Policy Update Session",
      date: "20/01/2025",
      type: "Offline",
      department: "HR",
      createdBy: "Priya Sharma",
      totalMembers: [2, 5],
      members: [2, 5, 6, 7],
      description:
        "1. Introduction to new leave policy\n2. Work from home guidelines\n3. Performance review process changes\n4. Q&A session with employees",
    },
    3: {
      id: 3,
      title: "Sales Team Quarterly Review",
      date: "25/01/2025",
      type: "Online",
      department: "Sales",
      createdBy: "Amit Patel",
      totalMembers: [3, 4, 6],
      members: [3, 4, 6, 8],
      description: [
        "Review sales targets vs achievements",
        "Discuss new sales strategies",
        "Customer acquisition analysis",
        "Plan for next quarter targets",
        "Team recognition and rewards",
      ],
    },
  };

  return meetings[meetingId] || null;
};

export const fetchMembers = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock members data
  return [
    { id: 1, name: "Rajesh Kumar", role: "Product Manager" },
    { id: 2, name: "Priya Sharma", role: "HR Manager" },
    { id: 3, name: "Amit Patel", role: "Sales Lead" },
    { id: 4, name: "Sneha Reddy", role: "Software Engineer" },
    { id: 5, name: "Vikram Singh", role: "UI/UX Designer" },
    { id: 6, name: "Anita Desai", role: "Marketing Manager" },
    { id: 7, name: "Karan Mehta", role: "Business Analyst" },
    { id: 8, name: "Neha Gupta", role: "Account Executive" },
  ];
};

export { mockApi };
