import { Icon } from "../Icon";
import type { InputHTMLAttributes } from "react";

// Labeled input with a leading icon, used on login/register forms.
interface AuthTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: string;
  label: string;
}

export const AuthTextField = ({ icon, label, className, ...rest }: AuthTextFieldProps) => (
  <label className="block">
    <span className="block text-xs font-bold text-on-surface-variant mb-1.5">{label}</span>
    <div className="relative">
      <Icon name={icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base" />
      <input
        {...rest}
        className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-lowest dark:bg-slate-800 text-on-surface text-sm border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/40 transition ${className || ""}`}
      />
    </div>
  </label>
);
