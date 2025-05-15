import { configureStore } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import { combineReducers } from "redux"
import authReducer from "./slices/authSlice"
import taskReducer from "./slices/taskSlice"
import leaveReducer from "./slices/leaveSlice"
import teamReducer from "./slices/teamSlice"

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // only auth will be persisted
}

const rootReducer = combineReducers({
  auth: authReducer,
  tasks: taskReducer,
  leaves: leaveReducer,
  team: teamReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE", "persist/REGISTER"],
      },
    }),
})

export const persistor = persistStore(store)
