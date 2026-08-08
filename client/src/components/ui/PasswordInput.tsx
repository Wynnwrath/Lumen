import React, { useState } from "react";
import { Icon } from "../ui/Icon";

// Password input with the auth-page look (leading lock icon, show/hide toggle).
// Use everywhere a password field appears so the styling stays in one place.
interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  rightAction?: React.ReactNode; // e.g. a "Forgot password?" link beside the label
}

export const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  rightAction,
  ...rest
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-xs font-bold text-on-surface dark:text-slate-200">
          {label}
        </label>
        {rightAction}
      </div>
      <div className="relative">
        <Icon name="lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg" />
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          required
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-surface dark:bg-slate-900 text-on-surface dark:text-white border border-outline-variant/60 rounded-xl py-2.5 pl-10 pr-11 text-xs font-medium outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition"
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface dark:hover:text-white"
          title={showPassword ? "Hide password" : "Show password"}
        >
          <Icon name={showPassword ? "eye_off" : "eye"} className="text-lg" />
        </button>
      </div>
    </div>
  );
};
