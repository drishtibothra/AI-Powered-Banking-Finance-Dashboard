import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  title, message, confirmLabel = "Confirm", onConfirm, onCancel, isDestructive = true,
}: {
  title: string; message: string; confirmLabel?: string;
  onConfirm: () => void; onCancel: () => void; isDestructive?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-xl border border-border w-full max-w-sm p-6 shadow-xl">
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2 rounded-full ${isDestructive ? "bg-negative/10" : "bg-gold/10"}`}>
            <AlertTriangle size={18} className={isDestructive ? "text-negative" : "text-gold"} />
          </div>
          <div>
            <h2 className="font-display text-lg text-ink">{title}</h2>
            <p className="text-sm text-slate-soft mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-soft hover:bg-paper transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors
              ${isDestructive ? "bg-negative hover:bg-negative/90" : "bg-navy hover:bg-navy-light"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}