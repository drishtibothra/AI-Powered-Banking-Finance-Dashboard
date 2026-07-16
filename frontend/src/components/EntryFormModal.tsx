import { useState, useMemo } from "react";
import type { FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import { addEntry, editEntry } from "../features/entries/entriesSlice";
import type { Entry } from "../features/entries/entriesApi";
import Modal from "./Modal";
import FormInput from "./FormInput";

const entryTypes = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "savings", label: "Savings" },
] as const;

export default function EntryFormModal({ entry, onClose }: { entry?: Entry | null; onClose: () => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector((state: RootState) => state.entries.categories);

  const [entryType, setEntryType] = useState<"income" | "expense" | "savings">(entry?.entry_type || "expense");
  const [categoryId, setCategoryId] = useState<number | "">(entry?.category_id || "");
  const [amount, setAmount] = useState(entry ? String(entry.amount) : "");
  const [description, setDescription] = useState(entry?.description || "");
  const [date, setDate] = useState(entry?.date || new Date().toISOString().slice(0, 10));
  const [frequency, setFrequency] = useState<"one_time" | "recurring_monthly">(entry?.frequency || "one_time");
  const [recurrenceDay, setRecurrenceDay] = useState(entry?.recurrence_day ? String(entry.recurrence_day) : "1");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.entry_type === entryType),
    [categories, entryType]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!categoryId) { setError("Please select a category."); return; }
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) { setError("Enter an amount greater than 0."); return; }

    setIsSubmitting(true);
    const payload = {
      category_id: Number(categoryId),
      amount: numericAmount,
      entry_type: entryType,
      description: description || undefined,
      date,
      frequency,
      recurrence_day: frequency === "recurring_monthly" ? Number(recurrenceDay) : null,
    };

    try {
      if (entry) {
        await dispatch(editEntry({ id: entry.id, payload })).unwrap();
      } else {
        await dispatch(addEntry(payload)).unwrap();
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={entry ? "Edit entry" : "Add entry"} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <span className="block text-sm font-medium text-ink mb-1.5">Type</span>
          <div className="grid grid-cols-3 gap-2">
            {entryTypes.map((t) => (
              <button key={t.value} type="button"
                onClick={() => { setEntryType(t.value); setCategoryId(""); }}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors
                  ${entryType === t.value ? "bg-navy text-white border-navy" : "bg-white text-slate-soft border-border hover:border-navy/40"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-ink mb-1.5">Category</label>
          <select id="category" value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-ink
              focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold">
            <option value="">Select a category</option>
            {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {filteredCategories.length === 0 && (
            <p className="mt-1.5 text-xs text-slate-soft">No {entryType} categories yet.</p>
          )}
        </div>

        <FormInput id="amount" label="Amount (₹)" type="number" min="0" step="0.01" required
          value={amount} onChange={(e) => setAmount(e.target.value)} />
        <FormInput id="description" label="Description (optional)" type="text"
          value={description} onChange={(e) => setDescription(e.target.value)} />
        <FormInput id="date" label="Date" type="date" required
          value={date} onChange={(e) => setDate(e.target.value)} />

        <div className="mb-4">
          <span className="block text-sm font-medium text-ink mb-1.5">Frequency</span>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setFrequency("one_time")}
              className={`py-2 rounded-lg text-sm font-medium border transition-colors
                ${frequency === "one_time" ? "bg-navy text-white border-navy" : "bg-white text-slate-soft border-border hover:border-navy/40"}`}>
              One-time
            </button>
            <button type="button" onClick={() => setFrequency("recurring_monthly")}
              className={`py-2 rounded-lg text-sm font-medium border transition-colors
                ${frequency === "recurring_monthly" ? "bg-navy text-white border-navy" : "bg-white text-slate-soft border-border hover:border-navy/40"}`}>
              Monthly
            </button>
          </div>
        </div>

        {frequency === "recurring_monthly" && (
          <FormInput id="recurrenceDay" label="Day of month" type="number" min="1" max="31"
            value={recurrenceDay} onChange={(e) => setRecurrenceDay(e.target.value)} />
        )}

        {error && <p role="alert" className="mb-4 text-sm text-negative">{error}</p>}

        <button type="submit" disabled={isSubmitting}
          className="w-full rounded-lg bg-navy text-white font-medium py-2.5 text-sm
            hover:bg-navy-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2">
          {isSubmitting ? "Saving…" : entry ? "Save changes" : "Add entry"}
        </button>
      </form>
    </Modal>
  );
}