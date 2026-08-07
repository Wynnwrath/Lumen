import React from "react";
import { Icon } from "./Icon";

// Reusable button with preset variants/sizes + optional leading icon.
type ButtonVariant = "secondary" | "blue" | "dark" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconClassName?: string;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  secondary: "bg-secondary hover:bg-secondary-container text-white shadow-sm",
  blue: "bg-blue-600 hover:bg-blue-500 text-white shadow-xs",
  dark: "bg-slate-900 hover:bg-slate-800 text-white shadow-xs",
  outline: "border border-outline-variant/60 text-on-surface hover:border-secondary hover:text-secondary",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2.5 text-xs rounded-xl",
  lg: "px-6 py-3 text-sm rounded-xl",
};

export const Button = ({
  variant = "secondary",
  size = "md",
  icon,
  iconClassName,
  fullWidth,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 font-bold transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? "w-full" : ""} ${className || ""}`}
      {...rest}
    >
      {icon && <Icon name={icon} className={iconClassName || "text-base"} />}
      {children}
    </button>
  );
};
