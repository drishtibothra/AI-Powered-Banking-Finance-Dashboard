import { useState, forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, id, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">{label}</label>
        <div className="relative">
          <input
            id={id}
            ref={ref}
            type={visible ? "text" : "password"}
            className={`w-full rounded-lg border bg-white px-3.5 py-2.5 pr-10 text-sm text-ink placeholder:text-slate-soft/60
              focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold
              ${error ? "border-negative" : "border-border"}`}
            {...rest}
          />
          <button type="button" onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-soft hover:text-ink">
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className="mt-1.5 text-xs text-negative">{error}</p>}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
export default PasswordInput;