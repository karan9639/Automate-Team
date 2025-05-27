"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { loginUser } from "@/api/authApi"
import { useAuth } from "@/contexts/AuthContext"
import toast from "react-hot-toast"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the intended destination from location state or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await loginUser({
        email: email.toLowerCase(),
        password,
      })

      console.log("API Response:", res.data) // Debug log

      // Check if login was successful based on your API structure
      if (res.data?.success === true && res.data?.statusCode === 200) {
        console.log("Login successful, processing user data...")

        // Extract user data from your specific API response structure
        const apiUserData = res.data.data

        console.log("API User Data:", apiUserData) // Debug log

        // Create user object matching your API response structure
        const user = {
          id: apiUserData.id || Date.now(), // Add ID if available, or generate one
          email: apiUserData.email,
          fullname: apiUserData.fullname, // This is the exact field from your API
          name: apiUserData.fullname, // Use fullname as the display name
          accountType: apiUserData.accountType, // This is the exact field from your API
          role: apiUserData.accountType, // Map accountType to role for consistency
          createdAt: apiUserData.createdAt,
          updatedAt: apiUserData.updatedAt,
        }

        console.log("Processed user object:", user) // Debug log

        // For token, check if it's in the response or generate a demo one
        const token = res.data.token || res.data.accessToken || "demo-token-" + Date.now()

        // Update authentication context with the user data
        await login(user, token)

        // Clear any previous errors
        setError("")

        // Show success message
        toast.success("Logged In Successfully")

        console.log("Authentication successful, navigating to:", from)

        // Navigate to dashboard
        navigate(from, { replace: true })
      } else {
        // Handle API error response
        const errorMessage = res.data?.message || "Invalid email or password"
        setError(errorMessage)
        toast.error(errorMessage + " ❌")
      }
    } catch (err) {
      console.error("Login error:", err)

      // Handle different types of errors
      let errorMessage = "Invalid email or password"

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      toast.error(errorMessage + " ❌")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account to continue</p>
        </div>

        {error && <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">{error}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
