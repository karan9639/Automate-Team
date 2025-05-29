import API from "./axiosInstance.js";

const TASK_BASE_URL = "/task"; // This will be appended to VITE_PUBLIC_API_BASE_URL

export const taskApi = {
  // Create new task
  createTask: async (taskData) => {
    // taskData should match the backend schema structure
    // { taskTitle, taskDescription, taskAssignedTo (array of user IDs, backend might take first), taskCategory, taskDueDate, taskPriority, taskFrequency (simplified object) }
    return API.post(`${TASK_BASE_URL}/create-task`, taskData);
  },

  // Delete task
  deleteTask: async (taskId) => {
    return API.delete(`${TASK_BASE_URL}/delete-task/${taskId}`);
  },

  // Edit task
  editTask: async (taskId, taskData) => {
    // taskData: same as createTask
    return API.put(`${TASK_BASE_URL}/edit-task/${taskId}`, taskData);
  },

  // View single task
  viewTask: async (taskId) => {
    return API.get(`${TASK_BASE_URL}/view-task/${taskId}`);
  },

  // Change task status
  changeTaskStatus: async (taskId, statusData) => {
    // statusData: { status: 'newStatus' }
    return API.patch(
      `${TASK_BASE_URL}/change-task-status/${taskId}`,
      statusData
    );
  },

  // Get delegated tasks
  getDelegatedTasks: async (params = {}) => {
    return API.get(`${TASK_BASE_URL}/delegated-tasks`, { params });
  },

  // Fetch tasks by category
  fetchCategoryTasks: async (params = {}) => {
    // e.g., params: { categoryId: 'someId' } or { categoryName: 'someName' }
    return API.get(`${TASK_BASE_URL}/fetch-cat-tasks`, { params });
  },

  // Get category-wise task counting
  getCategoryWiseTaskCounting: async (params = {}) => {
    return API.get(`${TASK_BASE_URL}/categorywise-task-counting`, { params });
  },

  // Search tasks
  searchTask: async (searchParams) => {
    // searchParams: { query: 'searchTerm', ...otherFilters }
    return API.get(`${TASK_BASE_URL}/search-task`, { params: searchParams });
  },

  // Filter tasks
  filterTasks: async (filterParams) => {
    // filterParams: { status: 'pending', priority: 'high', ... }
    return API.get(`${TASK_BASE_URL}/filter-tasks`, { params: filterParams });
  },

  // Get tasks assigned to me
  getAssignedToMeTasks: async (params = {}) => {
    return API.get(`${TASK_BASE_URL}/assigned-to-me`, { params });
  },

  // Re-assign all tasks from one user to another
  reAssignAllTasks: async (reassignData) => {
    // reassignData: { fromUserId: string, toUserId: string, taskIds: string[] (optional) }
    return API.post(`${TASK_BASE_URL}/re-assign-all-tasks`, reassignData);
  },

  // Get all tasks
  getAllTasks: async (params = {}) => {
    return API.get(`${TASK_BASE_URL}/all-tasks`, { params });
  },
};
