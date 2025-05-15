"use client"

import { useAuth } from "../../contexts/AuthContext"

/**
 * Debug component to help troubleshoot authentication issues
 * Only shown in development mode
 */
const AuthDebugger = () => {
  const { currentUser, isAuthenticated, loading } = useAuth()

  // Only show in development mode
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-0 right-0 bg-gray-800 text-white p-4 m-4 rounded-lg text-xs opacity-75 hover:opacity-100 transition-opacity z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>
        <p>Status: {isAuthenticated ? "✅ Authenticated" : "❌ Not authenticated"}</p>
        <p>Loading: {loading ? "⏳ Yes" : "✅ No"}</p>
        <p>User: {currentUser ? currentUser.email : "None"}</p>
        <p>LocalStorage: {localStorage.getItem("auth_token") ? "✅ Token exists" : "❌ No token"}</p>
      </div>
    </div>
  )
}

export default AuthDebugger
