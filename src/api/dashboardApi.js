import API from "./axiosInstance.js";


const totalTaskCounting = async () => API.get("task/total-categorized-tasks-counting");


export {totalTaskCounting}
