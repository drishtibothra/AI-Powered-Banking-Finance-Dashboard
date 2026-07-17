import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import type { AppDispatch, RootState } from "./app/store";
import { bootstrapAuth } from "./features/auth/authSlice";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardLayout from "./components/DashboardLayout";
import OverviewPage from "./pages/OverviewPage";
import EntriesPage from "./pages/EntriesPage";
import BudgetsPage from "./pages/BudgetsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ChatPage from "./pages/ChatPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const bootstrapStatus = useSelector((state: RootState) => state.auth.bootstrapStatus);

  useEffect(() => { dispatch(bootstrapAuth()); }, [dispatch]);

  if (bootstrapStatus !== "done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="font-display text-lg text-slate-soft">Loading…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<OverviewPage />} />
        <Route path="entries" element={<EntriesPage />} />
        <Route path="budgets" element={<BudgetsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="chat" element={<ChatPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}