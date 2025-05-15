import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { mockApi } from "../../services/mockApi"

// Mock data
const initialTeamMembers = [
  {
    id: "1",
    name: "Karan",
    email: "karan@example.com",
    role: "Team Lead",
    department: "Engineering",
    joinDate: "2020-01-15",
    taskCount: 12,
    completedTasks: 8,
    avatar: null,
  },
  {
    id: "2",
    name: "Prashant Tyagi",
    email: "prashant@example.com",
    role: "Frontend Developer",
    department: "Engineering",
    joinDate: "2021-03-10",
    taskCount: 8,
    completedTasks: 5,
    avatar: null,
  },
  {
    id: "3",
    name: "Rahul",
    email: "rahul@example.com",
    role: "Backend Developer",
    department: "Engineering",
    joinDate: "2021-05-22",
    taskCount: 10,
    completedTasks: 7,
    avatar: null,
  },
  {
    id: "4",
    name: "Neha",
    email: "neha@example.com",
    role: "UI/UX Designer",
    department: "Design",
    joinDate: "2022-02-15",
    taskCount: 6,
    completedTasks: 4,
    avatar: null,
  },
  {
    id: "5",
    name: "Amit",
    email: "amit@example.com",
    role: "QA Engineer",
    department: "Quality Assurance",
    joinDate: "2022-01-10",
    taskCount: 9,
    completedTasks: 8,
    avatar: null,
  },
]

// Team activities
const initialActivities = [
  {
    id: "1",
    employeeId: "2",
    employeeName: "Prashant Tyagi",
    action: "completed",
    target: "task",
    targetId: "3",
    targetName: "Update documentation",
    timestamp: "2023-06-10T10:30:00Z",
  },
  {
    id: "2",
    employeeId: "3",
    employeeName: "Rahul",
    action: "started",
    target: "task",
    targetId: "6",
    targetName: "Code review",
    timestamp: "2023-06-10T11:15:00Z",
  },
  {
    id: "3",
    employeeId: "4",
    employeeName: "Neha",
    action: "applied",
    target: "leave",
    targetId: "2",
    targetName: "Vacation leave",
    timestamp: "2023-06-15T09:45:00Z",
  },
  {
    id: "4",
    employeeId: "1",
    employeeName: "Karan",
    action: "approved",
    target: "leave",
    targetId: "1",
    targetName: "Sick leave for Rahul",
    timestamp: "2023-06-18T14:20:00Z",
  },
  {
    id: "5",
    employeeId: "5",
    employeeName: "Amit",
    action: "completed",
    target: "task",
    targetId: "4",
    targetName: "Client presentation",
    timestamp: "2023-06-20T16:30:00Z",
  },
]

export const fetchTeamMembers = createAsyncThunk("team/fetchTeamMembers", async (_, { rejectWithValue }) => {
  try {
    const response = await mockApi.get("/team")
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchTeamActivities = createAsyncThunk("team/fetchTeamActivities", async (_, { rejectWithValue }) => {
  try {
    const response = await mockApi.get("/activities")
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const teamSlice = createSlice({
  name: "team",
  initialState: {
    members: initialTeamMembers,
    activities: initialActivities,
    loading: false,
    error: null,
  },
  reducers: {
    // Local reducers for mock data
    updateTeamMemberLocal: (state, action) => {
      const { id, ...updates } = action.payload
      const memberIndex = state.members.findIndex((member) => member.id === id)
      if (memberIndex !== -1) {
        state.members[memberIndex] = { ...state.members[memberIndex], ...updates }
      }
    },
    addActivityLocal: (state, action) => {
      const newActivity = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      }
      state.activities.unshift(newActivity)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamMembers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.loading = false
        state.members = action.payload
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchTeamActivities.fulfilled, (state, action) => {
        state.activities = action.payload
      })
  },
})

export const { updateTeamMemberLocal, addActivityLocal } = teamSlice.actions

export default teamSlice.reducer
