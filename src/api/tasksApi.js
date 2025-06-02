import API from "./axiosInstance.js";

// Task specific APIs (assuming they remain under 'task/' prefix)
const createTask = async (taskData) => {
  return API.post("task/create-task", taskData);
};
const myTask = async () => API.get("task/assigned-to-me");
const deligatedTask = async () => API.get("task/delegated-tasks");
const allTask = async () => API.get("task/all-tasks");
const viewTask = async (taskId) => API.get(`task/view-task/${taskId}`);
const editTask = async (taskId, updatedData) =>
  API.put(`task/edit-task/${taskId}`, updatedData);
const deleteTask = async (taskId) => API.delete(`task/delete-task/${taskId}`);


const changeTaskStatus = async (taskId, newStatus) => {
  const payload = { status: newStatus };
  return API.patch(`task/change-task-status/${taskId}`, payload);
};

// Comment specific APIs (now under 'comment/' prefix)
const createTaskComment = async (taskId, commentData) =>
  API.post(`comment/create-comment/${taskId}`, commentData);
const fetchTaskComments = async (taskId) =>
  API.get(`comment/fetch-comments/${taskId}`);

const setOverDue = async () => API.patch("task/set-overdue-status")

export {
  createTask,
  myTask,
  deligatedTask,
  allTask,
  viewTask,
  editTask,
  deleteTask,
  changeTaskStatus,
  createTaskComment,
  fetchTaskComments,
  setOverDue,
};



