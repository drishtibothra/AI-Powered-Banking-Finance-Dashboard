import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import entriesReducer from "../features/entries/entriesSlice";
import budgetsReducer from "../features/budgets/budgetsSlice";

export const store = configureStore({
  reducer: { auth: authReducer, entries: entriesReducer, budgets: budgetsReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;