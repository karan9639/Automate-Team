import Cookies from "js-cookie";
import { mockApi } from "./mockApi";

// Token name in cookies
const TOKEN_NAME = "auth_token";

/**
 * Login user
 * @param {Object} credentials - User credentials
 * @returns {Promise<Object>} User data
 */
export const login = async (credentials) => {
  try {
    console.log("Auth service: Attempting login with credentials:", {
      email: credentials.email,
      passwordLength: credentials.password?.length,
    });

    // In a real app, this would be an API call
    const response = await mockApi.post("/auth/login", credentials);
    const { token, user } = response.data;

    console.log("Auth service: Login successful, received token and user data");

    // Store token in cookies and localStorage for redundancy
    Cookies.set(TOKEN_NAME, token, { expires: 7 });
    localStorage.setItem(TOKEN_NAME, token);
    localStorage.setItem("user", JSON.stringify(user));

    return user;
  } catch (error) {
    console.error("Auth service: Login failed", error);

    // Extract error message from the response or fallback to a default
    let errorMessage = "Login failed. Please try again.";

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = error.response.data?.message || errorMessage;
      console.error(
        "Server responded with:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from server");
      errorMessage = "No response from server. Please try again later.";
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request:", error.message);
    }

    throw new Error(errorMessage);
  }
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    // Get token for authentication header
    const token = Cookies.get(TOKEN_NAME) || localStorage.getItem(TOKEN_NAME);

    // In a real app, this would be an API call with auth header
    await mockApi.post(
      "/auth/logout",
      {},
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    // Clean up after successful logout
    Cookies.remove(TOKEN_NAME);
    localStorage.removeItem(TOKEN_NAME);
    localStorage.removeItem("user");

    console.log("Auth service: Logout successful");
  } catch (error) {
    console.error("Auth service: Logout failed", error);

    // Still clean up even if API call fails
    Cookies.remove(TOKEN_NAME);
    localStorage.removeItem(TOKEN_NAME);
    localStorage.removeItem("user");

    throw new Error(error.response?.data?.message || "Logout failed");
  }
};

/**
 * Check if user is authenticated
 * @returns {Promise<Object|null>} User data or null
 */
export const checkAuth = async () => {
  try {
    const token = Cookies.get(TOKEN_NAME) || localStorage.getItem(TOKEN_NAME);
    const userJson = localStorage.getItem("user");

    if (!token || !userJson) {
      console.log("Auth service: No token or user found");
      return null;
    }

    try {
      // Try to parse the user JSON
      const user = JSON.parse(userJson);

      // In a real app, this would be an API call to validate the token
      const response = await mockApi.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.isAuthenticated) {
        console.log("Auth service: User authenticated");
        return user;
      } else {
        console.log("Auth service: Token validation failed");
        return null;
      }
    } catch (parseError) {
      console.error("Auth service: Failed to parse user data", parseError);
      // Clear invalid data
      Cookies.remove(TOKEN_NAME);
      localStorage.removeItem(TOKEN_NAME);
      localStorage.removeItem("user");
      return null;
    }
  } catch (error) {
    console.error("Auth service: checkAuth failed", error);
    Cookies.remove(TOKEN_NAME);
    localStorage.removeItem(TOKEN_NAME);
    localStorage.removeItem("user");
    return null;
  }
};

/**
 * Register user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User data
 */
export const register = async (userData) => {
  try {
    // In a real app, this would be an API call
    const response = await mockApi.post("/auth/register", userData);
    const { token, user } = response.data;

    // Store token in cookies and localStorage
    Cookies.set(TOKEN_NAME, token, { expires: 7 });
    localStorage.setItem(TOKEN_NAME, token);
    localStorage.setItem("user", JSON.stringify(user));

    return user;
  } catch (error) {
    console.error("Auth service: Registration failed", error);
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

/**
 * Reset password
 * @param {Object} data - Password reset data
 * @returns {Promise<Object>} Success message
 */
export const resetPassword = async (data) => {
  try {
    // In a real app, this would be an API call
    const response = await mockApi.post("/auth/reset-password", data);
    return response.data;
  } catch (error) {
    console.error("Auth service: Password reset failed", error);
    throw new Error(error.response?.data?.message || "Password reset failed");
  }
};

/**
 * Request password reset
 * @param {Object} data - Email data
 * @returns {Promise<Object>} Success message
 */
export const requestPasswordReset = async (data) => {
  try {
    // In a real app, this would be an API call
    const response = await mockApi.post("/auth/forgot-password", data);
    return response.data;
  } catch (error) {
    console.error("Auth service: Password reset request failed", error);
    throw new Error(error.response?.data?.message || "Request failed");
  }
};
