import { userApi } from "../api/userApi.js" // Updated from authApi
import { taskApi } from "../api/taskApi.js"
import { teamApi } from "../api/teamApi.js" // Kept as is, update if spec changes
import { attendanceApi } from "../api/attendanceApi.js" // Kept as is
import { leaveApi } from "../api/leaveApi.js" // Kept as is
import { supportApi } from "../api/supportApi.js" // Kept as is

export {
  userApi, // Updated
  taskApi,
  teamApi,
  attendanceApi,
  leaveApi,
  supportApi,
}

// Legacy exports for backward compatibility if needed, though ideally update components
export const authApis = userApi // Pointing old authApis to new userApi
export const taskApis = taskApi
export const teamApis = teamApi
export const attendanceApis = attendanceApi
export const leaveApis = leaveApi
export const supportApis = supportApi

// Utility function to handle API responses (extract data on success)
export const handleApiResponse = (response) => {
  // Axios automatically throws for non-2xx, so response here is successful
  return response.data // Return the data property from the Axios response
}

// Utility function to handle API errors (more specific error construction)
export const handleApiError = (error) => {
  console.error("API Error in handleApiError:", error)

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response
    const message = data?.message || error.message || "An error occurred"

    // You can throw a custom error object or just the message
    // For simplicity, re-throwing a new error with a potentially more user-friendly message
    // Or you could return an object like { error: true, message, status }
    throw new Error(`Server error (${status}): ${message}`)
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error("Network error: No response received from server. Please check your connection.")
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(error.message || "An unexpected error occurred during the API request.")
  }
}
