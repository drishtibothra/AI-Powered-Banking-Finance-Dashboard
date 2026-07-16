import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LayoutDashboard, Receipt, Wallet, BarChart3, MessageCircle, LogOut } from "lucide-react";
import type { RootState, AppDispatch } from "../app/store";
import { logout } from "../features/auth/authSlice";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/entries", label: "Entries", icon: Receipt },
  { to: "/dashboard/budgets", label: "Budgets", icon: Wallet },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/chat", label: "Ask AI", icon: MessageCircle },
];

export default function DashboardLayout() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-paper">
      <aside className="w-64 bg-navy flex flex-col justify-between px-5 py-8 shrink-0">
        <div>
          <div className="px-2 mb-10">
            <span className="font-mono text-xs tracking-widest text-gold uppercase">
              AI-Powered Finance
            </span>
            <h1 className="font-display text-xl text-white mt-1">Dashboard</h1>
          </div>

          <nav className="space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? "bg-white/10 text-white border-l-2 border-gold" : "text-slate-soft hover:bg-white/5 hover:text-white"}`
                }
              >
                <Icon size={18} strokeWidth={1.8} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="px-2">
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div className="min-w-0">
              <p className="text-sm text-white truncate">{user?.email}</p>
              <p className="text-xs text-slate-soft">Signed in</p>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="p-2 rounded-lg text-slate-soft hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}