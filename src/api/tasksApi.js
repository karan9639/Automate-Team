import API from "./axiosInstance.js";


const myTask = async () => API.get("task/assigned-to-me");
const deligatedTask = async () => API.get("task/delegated-tasks");
const allTask = async () => API.get("task/all-tasks");
const viewTask = async (taskId) => API.get(`task/view-task/${taskId}`)


export {myTask , deligatedTask , allTask , viewTask}