import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import entriesReducer from "../features/entries/entriesSlice";
import budgetsReducer from "../features/budgets/budgetsSlice";
import aiChatReducer from "../features/aiChat/aiChatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    entries: entriesReducer,
    budgets: budgetsReducer,
    aiChat: aiChatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;