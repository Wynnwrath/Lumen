import type { ChangeEvent } from "react";

interface FormFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

export const FormField = ({ label, type = "text", value, onChange, placeholder, required }: FormFieldProps) => {
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
