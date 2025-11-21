import { configureStore } from "@reduxjs/toolkit";
import studentsReducer from "./slices/studentsSlice";

export const store = configureStore({
  reducer: {
    students: studentsReducer,
  },
});
if (typeof window !== "undefined") {
  (window as any).store = store;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
