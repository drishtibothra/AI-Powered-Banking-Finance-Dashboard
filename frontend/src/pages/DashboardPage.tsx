import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <p className="font-display text-2xl text-ink">Welcome, {user?.email} — dashboard coming next.</p>
    </div>
  );
}