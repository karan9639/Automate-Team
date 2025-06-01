import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// Ensure this path is correct and taskApi object is properly structured
import * as taskApiService from "../../api/tasksApi"; // Using your actual API service
import { toast } from "react-hot-toast";

const initialState = {
  myTasks: [],
  delegatedTasks: [],
  allTasks: [],
  currentTask: null,
  comments: [], // For storing comments of the currentTask
  categoryTasks: [],
  taskCounts: {},
  searchResults: [],
  filteredResults: [],
  selectedTaskIds: [],
  sortBy: "taskDueDate",
  sortOrder: "asc",
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
    createComment: false,
    fetchComments: false, // For fetching comments
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
    createComment: null,
    fetchComments: null, // For fetching comments
  },
  isAssignTaskModalOpen: false,
  isViewTaskModalOpen: false,
  taskForModal: null,
};

// Async Thunks for Tasks
export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await taskApiService.createTask(taskData);
      return response.data; // Assuming API returns { success: true, data: newTask, message: "..." }
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
      const response = await taskApiService.getAllTasks(params);
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
      const response = await taskApiService.getAssignedToMeTasks(params);
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
      const response = await taskApiService.getDelegatedTasks(params);
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
      const response = await taskApiService.editTask(taskId, taskData);
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
      await taskApiService.deleteTask(taskId);
      return taskId;
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
      const response = await taskApiService.viewTask(taskId);
      return response.data; // This is the task details, comments fetched separately
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
      const response = await taskApiService.changeTaskStatus(taskId, {
        status,
      });
      return { taskId, status, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to change task status" }
      );
    }
  }
);

export const fetchTaskComments = createAsyncThunk(
  "tasks/fetchTaskComments",
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await taskApiService.fetchTaskComments(taskId);
      // console.log("📥 fetchTaskComments API response:", response.data);
      // console.log("res status: ",response.data.statusCode);

      if (
        (response.data.statusCode === 200 || response.status === 200) 
      ) {
        console.log("fetched comments: ", response.data.data);
        return response.data.data; 
        
      } else {
        return rejectWithValue(
          response.message ||
            "Failed to fetch comments due to unexpected response"
        );
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch comments";
      return rejectWithValue(message);
    }
  }
);



export const createTaskComment = createAsyncThunk(
  "tasks/createTaskComment",
  async ({ taskId, commentData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await taskApiService.createTaskComment(
        taskId,
        commentData
      );

      // ✅ More reliable condition
      if (
        (response.statusCode === 201 || response.status === 201) &&
        response.data
      ) {
        dispatch(fetchTaskComments(taskId));
        return response.data;
      } else {
        return rejectWithValue(
          response.message ||
            "Failed to create comment due to unexpected response"
        );
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create comment";
      return rejectWithValue(message);
    }
  }
);


// Other Async Thunks (Search, Filter, etc.)
export const searchTasks = createAsyncThunk(
  "tasks/searchTasks",
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await taskApiService.searchTask(searchParams);
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
      const response = await taskApiService.filterTasks(filterParams);
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
      const response = await taskApiService.fetchCategoryTasks(params);
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
      const response = await taskApiService.getCategoryWiseTaskCounting(params);
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
      const response = await taskApiService.reAssignAllTasks(reassignData);
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
      state.comments = []; // Clear comments when task is cleared
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
    openAssignTaskModal: (state) => {
      state.isAssignTaskModalOpen = true;
    },
    closeAssignTaskModal: (state) => {
      state.isAssignTaskModalOpen = false;
    },
    openViewTaskModal: (state, action) => {
      state.taskForModal = action.payload;
      state.isViewTaskModalOpen = true;
    },
    closeViewTaskModal: (state) => {
      state.taskForModal = null;
      state.isViewTaskModalOpen = false;
      state.currentTask = null;
      state.comments = []; // Clear comments when view modal is closed
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
        if (action.payload.data) {
          state.allTasks.unshift(action.payload.data);
          toast.success(action.payload.message || "Task created successfully!");
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading.create = false;
        state.error.create = action.payload?.message || "Failed to create task";
        toast.error(state.error.create);
      });

    // Fetch All Tasks
    builder
      .addCase(fetchAllTasks.pending, (state) => {
        state.loading.allTasks = true;
        state.error.allTasks = null;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.loading.allTasks = false;
        state.allTasks = action.payload.data?.tasks || [];
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
            // Preserve comments if currentTask is being edited and comments are separate
            state.currentTask = { ...updatedTask, comments: state.comments };
          }
          toast.success(action.payload.message || "Task updated successfully!");
        }
      })
      .addCase(editTask.rejected, (state, action) => {
        state.loading.edit = false;
        state.error.edit = action.payload?.message || "Failed to edit task";
        toast.error(state.error.edit);
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
          state.comments = [];
        }
        toast.success("Task deleted successfully!");
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading.delete = false;
        state.error.delete = action.payload?.message || "Failed to delete task";
        toast.error(state.error.delete);
      });

    // View Task
    builder
      .addCase(viewTask.pending, (state) => {
        state.loading.view = true;
        state.error.view = null;
        state.currentTask = null;
        state.comments = []; // Clear previous comments
      })
      .addCase(viewTask.fulfilled, (state, action) => {
        state.loading.view = false;
        state.currentTask = action.payload.data || null;
        // Comments are fetched by a separate dispatch in ViewTaskModal
      })
      .addCase(viewTask.rejected, (state, action) => {
        state.loading.view = false;
        state.error.view = action.payload?.message || "Failed to view task";
        state.currentTask = null;
        state.comments = [];
      });

    // Change Task Status
    builder
      .addCase(changeTaskStatus.pending, (state) => {
        state.loading.statusChange = true;
        state.error.statusChange = null;
      })
      .addCase(changeTaskStatus.fulfilled, (state, action) => {
        state.loading.statusChange = false;
        const { taskId, data } = action.payload; // status is also available if needed
        const updatedTaskData = data.data;

        const updateStatusInArray = (array) => {
          return array.map((task) =>
            task._id === taskId ? { ...task, ...updatedTaskData } : task
          );
        };
        state.allTasks = updateStatusInArray(state.allTasks);
        state.myTasks = updateStatusInArray(state.myTasks);
        state.delegatedTasks = updateStatusInArray(state.delegatedTasks);

        if (state.currentTask && state.currentTask._id === taskId) {
          state.currentTask = { ...state.currentTask, ...updatedTaskData };
        }
        toast.success(data.message || "Task status updated!");
      })
      .addCase(changeTaskStatus.rejected, (state, action) => {
        state.loading.statusChange = false;
        state.error.statusChange =
          action.payload?.message || "Failed to change task status";
        toast.error(state.error.statusChange);
      });

    // Fetch Task Comments
builder
  .addCase(fetchTaskComments.pending, (state) => {
    state.loading.fetchComments = true;
    state.error.fetchComments = null;
  })
  .addCase(fetchTaskComments.fulfilled, (state, action) => {
    state.loading.fetchComments = false;
    state.comments = Array.isArray(action.payload) ? action.payload : [];
  })
  .addCase(fetchTaskComments.rejected, (state, action) => {
    const errorMsg = action.payload || action.error?.message || "Failed to load comments.";
    state.loading.fetchComments = false;
    state.error.fetchComments = errorMsg;
    state.comments = [];
    toast.error(errorMsg);
  });


    // Create Task Comment
    builder
      .addCase(createTaskComment.pending, (state) => {
        state.loading.createComment = true;
        state.error.createComment = null;
      })
      .addCase(createTaskComment.fulfilled, (state, action) => {
        state.loading.createComment = false;
        // Comments list is updated by the fetchTaskComments thunk dispatched internally.
        toast.success("Comment added successfully!");
      })
      .addCase(createTaskComment.rejected, (state, action) => {
        state.loading.createComment = false;
        state.error.createComment = action.payload;
        toast.error(action.payload || "Failed to add comment.");
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
        toast.success(
          action.payload.message || "Tasks reassigned successfully!"
        );
      })
      .addCase(reAssignAllTasks.rejected, (state, action) => {
        state.loading.reassign = false;
        state.error.reassign =
          action.payload?.message || "Failed to reassign tasks";
        toast.error(state.error.reassign);
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
  openAssignTaskModal,
  closeAssignTaskModal,
  openViewTaskModal,
  closeViewTaskModal,
} = taskSlice.actions;

// Selectors
export const selectMyTasks = (state) => state.tasks.myTasks;
export const selectDelegatedTasks = (state) => state.tasks.delegatedTasks;
export const selectAllTasks = (state) => state.tasks.allTasks;
export const selectCurrentTask = (state) => state.tasks.currentTask;
export const selectComments = (state) => state.tasks.comments; // Selector for comments
export const selectTaskLoadingStates = (state) => state.tasks.loading;
export const selectTaskErrorStates = (state) => state.tasks.error;
export const selectSearchResults = (state) => state.tasks.searchResults;
export const selectFilterResults = (state) => state.tasks.filteredResults;
export const selectSelectedTaskIds = (state) => state.tasks.selectedTaskIds;
export const selectCategoryTasks = (state) => state.tasks.categoryTasks;
export const selectTaskCounts = (state) => state.tasks.taskCounts;

export const selectIsAssignTaskModalOpen = (state) =>
  state.tasks.isAssignTaskModalOpen;
export const selectIsViewTaskModalOpen = (state) =>
  state.tasks.isViewTaskModalOpen;
export const selectTaskForModal = (state) => state.tasks.taskForModal;

export default taskSlice.reducer;
