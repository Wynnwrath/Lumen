import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  children?: ReactNode;   // when provided, renders children (admin-style wrapper)
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

// Label wrapper for admin forms (children mode) or a labeled input (checkout mode).
export const FormField = ({ label, children, type = "text", value, onChange, placeholder, required }: FormFieldProps) => {
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
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-surface dark:bg-slate-700/60 text-on-surface text-xs rounded-xl px-3 py-2 border border-outline-variant/40 focus:ring-2 focus:ring-secondary focus:outline-none font-medium"
      />
    </div>
  );
};
