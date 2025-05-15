import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  user: {
    id: "1",
    name: "Karan",
    email: "karan@example.com",
    role: "admin",
    avatar: null,
  },
  isAuthenticated: true,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile } = authSlice.actions

export default authSlice.reducer
