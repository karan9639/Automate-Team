import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { mockApi } from "../../services/mockApi";

// Async thunks for API calls
export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async () => {
  const response = await mockApi.get("/tasks");
  return response.data;
});

export const addTask = createAsyncThunk("tasks/addTask", async (task) => {
  const response = await mockApi.post("/tasks", task);
  return response.data;
});

export const updateTask = createAsyncThunk("tasks/updateTask", async (task) => {
  const response = await mockApi.put(`/tasks/${task.id}`, task);
  return response.data;
});

export const deleteTask = createAsyncThunk("tasks/deleteTask", async (id) => {
  await mockApi.delete(`/tasks/${id}`);
  return id;
});

// Initial state with some mock tasks
const initialState = {
  tasks: [
    // Empty initial state for demo purposes
  ],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Add a task locally (without API call)
    addTaskLocal: (state, action) => {
      state.tasks.push(action.payload);
    },

    // Update a task locally
    updateTaskLocal: (state, action) => {
      const index = state.tasks.findIndex(
        (task) => task.id === action.payload.id
      );
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...action.payload };
      }
    },

    // Delete a task locally
    deleteTaskLocal: (state, action) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(
          (task) => task.id === action.payload.id
        );
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      });
  },
});

export const {
  addTaskLocal,
  updateTaskLocal,
  deleteTaskLocal,
  setLoading,
  setError,
} = taskSlice.actions;

export default taskSlice.reducer;
