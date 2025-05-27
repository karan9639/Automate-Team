import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import taskReducer from "./slices/taskSlice";
import teamReducer from "./slices/teamSlice";
import leaveReducer from "./slices/leaveSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    task: taskReducer,
    team: teamReducer,
    leave: leaveReducer,
  },
});

export default store;
