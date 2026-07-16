import { useEffect, useState } from "react";
import type { SummaryResponse } from "../features/analytics/analyticsApi";
import { fetchMonthlySummary } from "../features/analytics/analyticsApi";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatINR(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num || 0);
}

export default function OverviewPage() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const today = new Date();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchMonthlySummary(today.getMonth() + 1, today.getFullYear());
        setSummary(data);
      } catch {
        setError("Couldn't load your summary. Try refreshing.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const cards = summary
    ? [
        { label: "Income", value: summary.total_income, accent: "text-positive" },
        { label: "Expenses", value: summary.total_expense, accent: "text-negative" },
        { label: "Savings", value: summary.total_savings, accent: "text-gold" },
        { label: "Net Free Balance", value: summary.net_free_balance, accent: "text-ink" },
      ]
    : [];

  return (
    <div className="px-8 py-8 max-w-5xl">
      <p className="font-mono text-xs tracking-widest text-slate-soft uppercase mb-1">
        {monthNames[today.getMonth()]} {today.getFullYear()}
      </p>
      <h1 className="font-display text-3xl text-ink mb-8">Overview</h1>

      {isLoading && <p className="text-sm text-slate-soft">Loading your numbers…</p>}
      {error && <p className="text-sm text-negative">{error}</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-border p-5">
              <p className="text-xs font-medium text-slate-soft uppercase tracking-wide mb-2">{card.label}</p>
              <p className={`font-mono text-2xl ${card.accent}`}>{formatINR(card.value)}</p>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && summary && Number(summary.total_income) === 0 && (
        <p className="mt-8 text-sm text-slate-soft">
          No entries yet this month — head to <span className="text-gold font-medium">Entries</span> to add your first one.
        </p>
      )}
    </div>
  );
}