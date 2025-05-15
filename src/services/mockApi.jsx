import axios from "axios";
import MockAdapter from "axios-mock-adapter";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: "https://api.automate-team.com",
  timeout: 1000,
});

// Create mock adapter
const mock = new MockAdapter(axiosInstance, { delayResponse: 500 });

// Mock user data
const MOCK_USERS = [
  {
    id: "user-1",
    name: "John Doe",
    email: "admin@example.com",
    password: "password123", // In a real app, this would be hashed
    role: "admin",
    avatar: "/diverse-avatars.png",
  },
  {
    id: "user-2",
    name: "Jane Smith",
    email: "user@example.com",
    password: "password123", // In a real app, this would be hashed
    role: "user",
    avatar: "/diverse-avatars.png",
  },
];

// Mock authentication endpoints
mock.onPost("/auth/login").reply((config) => {
  try {
    const { email, password } = JSON.parse(config.data);
    const user = MOCK_USERS.find((user) => user.email === email);

    if (user && user.password === password) {
      // Successful login
      const { password, ...userWithoutPassword } = user; // Remove password from response
      return [
        200,
        {
          token: `mock-token-${Date.now()}`,
          user: userWithoutPassword,
        },
      ];
    }

    // Invalid credentials
    return [401, { message: "Invalid email or password" }];
  } catch (error) {
    console.error("Mock API error:", error);
    return [500, { message: "Server error" }];
  }
});

mock.onPost("/auth/register").reply((config) => {
  try {
    const userData = JSON.parse(config.data);
    // In a real app, we would validate data, check for existing users, etc.

    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      role: "user", // Default role
    };

    // Successful registration
    const { password, ...userWithoutPassword } = newUser;
    return [
      201,
      {
        token: `mock-token-${Date.now()}`,
        user: userWithoutPassword,
      },
    ];
  } catch (error) {
    console.error("Mock API error:", error);
    return [500, { message: "Server error" }];
  }
});

mock.onPost("/auth/logout").reply(200, { message: "Logged out successfully" });

mock.onGet("/auth/me").reply((config) => {
  const authHeader = config.headers["Authorization"];

  if (authHeader && authHeader.startsWith("Bearer ")) {
    // In a real app, we would validate the token
    return [200, { isAuthenticated: true }];
  }

  return [401, { message: "Unauthorized" }];
});

mock.onPost("/auth/forgot-password").reply(200, {
  message: "Password reset instructions sent to your email",
});

mock.onPost("/auth/reset-password").reply(200, {
  message: "Password reset successful",
});

// Mock team endpoints
mock.onGet("/teams/members").reply(200, [
  {
    id: 1,
    name: "John Doe",
    role: "Team Lead",
    email: "john.doe@example.com",
    avatar: "/diverse-avatars.png",
    status: "active",
  },
  {
    id: 2,
    name: "Jane Smith",
    role: "Developer",
    email: "jane.smith@example.com",
    avatar: "/diverse-avatars.png",
    status: "active",
  },
  {
    id: 3,
    name: "Robert Johnson",
    role: "Designer",
    email: "robert.johnson@example.com",
    avatar: "/diverse-avatars.png",
    status: "inactive",
  },
]);

// Export the mocked axios instance
export const mockApi = axiosInstance;
