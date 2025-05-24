import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import taskReducer from "./slices/taskSlice";
import teamReducer from "./slices/teamSlice";
import leaveReducer from "./slices/leaveSlice";

// Import reducers
// For now, we'll create an empty reducer
const rootReducer = {
  auth: authReducer,
  tasks: taskReducer,
  team: teamReducer,
  leaves: leaveReducer,
  // Add your reducers here
};

// Configure store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Type exports
export const RootState = store.getState;
export const AppDispatch = store.dispatch;

export default store;
