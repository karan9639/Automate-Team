import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { taskApi } from "../../api/taskApi";

const initialState = {
  myTasks: [],
  delegatedTasks: [],
  allTasks: [],
  currentTask: null,
  categoryTasks: [],
  taskCounts: {},
  searchResults: [],
  filteredResults: [],
  loading: {
    myTasks: false,
    delegatedTasks: false,
    allTasks: false,
    create: false,
    edit: false,
    delete: false,
    view: false,
    statusChange: false,
    categoryTasks: false,
    taskCounts: false,
    search: false,
    filter: false,
    reassign: false,
  },
  error: {
    myTasks: null,
    delegatedTasks: null,
    allTasks: null,
    create: null,
    edit: null,
    delete: null,
    view: null,
    statusChange: null,
    categoryTasks: null,
    taskCounts: null,
    search: null,
    filter: null,
    reassign: null,
  },
};

// Async Thunks
export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await taskApi.createTask(taskData);
      return response.data; // Assuming API returns { statusCode, data: createdTask, message, success }
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to create task" }
      );
    }
  }
);

export const fetchAllTasks = createAsyncThunk(
  "tasks/fetchAllTasks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskApi.getAllTasks(params);
      // response.data is: { statusCode, data: { tasks, ... }, message, success }
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch all tasks" }
      );
    }
  }
);

export const fetchMyTasks = createAsyncThunk(
  "tasks/fetchMyTasks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskApi.getAssignedToMeTasks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch assigned tasks" }
      );
    }
  }
);

export const fetchDelegatedTasks = createAsyncThunk(
  "tasks/fetchDelegatedTasks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskApi.getDelegatedTasks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch delegated tasks" }
      );
    }
  }
);

export const editTask = createAsyncThunk(
  "tasks/editTask",
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await taskApi.editTask(taskId, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to edit task" }
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (taskId, { rejectWithValue }) => {
    try {
      await taskApi.deleteTask(taskId);
      return taskId; // Return taskId for removal from state
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to delete task" }
      );
    }
  }
);

export const viewTask = createAsyncThunk(
  "tasks/viewTask",
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await taskApi.viewTask(taskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to view task" }
      );
    }
  }
);

export const changeTaskStatus = createAsyncThunk(
  "tasks/changeTaskStatus",
  async ({ taskId, status }, { rejectWithValue }) => {
    try {
      const response = await taskApi.changeTaskStatus(taskId, { status });
      return { taskId, status, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to change task status" }
      );
    }
  }
);

export const searchTasks = createAsyncThunk(
  "tasks/searchTasks",
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await taskApi.searchTask(searchParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to search tasks" }
      );
    }
  }
);

export const filterTasks = createAsyncThunk(
  "tasks/filterTasks",
  async (filterParams, { rejectWithValue }) => {
    try {
      const response = await taskApi.filterTasks(filterParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to filter tasks" }
      );
    }
  }
);

export const fetchCategoryTasks = createAsyncThunk(
  "tasks/fetchCategoryTasks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskApi.fetchCategoryTasks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch category tasks" }
      );
    }
  }
);

export const getCategoryWiseTaskCounting = createAsyncThunk(
  "tasks/getCategoryWiseTaskCounting",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskApi.getCategoryWiseTaskCounting(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to get category wise task counting",
        }
      );
    }
  }
);

export const reAssignAllTasks = createAsyncThunk(
  "tasks/reAssignAllTasks",
  async (reassignData, { rejectWithValue }) => {
    try {
      const response = await taskApi.reAssignAllTasks(reassignData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to reassign tasks" }
      );
    }
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearErrors: (state) => {
      Object.keys(state.error).forEach((key) => {
        state.error[key] = null;
      });
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    setSelectedTaskIds: (state, action) => {
      state.selectedTaskIds = action.payload;
    },
    toggleTaskSelection: (state, action) => {
      const taskId = action.payload;
      const index = state.selectedTaskIds.indexOf(taskId);
      if (index > -1) {
        state.selectedTaskIds.splice(index, 1);
      } else {
        state.selectedTaskIds.push(taskId);
      }
    },
    setSortOptions: (state, action) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.error.search = null;
    },
    clearFilterResults: (state) => {
      state.filteredResults = [];
      state.error.filter = null;
    },
  },
  extraReducers: (builder) => {
    // Create Task
    builder
      .addCase(createTask.pending, (state) => {
        state.loading.create = true;
        state.error.create = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading.create = false;
        // Add to relevant lists
        if (action.payload.data) {
          state.allTasks.unshift(action.payload.data);
          state.delegatedTasks.unshift(action.payload.data);
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading.create = false;
        state.error.create = action.payload?.message || "Failed to create task";
      });

    // Fetch All Tasks
    builder
      .addCase(fetchAllTasks.pending, (state) => {
        state.loading.allTasks = true;
        state.error.allTasks = null;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.loading.allTasks = false;
        // CRITICAL LINE: Ensure tasks are extracted from action.payload.data.tasks
        state.allTasks = action.payload.data?.tasks || [];
        state.error.allTasks = null;
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.loading.allTasks = false;
        state.error.allTasks =
          action.payload?.message || "Failed to fetch all tasks";
        state.allTasks = [];
      });

    // Fetch My Tasks
    builder
      .addCase(fetchMyTasks.pending, (state) => {
        state.loading.myTasks = true;
        state.error.myTasks = null;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.loading.myTasks = false;
        state.myTasks = action.payload.data?.tasks || [];
        state.error.myTasks = null;
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.loading.myTasks = false;
        state.error.myTasks =
          action.payload?.message || "Failed to fetch my tasks";
        state.myTasks = [];
      });

    // Fetch Delegated Tasks
    builder
      .addCase(fetchDelegatedTasks.pending, (state) => {
        state.loading.delegatedTasks = true;
        state.error.delegatedTasks = null;
      })
      .addCase(fetchDelegatedTasks.fulfilled, (state, action) => {
        state.loading.delegatedTasks = false;
        state.delegatedTasks = action.payload.data?.tasks || [];
        state.error.delegatedTasks = null;
      })
      .addCase(fetchDelegatedTasks.rejected, (state, action) => {
        state.loading.delegatedTasks = false;
        state.error.delegatedTasks =
          action.payload?.message || "Failed to fetch delegated tasks";
        state.delegatedTasks = [];
      });

    // Edit Task
    builder
      .addCase(editTask.pending, (state) => {
        state.loading.edit = true;
        state.error.edit = null;
      })
      .addCase(editTask.fulfilled, (state, action) => {
        state.loading.edit = false;
        const updatedTask = action.payload.data;
        if (updatedTask) {
          const updateList = (list) =>
            list.map((task) =>
              task._id === updatedTask._id ? updatedTask : task
            );
          state.allTasks = updateList(state.allTasks);
          state.myTasks = updateList(state.myTasks);
          state.delegatedTasks = updateList(state.delegatedTasks);
          if (state.currentTask?._id === updatedTask._id) {
            state.currentTask = updatedTask;
          }
        }
      })
      .addCase(editTask.rejected, (state, action) => {
        state.loading.edit = false;
        state.error.edit = action.payload?.message || "Failed to edit task";
      });

    // Delete Task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.loading.delete = true;
        state.error.delete = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading.delete = false;
        const deletedTaskId = action.payload;
        const filterList = (list) =>
          list.filter((task) => task._id !== deletedTaskId);
        state.allTasks = filterList(state.allTasks);
        state.myTasks = filterList(state.myTasks);
        state.delegatedTasks = filterList(state.delegatedTasks);
        if (state.currentTask?._id === deletedTaskId) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading.delete = false;
        state.error.delete = action.payload?.message || "Failed to delete task";
      });

    // View Task
    builder
      .addCase(viewTask.pending, (state) => {
        state.loading.view = true;
        state.error.view = null;
      })
      .addCase(viewTask.fulfilled, (state, action) => {
        state.loading.view = false;
        state.currentTask = action.payload.data || null;
        state.error.view = null;
      })
      .addCase(viewTask.rejected, (state, action) => {
        state.loading.view = false;
        state.error.view = action.payload?.message || "Failed to view task";
        state.currentTask = null;
      });

    // Change Task Status
    builder
      .addCase(changeTaskStatus.pending, (state) => {
        state.loading.statusChange = true;
        state.error.statusChange = null;
      })
      .addCase(changeTaskStatus.fulfilled, (state, action) => {
        state.loading.statusChange = false;
        const { taskId, status } = action.payload;

        // Update status in all relevant arrays
        const updateStatusInArray = (array) => {
          const task = array.find((task) => task._id === taskId);
          if (task) {
            task.taskStatus = status;
          }
        };

        updateStatusInArray(state.allTasks);
        updateStatusInArray(state.myTasks);
        updateStatusInArray(state.delegatedTasks);

        if (state.currentTask && state.currentTask._id === taskId) {
          state.currentTask.taskStatus = status;
        }
      })
      .addCase(changeTaskStatus.rejected, (state, action) => {
        state.loading.statusChange = false;
        state.error.statusChange =
          action.payload?.message || "Failed to change task status";
      });

    // Search Tasks
    builder
      .addCase(searchTasks.pending, (state) => {
        state.loading.search = true;
        state.error.search = null;
      })
      .addCase(searchTasks.fulfilled, (state, action) => {
        state.loading.search = false;
        state.searchResults =
          action.payload.data?.tasks || action.payload.data || [];
      })
      .addCase(searchTasks.rejected, (state, action) => {
        state.loading.search = false;
        state.error.search =
          action.payload?.message || "Failed to search tasks";
      });

    // Filter Tasks
    builder
      .addCase(filterTasks.pending, (state) => {
        state.loading.filter = true;
        state.error.filter = null;
      })
      .addCase(filterTasks.fulfilled, (state, action) => {
        state.loading.filter = false;
        state.filteredResults =
          action.payload.data?.tasks || action.payload.data || [];
      })
      .addCase(filterTasks.rejected, (state, action) => {
        state.loading.filter = false;
        state.error.filter =
          action.payload?.message || "Failed to filter tasks";
      });

    // Fetch Category Tasks
    builder
      .addCase(fetchCategoryTasks.pending, (state) => {
        state.loading.categoryTasks = true;
        state.error.categoryTasks = null;
      })
      .addCase(fetchCategoryTasks.fulfilled, (state, action) => {
        state.loading.categoryTasks = false;
        state.categoryTasks =
          action.payload.data?.tasks || action.payload.data || [];
      })
      .addCase(fetchCategoryTasks.rejected, (state, action) => {
        state.loading.categoryTasks = false;
        state.error.categoryTasks =
          action.payload?.message || "Failed to fetch category tasks";
      });

    // Get Category Wise Task Counting
    builder
      .addCase(getCategoryWiseTaskCounting.pending, (state) => {
        state.loading.taskCounts = true;
        state.error.taskCounts = null;
      })
      .addCase(getCategoryWiseTaskCounting.fulfilled, (state, action) => {
        state.loading.taskCounts = false;
        state.taskCounts = action.payload.data || {};
      })
      .addCase(getCategoryWiseTaskCounting.rejected, (state, action) => {
        state.loading.taskCounts = false;
        state.error.taskCounts =
          action.payload?.message || "Failed to get task counts";
      });

    // Re-assign All Tasks
    builder
      .addCase(reAssignAllTasks.pending, (state) => {
        state.loading.reassign = true;
        state.error.reassign = null;
      })
      .addCase(reAssignAllTasks.fulfilled, (state, action) => {
        state.loading.reassign = false;
        // Refresh all task lists after reassignment
        // You might want to trigger a refetch of tasks here
      })
      .addCase(reAssignAllTasks.rejected, (state, action) => {
        state.loading.reassign = false;
        state.error.reassign =
          action.payload?.message || "Failed to reassign tasks";
      });
  },
});

export const {
  clearErrors,
  clearCurrentTask,
  setSelectedTaskIds,
  toggleTaskSelection,
  setSortOptions,
  clearSearchResults,
  clearFilterResults,
} = taskSlice.actions;

// Selectors
export const selectMyTasks = (state) => state.tasks.myTasks;
export const selectDelegatedTasks = (state) => state.tasks.delegatedTasks;
export const selectAllTasks = (state) => state.tasks.allTasks;
export const selectCurrentTask = (state) => state.tasks.currentTask;
export const selectTaskLoading = (state) => state.tasks.loading;
export const selectTaskErrors = (state) => state.tasks.error;
export const selectSearchResults = (state) => state.tasks.searchResults;
export const selectFilterResults = (state) => state.tasks.filteredResults;
export const selectSelectedTaskIds = (state) => state.tasks.selectedTaskIds;
export const selectCategoryTasks = (state) => state.tasks.categoryTasks;
export const selectTaskCounts = (state) => state.tasks.taskCounts;

export default taskSlice.reducer;
