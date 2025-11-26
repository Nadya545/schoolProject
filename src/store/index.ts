import { configureStore } from "@reduxjs/toolkit";
import studentsReducer from "./slices/studentsSlice";
import { usersApi } from "./api/usersApi";
import { scoresApi } from "./api/scoresApi";

export const store = configureStore({
  reducer: {
    students: studentsReducer,
    // Добавляем API редюсеры
    [usersApi.reducerPath]: usersApi.reducer,
    [scoresApi.reducerPath]: scoresApi.reducer,
  },
  // Добавляем middleware для RTK Query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(usersApi.middleware)
      .concat(scoresApi.middleware),
});

if (typeof window !== "undefined") {
  (window as any).store = store;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
