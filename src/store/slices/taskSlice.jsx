import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { mockApi } from "../../services/mockApi"

// Mock data
const initialTasks = [
  {
    id: "1",
    title: "Complete project proposal",
    description: "Draft and finalize the project proposal for client review",
    assignee: "Karan",
    assigneeId: "1",
    status: "in-progress",
    priority: "high",
    dueDate: "2023-06-15",
    createdAt: "2023-06-01",
  },
  {
    id: "2",
    title: "Review team performance",
    description: "Conduct monthly performance review for team members",
    assignee: "Priya",
    assigneeId: "2",
    status: "pending",
    priority: "medium",
    dueDate: "2023-06-20",
    createdAt: "2023-06-05",
  },
  {
    id: "3",
    title: "Update documentation",
    description: "Update project documentation with latest changes",
    assignee: "Prashant Tyagi",
    assigneeId: "2",
    status: "completed",
    priority: "low",
    dueDate: "2023-06-10",
    createdAt: "2023-06-02",
  },
  {
    id: "4",
    title: "Client presentation",
    description: "Prepare and deliver presentation to client",
    assignee: "Karan",
    assigneeId: "1",
    status: "overdue",
    priority: "high",
    dueDate: "2023-06-05",
    createdAt: "2023-05-25",
  },
  {
    id: "5",
    title: "Team meeting",
    description: "Weekly team sync-up meeting",
    assignee: "Karan",
    assigneeId: "1",
    status: "pending",
    priority: "medium",
    dueDate: "2023-06-16",
    createdAt: "2023-06-09",
  },
  {
    id: "6",
    title: "Code review",
    description: "Review pull requests and provide feedback",
    assignee: "Neha",
    assigneeId: "4",
    status: "in-progress",
    priority: "high",
    dueDate: "2023-06-14",
    createdAt: "2023-06-10",
  },
  {
    id: "7",
    title: "Bug fixes for release",
    description: "Fix critical bugs before the next release",
    assignee: "Prashant Tyagi",
    assigneeId: "2",
    status: "in-time",
    priority: "high",
    dueDate: "2023-06-18",
    createdAt: "2023-06-12",
  },
]

export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async (_, { rejectWithValue }) => {
  try {
    const response = await mockApi.get("/tasks")
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const addTask = createAsyncThunk("tasks/addTask", async (task, { rejectWithValue }) => {
  try {
    const response = await mockApi.post("/tasks", task)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateTask = createAsyncThunk("tasks/updateTask", async ({ id, task }, { rejectWithValue }) => {
  try {
    const response = await mockApi.put(`/tasks/${id}`, task)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const deleteTask = createAsyncThunk("tasks/deleteTask", async (id, { rejectWithValue }) => {
  try {
    await mockApi.delete(`/tasks/${id}`)
    return id
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    tasks: initialTasks,
    loading: false,
    error: null,
  },
  reducers: {
    // Local reducers for mock data
    addTaskLocal: (state, action) => {
      const newTask = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...action.payload,
      }
      state.tasks.push(newTask)
    },
    updateTaskLocal: (state, action) => {
      const { id, ...updates } = action.payload
      const taskIndex = state.tasks.findIndex((task) => task.id === id)
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates }
      }
    },
    deleteTaskLocal: (state, action) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((task) => task.id === action.payload.id)
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task.id !== action.payload)
      })
  },
})

export const { addTaskLocal, updateTaskLocal, deleteTaskLocal } = taskSlice.actions

export default taskSlice.reducer
