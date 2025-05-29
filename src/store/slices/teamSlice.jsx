import { createSlice, createSelector } from "@reduxjs/toolkit";

const initialState = {
  members: [],
  loading: false,
  error: null,
};

export const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    setTeamMembers: (state, action) => {
      state.members = action.payload;
      state.loading = false;
      state.error = null;
    },
    addTeamMember: (state, action) => {
      state.members.push(action.payload);
    },
    updateTeamMember: (state, action) => {
      const index = state.members.findIndex(
        (member) =>
          member.id === action.payload.id || member._id === action.payload.id
      );
      if (index !== -1) {
        state.members[index] = { ...state.members[index], ...action.payload };
      }
    },
    deleteTeamMember: (state, action) => {
      state.members = state.members.filter(
        (member) =>
          member.id !== action.payload && member._id !== action.payload
      );
    },
    setTeamLoading: (state, action) => {
      state.loading = action.payload;
    },
    setTeamError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setTeamMembers,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  setTeamLoading,
  setTeamError,
} = teamSlice.actions;

// Memoized selectors
export const selectAllTeamMembers = createSelector(
  [(state) => state.team.members],
  (members) => members
);

export const selectTeamMemberById = createSelector(
  [(state) => state.team.members, (_, id) => id],
  (members, id) =>
    members.find((member) => member.id === id || member._id === id)
);

export const selectTeamLoading = createSelector(
  [(state) => state.team.loading],
  (loading) => loading
);

export const selectTeamError = createSelector(
  [(state) => state.team.error],
  (error) => error
);

export default teamSlice.reducer;
