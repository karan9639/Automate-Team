import API from "./axiosInstance.js";

const registerUser = async (userData) => API.post("/register", userData);
const loginUser = async (userData) => API.post("/login", userData);
const logoutUser = async () => API.post("/logout", userData);

export { registerUser, logoutUser, loginUser }