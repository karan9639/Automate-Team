import API from "./axiosInstance.js"

const TASK_BASE_URL = "/task" // This will be appended to VITE_PUBLIC_API_BASE_URL

export const taskApi = {
  createTask: async (taskData) => {
    // taskData: { taskTitle, taskDescription, taskAssignedTo (array of user IDs), taskCategory, taskDueDate, taskPriority, taskFrequency }
    return API.post(`${TASK_BASE_URL}/create-task`, taskData)
  },

  deleteTask: async (taskId) => {
    return API.delete(`${TASK_BASE_URL}/delete-task/${taskId}`)
  },

  viewTask: async (taskId) => {
    return API.get(`${TASK_BASE_URL}/view-task/${taskId}`)
  },

  changeTaskStatus: async (taskId, statusData) => {
    // statusData: { status: 'newStatus' }
    return API.patch(`${TASK_BASE_URL}/change-task-status/${taskId}`, statusData)
  },

  getDelegatedTasks: async (params = {}) => {
    return API.get(`${TASK_BASE_URL}/delegated-tasks`, { params })
  },

  fetchCategoryTasks: async (params = {}) => {
    // e.g., params: { categoryId: 'someId' } or { categoryName: 'someName' }
    return API.get(`${TASK_BASE_URL}/fetch-cat-tasks`, { params })
  },

  getCategoryWiseTaskCounting: async (params = {}) => {
    return API.get(`${TASK_BASE_URL}/categorywise-task-counting`, { params })
  },

  searchTask: async (searchParams) => {
    // searchParams: { query: 'searchTerm', ...otherFilters }
    return API.get(`${TASK_BASE_URL}/search-task`, { params: searchParams })
  },

  filterTasks: async (filterParams) => {
    // filterParams: { status: 'pending', priority: 'high', ... }
    return API.get(`${TASK_BASE_URL}/filter-tasks`, { params: filterParams })
  },

  getAssignedToMeTasks: async (params = {}) => {
    return API.get(`${TASK_BASE_URL}/assigned-to-me`, { params })
  },

  editTask: async (taskId, taskData) => {
    // taskData: same as createTask
    return API.put(`${TASK_BASE_URL}/edit-task/${taskId}`, taskData)
  },

  reAssignAllTasks: async (reassignData) => {
    // reassignData: { fromUserId: string, toUserId: string, taskIds: string[] (optional) }
    return API.post(`${TASK_BASE_URL}/re-assign-all-tasks`, reassignData)
  },
}
