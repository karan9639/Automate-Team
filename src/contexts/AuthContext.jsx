// No changes needed to AuthContext.jsx from the previous version.
// It correctly stores whatever userData it receives.
// The previous version is:
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

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

        // Check for existing auth data in localStorage
        const token = localStorage.getItem("auth_token");
        const userJson = localStorage.getItem("user");

        if (token && userJson) {
          try {
            const parsedUser = JSON.parse(userJson);
            console.log(
              "AuthContext: Loaded user from localStorage:",
              parsedUser
            ); // Key log
            setCurrentUser(parsedUser);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            resetAuthState();
          }
        } else {
          console.log("AuthContext: No valid auth data found");
          resetAuthState();
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

  // Reset auth state helper
  const resetAuthState = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_expiry");
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
    console.log("AuthContext: Auth state reset successfully");
  };

  // Login function - this is what your LoginPage calls
  const login = async (userData, token) => {
    // userData here should be complete
    try {
      setLoading(true);
      setAuthError(null);

      console.log("AuthContext: Login called with userData:", userData); // Key log
      console.log("AuthContext: Login called with token:", token);

      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(userData)); // Storing complete userData

      setCurrentUser(userData);
      setIsAuthenticated(true);

      console.log("AuthContext: User state updated successfully");
      console.log("AuthContext: Current user is now:", userData); // Key log

      return userData;
    } catch (error) {
      console.error("AuthContext login error:", error);
      setAuthError(error.message || "Login failed. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user function (for profile updates)
  const updateUser = (updatedUserData) => {
    try {
      const updatedUser = { ...currentUser, ...updatedUserData };
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      console.log("AuthContext: User data updated:", updatedUser);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      console.log("AuthContext: Logging out user");
      resetAuthState();
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      resetAuthState();
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    authError,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
