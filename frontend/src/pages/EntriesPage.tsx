import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { AppDispatch, RootState } from "../app/store";
import { fetchEntries, fetchCategories, removeEntry } from "../features/entries/entriesSlice";
import type { Entry } from "../features/entries/entriesApi";
import EntryFormModal from "../components/EntryFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

function formatINR(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num || 0);
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

const typeAccent: Record<string, string> = { income: "text-positive", expense: "text-negative", savings: "text-gold" };

export default function EntriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, categories, status } = useSelector((state: RootState) => state.entries);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchEntries(undefined));
    dispatch(fetchCategories());
  }, [dispatch]);

  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name || "—";
  const handleAdd = () => { setEditingEntry(null); setIsModalOpen(true); };
  const handleEdit = (entry: Entry) => { setEditingEntry(entry); setIsModalOpen(true); };

  const confirmDelete = async () => {
    if (confirmDeleteId === null) return;
    setDeletingId(confirmDeleteId);
    try { await dispatch(removeEntry(confirmDeleteId)).unwrap(); } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-ink">Entries</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleAdd}
            className="flex items-center gap-2 bg-navy text-white text-sm font-medium px-4 py-2.5 rounded-lg
              hover:bg-navy-light transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2">
            <Plus size={16} /> Add entry
          </button>
        </div>
      </div>

      {status === "loading" && <p className="text-sm text-slate-soft">Loading entries…</p>}

      {status === "succeeded" && items.length === 0 && (
        <div className="bg-white rounded-xl border border-border p-10 text-center">
          <p className="text-sm text-slate-soft">No entries yet. Add your first income, expense, or savings entry to get started.</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="bg-white rounded-xl border border-border divide-y divide-border overflow-hidden">
          {items.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm text-ink font-medium truncate">{entry.description || categoryName(entry.category_id)}</p>
                <p className="text-xs text-slate-soft mt-0.5">
                  {categoryName(entry.category_id)} · {entry.date}
                  {entry.frequency === "recurring_monthly" && entry.recurrence_day &&
                    ` · Recurs on the ${ordinal(entry.recurrence_day)} monthly`}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <p className={`font-mono text-sm ${typeAccent[entry.entry_type]}`}>{formatINR(entry.amount)}</p>
                <button onClick={() => handleEdit(entry)} aria-label="Edit entry" className="p-1.5 rounded-lg text-slate-soft hover:text-ink hover:bg-paper">
                  <Pencil size={15} />
                </button>
                <button onClick={() => setConfirmDeleteId(entry.id)} disabled={deletingId === entry.id} aria-label="Delete entry"
                  className="p-1.5 rounded-lg text-slate-soft hover:text-negative hover:bg-paper disabled:opacity-50">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && <EntryFormModal entry={editingEntry} onClose={() => setIsModalOpen(false)} />}
      {confirmDeleteId !== null && (
        <ConfirmDialog
          title="Delete this entry?"
          message="This can't be undone, and your monthly summary will be recalculated."
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}