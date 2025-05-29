import axios from "axios";
import { ROUTES } from "../constants/routes"; // adjust path as needed

const API = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_BASE_URL, // This will use your https://kps-automate-business-solutions.onrender.com/api/v1/
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${
        config.url
      }`,
      {
        data: config.data,
        params: config.params,
      }
    );

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
API.interceptors.response.use(
  (response) => {
    console.log(
      `✅ API Response: ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`,
      {
        status: response.status,
        data: response.data,
      }
    );
    return response;
  },
  (error) => {
    console.error(
      `❌ API Error: ${error.config?.method?.toUpperCase()} ${
        error.config?.url
      }`,
      {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      }
    );

    if (error.response?.status === 401) {
      console.warn("🔒 Global 401 interceptor triggered - Unauthorized");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      document.cookie =
        "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      import("react-hot-toast").then(({ toast }) => {
        toast.error("Session expired. Please login again.");
      });

      setTimeout(() => {
        if (window.location.pathname !== ROUTES.AUTH.LOGIN) {
          window.location.href = ROUTES.AUTH.LOGIN;
        }
      }, 1000);
    } else if (error.response?.status === 403) {
      import("react-hot-toast").then(({ toast }) => {
        toast.error(
          error.response?.data?.message ||
            "You don't have permission to perform this action."
        );
      });
    } else if (error.response?.status >= 500) {
      import("react-hot-toast").then(({ toast }) => {
        toast.error(
          error.response?.data?.message ||
            "Server error. Please try again later."
        );
      });
    } else if (error.code === "ECONNABORTED") {
      import("react-hot-toast").then(({ toast }) => {
        toast.error("Request timeout. Please check your connection.");
      });
    } else if (!error.response) {
      import("react-hot-toast").then(({ toast }) => {
        toast.error("Network error. Please check your connection.");
      });
    }

    return Promise.reject(error);
  }
);

export default API;
