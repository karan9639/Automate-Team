import API from "./axiosInstance.js";

const registerUser = async (userData) => API.post("/register", userData);
const loginUser = async (userData) => API.post("/login", userData);
const logoutUser = async () => API.post("/logout");

export { registerUser, logoutUser, loginUser }