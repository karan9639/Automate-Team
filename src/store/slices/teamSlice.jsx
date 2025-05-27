import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  members: [
    {
      id: "1",
      name: "Karan Singh",
      email: "karan.singh@example.com",
      mobile: "7055424269",
      role: "Admin",
      reportsTo: null,
      avatar: "KS",
    },
  ],
  loading: false,
  error: null,
};

// Async thunks
export const fetchTeamMembers = createAsyncThunk(
  "team/fetchTeamMembers",
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.get('/team-members');
      // return response.data;

      // Mock implementation - return the initial members after a delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return initialState.members;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTeamMember = createAsyncThunk(
  "team/addTeamMember",
  async (member, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.post('/team-members', member);
      // return response.data;

      // Mock implementation - return the member after a delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { ...member, id: member.id || Date.now().toString() };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTeamMember = createAsyncThunk(
  "team/updateTeamMember",
  async (member, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.put(`/team-members/${member.id}`, member);
      // return response.data;

      // Mock implementation - return the updated member after a delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return member;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTeamMember = createAsyncThunk(
  "team/deleteTeamMember",
  async (id, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // await api.delete(`/team-members/${id}`);
      // return id;

      // Mock implementation - return the id after a delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Team slice
const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    // Local actions for immediate UI updates
    addTeamMemberLocal: (state, action) => {
      state.members.push(action.payload);
    },
    updateTeamMemberLocal: (state, action) => {
      const index = state.members.findIndex(
        (member) => member.id === action.payload.id
      );
      if (index !== -1) {
        state.members[index] = action.payload;
      }
    },
    deleteTeamMemberLocal: (state, action) => {
      state.members = state.members.filter(
        (member) => member.id !== action.payload
      );
    },
    clearTeamError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch team members
      .addCase(fetchTeamMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add team member
      .addCase(addTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members.push(action.payload);
      })
      .addCase(addTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update team member
      .addCase(updateTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.members.findIndex(
          (member) => member.id === action.payload.id
        );
        if (index !== -1) {
          state.members[index] = action.payload;
        }
      })
      .addCase(updateTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete team member
      .addCase(deleteTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members = state.members.filter(
          (member) => member.id !== action.payload
        );
      })
      .addCase(deleteTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  addTeamMemberLocal,
  updateTeamMemberLocal,
  deleteTeamMemberLocal,
  clearTeamError,
} = teamSlice.actions;

// Export selectors
export const selectAllTeamMembers = (state) => state.team.members;
export const selectTeamMemberById = (state, id) =>
  state.team.members.find((member) => member.id === id);
export const selectTeamManagers = (state) =>
  state.team.members.filter(
    (member) => member.role === "Manager" || member.role === "Admin"
  );
export const selectTeamLoading = (state) => state.team.loading;
export const selectTeamError = (state) => state.team.error;

// Export reducer
export default teamSlice.reducer;
