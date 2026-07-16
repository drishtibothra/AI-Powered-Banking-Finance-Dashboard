import { useEffect, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { fetchTrend, fetchCategoryBreakdown, fetchBurnRate } from "../features/analytics/analyticsApi";
import type { TrendPoint, CategoryBreakdownItem, BurnRateResponse } from "../features/analytics/analyticsApi";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PIE_COLORS = ["#0B1120", "#C9A227", "#7C8DB5", "#34D399", "#F87171", "#131B2E"];

function formatINR(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num || 0);
}

export default function AnalyticsPage() {
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [breakdown, setBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [burnRate, setBurnRate] = useState<BurnRateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    Promise.all([
      fetchTrend(6),
      fetchCategoryBreakdown(today.getMonth() + 1, today.getFullYear(), "expense"),
      fetchBurnRate(),
    ])
      .then(([trendRes, breakdownRes, burnRes]) => {
        setTrend(trendRes.data);
        setBreakdown(breakdownRes.data);
        setBurnRate(burnRes.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const trendData = trend.map((t) => ({
    label: `${monthNames[t.month - 1]}`,
    Income: Number(t.total_income),
    Expense: Number(t.total_expense),
    Savings: Number(t.total_savings),
  }));

  const pieData = breakdown.map((b) => ({ name: b.category_name, value: Number(b.total_amount) }));

  if (isLoading) {
    return <div className="px-8 py-8"><p className="text-sm text-slate-soft">Loading analytics…</p></div>;
  }

  return (
    <div className="px-8 py-8 max-w-5xl">
      <h1 className="font-display text-3xl text-ink mb-8">Analytics</h1>

      {/* Burn rate card */}
      {burnRate && (
        <div className="bg-navy rounded-xl p-6 mb-6 flex items-center justify-between">
          <div>
            <p className="font-mono text-xs tracking-widest text-gold uppercase mb-1">Burn Rate</p>
            <p className="text-white text-sm">
              Spending <span className="font-mono text-gold">{formatINR(burnRate.average_daily_spend)}</span> per day
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl text-white">
              {burnRate.days_remaining !== null ? Math.round(burnRate.days_remaining) : "—"}
            </p>
            <p className="text-xs text-slate-soft">days of runway left this month</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend chart */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-gold" />
            <p className="text-sm font-medium text-ink">Income vs Expense Trend</p>
          </div>
          {trendData.length === 0 ? (
            <p className="text-sm text-slate-soft py-10 text-center">Not enough history yet — check back after a few months of entries.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D7DEE8" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#7C8DB5" }} axisLine={{ stroke: "#D7DEE8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#7C8DB5" }} axisLine={{ stroke: "#D7DEE8" }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(value: number) => formatINR(value)} contentStyle={{ borderRadius: 8, borderColor: "#D7DEE8" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Income" stroke="#34D399" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Expense" stroke="#F87171" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Savings" stroke="#C9A227" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category breakdown pie */}
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-sm font-medium text-ink mb-4">Spend by Category (this month)</p>
          {pieData.length === 0 ? (
            <p className="text-sm text-slate-soft py-10 text-center">No expenses logged this month yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(entry) => entry.name}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: ValueType) =>
                  formatINR(value as number | string)
                } />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}