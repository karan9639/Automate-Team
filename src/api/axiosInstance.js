import axios from "axios";
import { ROUTES } from "../constants/routes"; // adjust path as needed

const API = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

// 🔁 Global response interceptor for 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("🔒 Global 401 interceptor triggered");

      // Clear localStorage or cookies if needed
      localStorage.clear();

      // Optional: show toast
      import("react-hot-toast").then(({ toast }) => {
        toast.error("Session expired. Please login again.");
      });

      // Navigate to login page
      window.location.href = ROUTES.AUTH.LOGIN;

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default API;
