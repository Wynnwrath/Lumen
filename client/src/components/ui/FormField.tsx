import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  children?: ReactNode;   // when provided, renders children (admin-style wrapper)
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  pattern?: string;       // HTML regex the value must match
  error?: string;         // shown under the input when set
}

// Label wrapper for admin forms (children mode) or a labeled input (checkout mode).
export const FormField = ({
  label,
  children,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  required,
  pattern,
  error,
}: FormFieldProps) => {
  if (children) {
    return (
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
        {children}
      </div>
    );
  }
  return (
    <div>
      <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">
        {label}
      </label>
      <input
        type={type}
        required={required}
        pattern={pattern}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={`w-full bg-white dark:bg-slate-700/60 text-on-surface text-xs rounded-xl px-3 py-2 border focus:ring-2 focus:ring-secondary focus:outline-none font-medium ${
          error ? "border-error focus:ring-error" : "border-outline-variant/40"
        }`}
      />
      {error && <p className="mt-1 text-[10px] font-bold text-error">{error}</p>}
    </div>
  );
};
