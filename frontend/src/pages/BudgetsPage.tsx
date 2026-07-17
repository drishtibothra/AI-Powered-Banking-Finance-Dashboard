import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import type { AppDispatch, RootState } from "../app/store";
import { fetchBudgets, removeBudget } from "../features/budgets/budgetsSlice";
import { fetchCategories } from "../features/entries/entriesSlice";
import { fetchCategoryBreakdown } from "../features/analytics/analyticsApi";
import type { CategoryBreakdownItem } from "../features/analytics/analyticsApi";
import type { Budget } from "../features/budgets/budgetsApi";
import BudgetFormModal from "../components/BudgetFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

function formatINR(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num || 0);
}

export default function BudgetsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, status } = useSelector((state: RootState) => state.budgets);
  const categories = useSelector((state: RootState) => state.entries.categories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<CategoryBreakdownItem[]>([]);

  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  useEffect(() => {
    dispatch(fetchBudgets({ month, year }));
    if (categories.length === 0) dispatch(fetchCategories());
    fetchCategoryBreakdown(month, year, "expense").then(({ data }) => setBreakdown(data));
  }, [dispatch]);

  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name || "—";
  const spentFor = (categoryId: number) => {
    const match = breakdown.find((b) => b.category_id === categoryId);
    return match ? Number(match.total_amount) : 0;
  };

  const handleAdd = () => { setEditingBudget(null); setIsModalOpen(true); };
  const handleEdit = (budget: Budget) => { setEditingBudget(budget); setIsModalOpen(true); };

  const confirmDelete = async () => {
    if (confirmDeleteId === null) return;
    setDeletingId(confirmDeleteId);
    try { await dispatch(removeBudget(confirmDeleteId)).unwrap(); } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-ink">Budgets</h1>
        <button onClick={handleAdd}
          className="flex items-center gap-2 bg-navy text-white text-sm font-medium px-4 py-2.5 rounded-lg
            hover:bg-navy-light transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2">
          <Plus size={16} /> Set a budget
        </button>
      </div>

      {status === "loading" && <p className="text-sm text-slate-soft">Loading budgets…</p>}
      {status === "succeeded" && items.length === 0 && (
        <div className="bg-white rounded-xl border border-border p-10 text-center">
          <p className="text-sm text-slate-soft">No budgets set for this month yet.</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((budget) => {
            const limit = Number(budget.limit_amount);
            const spent = spentFor(budget.category_id);
            const percent = limit > 0 ? (spent / limit) * 100 : 0;
            const isOver = spent > limit;
            const barColor = isOver ? "bg-negative" : percent >= 80 ? "bg-gold" : "bg-positive";
            const catName = categoryName(budget.category_id);

            return (
              <div key={budget.id} className={`bg-white rounded-xl border p-5 ${isOver ? "border-negative/40" : "border-border"}`}>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-ink">{catName}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(budget)} aria-label="Edit budget" className="p-1.5 rounded-lg text-slate-soft hover:text-ink hover:bg-paper">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setConfirmDeleteId(budget.id)} disabled={deletingId === budget.id} aria-label="Delete budget"
                      className="p-1.5 rounded-lg text-slate-soft hover:text-negative hover:bg-paper disabled:opacity-50">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="font-mono text-2xl text-ink">{formatINR(spent)}
                  <span className="text-sm text-slate-soft font-sans"> of {formatINR(limit)}</span>
                </p>

                <div className="mt-3 h-2 rounded-full bg-paper overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(percent, 100)}%` }} />
                </div>

                {isOver ? (
                  <>
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-negative">
                      <AlertTriangle size={13} /> Over budget by {formatINR(spent - limit)}
                    </p>
                    <div className="mt-3 pt-3 border-t border-border">
                      <button
                        onClick={() => navigate("/dashboard/chat", {
                          state: { prefill: `I'm over budget on ${catName} by ${formatINR(spent - limit)}. What specific ways can I cut back?` },
                        })}
                        className="text-xs font-medium text-gold hover:underline"
                      >
                        Ask AI for personalized advice →
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-xs text-slate-soft">{formatINR(limit - spent)} remaining</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && <BudgetFormModal budget={editingBudget} onClose={() => setIsModalOpen(false)} />}
      {confirmDeleteId !== null && (
        <ConfirmDialog
          title="Delete this budget?"
          message="You can always set a new one for this category later."
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}