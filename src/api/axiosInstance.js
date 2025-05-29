import axios from "axios";
import { ROUTES } from "../constants/routes"; 

const API = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_BASE_URL,
  withCredentials: true,
});


API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("🔒 Global 401 interceptor triggered");

      
      localStorage.clear();

      
      import("react-hot-toast").then(({ toast }) => {
        toast.error("Session expired. Please login again.");
      });

     
      window.location.href = ROUTES.AUTH.LOGIN;

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default API;
