import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, id, ...rest }, ref) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-soft/60
          focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold
          ${error ? "border-negative" : "border-border"}`}
        {...rest}
      />
      {error && <p className="mt-1.5 text-xs text-negative">{error}</p>}
    </div>
  )
);

FormInput.displayName = "FormInput";
export default FormInput;