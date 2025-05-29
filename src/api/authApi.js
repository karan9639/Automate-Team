import API from "./axiosInstance.js";

const registerUser = async (userData) => API.post("user/register", userData);
const loginUser = async (userData) => API.post("user/login", userData);
const logoutUser = async () => API.post("user/logout");

export { registerUser, logoutUser, loginUser };
