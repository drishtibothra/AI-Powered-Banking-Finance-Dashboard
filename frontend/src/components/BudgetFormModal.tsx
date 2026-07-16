import { useState, useMemo } from "react";
import type { FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import { addBudget, editBudget } from "../features/budgets/budgetsSlice";
import type { Budget } from "../features/budgets/budgetsApi";
import Modal from "./Modal";
import FormInput from "./FormInput";

export default function BudgetFormModal({ budget, onClose }: { budget?: Budget | null; onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector((state: RootState) => state.entries.categories);
  const expenseCategories = useMemo(() => categories.filter((c) => c.entry_type === "expense"), [categories]);

  const today = new Date();
  const [categoryId, setCategoryId] = useState<number | "">(budget?.category_id || "");
  const [limitAmount, setLimitAmount] = useState(budget ? String(budget.limit_amount) : "");
  const [month] = useState(budget?.month || today.getMonth() + 1);
  const [year] = useState(budget?.year || today.getFullYear());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericLimit = parseFloat(limitAmount);
    if (!numericLimit || numericLimit <= 0) { setError("Enter a limit greater than 0."); return; }

    setIsSubmitting(true);
    try {
      if (budget) {
        await dispatch(editBudget({ id: budget.id, limit_amount: numericLimit })).unwrap();
      } else {
        if (!categoryId) { setError("Please select a category."); setIsSubmitting(false); return; }
        await dispatch(addBudget({ category_id: Number(categoryId), limit_amount: numericLimit, month, year })).unwrap();
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={budget ? "Edit budget" : "Set a budget"} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        {!budget && (
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-ink mb-1.5">Category</label>
            <select id="category" value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-ink
                focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold">
              <option value="">Select an expense category</option>
              {expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {expenseCategories.length === 0 && (
              <p className="mt-1.5 text-xs text-slate-soft">No expense categories yet — add one from Entries first.</p>
            )}
          </div>
        )}

        <FormInput id="limitAmount" label="Monthly limit (₹)" type="number" min="0" step="0.01" required
          value={limitAmount} onChange={(e) => setLimitAmount(e.target.value)} />

        <p className="text-xs text-slate-soft mb-4">
          Applies to {new Date(year, month - 1).toLocaleString("default", { month: "long" })} {year}
        </p>

        {error && <p role="alert" className="mb-4 text-sm text-negative">{error}</p>}

        <button type="submit" disabled={isSubmitting}
          className="w-full rounded-lg bg-navy text-white font-medium py-2.5 text-sm
            hover:bg-navy-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2">
          {isSubmitting ? "Saving…" : budget ? "Save changes" : "Set budget"}
        </button>
      </form>
    </Modal>
  );
}