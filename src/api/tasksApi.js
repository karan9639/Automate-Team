import API from "./axiosInstance.js"

// Task specific APIs (assuming they remain under 'task/' prefix)
const createTask = async (taskData) => {
  return API.post("task/create-task", taskData)
}
// My Tasks - Assigned to Me
const myTask = async (page = 1, limit = 9) => {
  try {
    const response = await API.get(`task/assigned-to-me?page=${page}&limit=${limit}`)
    return response?.data?.data
  } catch (error) {
    console.error("Failed to fetch assigned tasks:", error)
    return null
  }
}

// Delegated Tasks - Assigned by Me
const delegatedTask = async (page = 1, limit = 9) => {
  try {
    const response = await API.get(`task/delegated-tasks?page=${page}&limit=${limit}`)
    return response?.data?.data
  } catch (error) {
    console.error("Failed to fetch delegated tasks:", error)
    return null
  }
}

// All Tasks
const allTask = async (page = 1, limit = 9) => {
  try {
    const response = await API.get(`task/all-tasks?page=${page}&limit=${limit}`)
    return response?.data
  } catch (error) {
    console.error("Failed to fetch all tasks:", error)
    return null
  }
}

// Personal Tasks - Tasks assigned to yourself
const personalTasks = async (page = 1, limit = 9) => {
  try {
    const response = await API.get(`task/personal-tasks?page=${page}&limit=${limit}`)
    return response?.data?.data
  } catch (error) {
    console.error("Failed to fetch personal tasks:", error)
    return null
  }
}

const viewTask = async (taskId) => API.get(`task/view-task/${taskId}`)
const editTask = async (taskId, updatedData) => API.put(`task/edit-task/${taskId}`, updatedData)
const deleteTask = async (taskId) => API.delete(`task/delete-task/${taskId}`)

const changeTaskStatus = async (taskId, newStatus) => {
  const payload = { status: newStatus }
  return API.patch(`task/change-task-status/${taskId}`, payload)
}

// Comment specific APIs (now under 'comment/' prefix)
const createTaskComment = async (taskId, commentData) => API.post(`comment/create-comment/${taskId}`, commentData)
const fetchTaskComments = async (taskId) => API.get(`comment/fetch-comments/${taskId}`)

const setOverDue = async () => API.patch("task/set-overdue-status")

const filterTask = async (data) => API.post("task/filter-tasks", data)

const myTaskFilter = async (data) => API.post("task/filter-tasks-assigned-to-me", data)

const reassignAllTask = async (reassignData) => {
  return API.patch("task/re-assign-all-tasks", reassignData)
}

export {
  createTask,
  myTask,
  delegatedTask,
  allTask,
  personalTasks,
  viewTask,
  editTask,
  deleteTask,
  changeTaskStatus,
  createTaskComment,
  fetchTaskComments,
  setOverDue,
  filterTask,
  reassignAllTask,
  myTaskFilter,
}
