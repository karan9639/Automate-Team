import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import taskReducer from "./slices/taskSlice";
import leaveReducer from "./slices/leaveSlice";
import teamReducer from "./slices/teamSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    leaves: leaveReducer,
    team: teamReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
