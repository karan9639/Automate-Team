import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { mockApi } from "../../services/mockApi"

// Mock data
const initialLeaves = [
  {
    id: "1",
    employeeId: "1",
    employeeName: "Karan",
    type: "sick",
    startDate: "2023-06-10",
    endDate: "2023-06-12",
    reason: "Not feeling well",
    status: "approved",
    approvedBy: "Admin",
    createdAt: "2023-06-05",
  },
  {
    id: "2",
    employeeId: "2",
    employeeName: "Priya",
    type: "vacation",
    startDate: "2023-07-01",
    endDate: "2023-07-05",
    reason: "Family vacation",
    status: "pending",
    approvedBy: null,
    createdAt: "2023-06-15",
  },
  {
    id: "3",
    employeeId: "3",
    employeeName: "Rahul",
    type: "personal",
    startDate: "2023-06-20",
    endDate: "2023-06-20",
    reason: "Personal work",
    status: "rejected",
    approvedBy: "Admin",
    createdAt: "2023-06-18",
  },
  {
    id: "4",
    employeeId: "1",
    employeeName: "Karan",
    type: "vacation",
    startDate: "2023-08-10",
    endDate: "2023-08-15",
    reason: "Summer vacation",
    status: "pending",
    approvedBy: null,
    createdAt: "2023-06-20",
  },
]

// Attendance mock data
const initialAttendance = [
  {
    id: "1",
    employeeId: "1",
    date: "2023-06-01",
    checkIn: "09:00",
    checkOut: "18:00",
    status: "present",
  },
  {
    id: "2",
    employeeId: "1",
    date: "2023-06-02",
    checkIn: "09:15",
    checkOut: "18:30",
    status: "present",
  },
  {
    id: "3",
    employeeId: "1",
    date: "2023-06-03",
    checkIn: null,
    checkOut: null,
    status: "weekend",
  },
  {
    id: "4",
    employeeId: "1",
    date: "2023-06-04",
    checkIn: null,
    checkOut: null,
    status: "weekend",
  },
  {
    id: "5",
    employeeId: "1",
    date: "2023-06-05",
    checkIn: "09:30",
    checkOut: "18:15",
    status: "present",
  },
  {
    id: "6",
    employeeId: "1",
    date: "2023-06-06",
    checkIn: "09:05",
    checkOut: "17:45",
    status: "present",
  },
  {
    id: "7",
    employeeId: "1",
    date: "2023-06-07",
    checkIn: null,
    checkOut: null,
    status: "leave",
  },
]

export const fetchLeaves = createAsyncThunk("leaves/fetchLeaves", async (_, { rejectWithValue }) => {
  try {
    const response = await mockApi.get("/leaves")
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchAttendance = createAsyncThunk("leaves/fetchAttendance", async (employeeId, { rejectWithValue }) => {
  try {
    const response = await mockApi.get(`/attendance/${employeeId}`)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const applyLeave = createAsyncThunk("leaves/applyLeave", async (leaveData, { rejectWithValue }) => {
  try {
    const response = await mockApi.post("/leaves", leaveData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateLeaveStatus = createAsyncThunk(
  "leaves/updateLeaveStatus",
  async ({ id, status, approvedBy }, { rejectWithValue }) => {
    try {
      const response = await mockApi.put(`/leaves/${id}`, { status, approvedBy })
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const leaveSlice = createSlice({
  name: "leaves",
  initialState: {
    leaves: initialLeaves,
    attendance: initialAttendance,
    loading: false,
    error: null,
  },
  reducers: {
    // Local reducers for mock data
    applyLeaveLocal: (state, action) => {
      const newLeave = {
        id: Date.now().toString(),
        status: "pending",
        approvedBy: null,
        createdAt: new Date().toISOString(),
        ...action.payload,
      }
      state.leaves.push(newLeave)
    },
    updateLeaveStatusLocal: (state, action) => {
      const { id, status, approvedBy } = action.payload
      const leaveIndex = state.leaves.findIndex((leave) => leave.id === id)
      if (leaveIndex !== -1) {
        state.leaves[leaveIndex] = {
          ...state.leaves[leaveIndex],
          status,
          approvedBy,
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaves.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.loading = false
        state.leaves = action.payload
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.attendance = action.payload
      })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.leaves.push(action.payload)
      })
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        const index = state.leaves.findIndex((leave) => leave.id === action.payload.id)
        if (index !== -1) {
          state.leaves[index] = action.payload
        }
      })
  },
})

export const { applyLeaveLocal, updateLeaveStatusLocal } = leaveSlice.actions

export default leaveSlice.reducer
