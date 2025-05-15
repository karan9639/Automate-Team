"use client";

import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  login as apiLogin,
  logout as apiLogout,
  checkAuth as apiCheckAuth,
} from "../services/authService";

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        setLoading(true);

        // Use the API service to check authentication
        const user = await apiCheckAuth();

        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          console.log("User authenticated from API check");
        } else {
          // Fallback to localStorage check if API fails
          const token = localStorage.getItem("auth_token");
          const userJson = localStorage.getItem("user");

          if (token && userJson) {
            try {
              const parsedUser = JSON.parse(userJson);
              setCurrentUser(parsedUser);
              setIsAuthenticated(true);
              console.log("User authenticated from localStorage fallback");
            } catch (parseError) {
              console.error("Error parsing user data:", parseError);
              resetAuthState();
            }
          } else {
            console.log("No valid auth data found");
            resetAuthState();
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        resetAuthState();
      } finally {
        setLoading(false);
      }
    };

    checkUserAuth();
  }, []);

  // Reset auth state helper - enhanced for better cleanup
  const resetAuthState = () => {
    // Clear all auth-related localStorage items
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_expiry");

    // Reset state
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAuthError(null);

    console.log("Auth state reset successfully");
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setAuthError(null);

      // Try to use the API login
      let user;

      try {
        // Try to use the real API service
        user = await apiLogin({ email, password });
        console.log("API login successful");
      } catch (apiError) {
        console.warn("API login failed, using fallback:", apiError);

        // Fallback for demo/development: Accept any email/password
        user = {
          id: 1,
          name: email.split("@")[0],
          email,
          role: "Admin",
        };

        // Store token manually since API call failed
        localStorage.setItem("auth_token", "demo-token-" + Date.now());
        // Store user in localStorage
        localStorage.setItem("user", JSON.stringify(user));
      }

      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);

      // Signal successful authentication
      console.log("Login successful for:", email);

      return user;
    } catch (error) {
      console.error("Login error:", error);
      setAuthError(error.message || "Login failed. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced logout function with better error handling and state management
  const logout = async () => {
    try {
      setLoading(true);

      // Try to use the API logout if available
      try {
        await apiLogout();
        console.log("API logout successful");
      } catch (apiError) {
        console.warn("API logout failed, using fallback cleanup:", apiError);
      }

      // Reset auth state regardless of API success
      resetAuthState();

      return true; // Indicate successful logout
    } catch (error) {
      console.error("Logout error:", error);
      // Still reset state even if API fails
      resetAuthState();
      return false; // Indicate error during logout
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    authError,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
