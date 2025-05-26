import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { generateId } from "../../utils/helpers";

// Mock API call for demonstration
const mockApiCall = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...data, id: data.id || generateId() });
    }, 1000);
  });
};

// Async thunks
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      const mockTasks = [
        {
          id: "task1",
          title: "Complete project proposal",
          description: "Draft and finalize the Q3 project proposal",
          assignees: ["1"],
          category: "Development",
          priority: "high",
          dueDate: "2023-07-15",
          status: "pending",
          createdAt: "2023-07-01T10:00:00Z",
          createdBy: "currentUser",
        },
        {
          id: "task2",
          title: "Review design mockups",
          description:
            "Review and provide feedback on the new UI design mockups",
          assignees: ["2"],
          category: "Design",
          priority: "medium",
          dueDate: "2023-07-10",
          status: "in-progress",
          createdAt: "2023-07-02T09:30:00Z",
          createdBy: "currentUser",
        },
      ];

      return mockTasks;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTask = createAsyncThunk(
  "tasks/addTask",
  async (task, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      const response = await mockApiCall(task);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, task }, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      const response = await mockApiCall({ id, ...task });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  tasks: [],
  categories: [
    { id: "1", name: "Development" },
    { id: "2", name: "Design" },
    { id: "3", name: "Marketing" },
    { id: "4", name: "Operations" },
  ],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTaskLocal: (state, action) => {
      state.tasks.push(action.payload);
    },
    updateTaskLocal: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.tasks.findIndex((task) => task.id === id);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...updates };
      }
    },
    deleteTaskLocal: (state, action) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add task
      .addCase(addTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(addTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(
          (task) => task.id === action.payload.id
        );
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addTaskLocal,
  updateTaskLocal,
  deleteTaskLocal,
  setTasks,
  clearError,
} = taskSlice.actions;

// Selectors
export const selectAllTasks = (state) => state.tasks.tasks;
export const selectTaskById = (state, taskId) =>
  state.tasks.tasks.find((task) => task.id === taskId);
export const selectTasksByStatus = (state, status) =>
  state.tasks.tasks.filter((task) => task.status === status);
export const selectTaskCategories = (state) => state.categories;
export const selectTasksLoading = (state) => state.loading;
export const selectTasksError = (state) => state.error;

export default taskSlice.reducer;
