import React from "react";
import { Link } from "react-router-dom";
import { Icon } from "./Icon";

// Reusable button with preset variants/sizes, optional leading icon, an
// optional loading spinner, and optional `to` (renders a router Link).
type ButtonVariant = "secondary" | "blue" | "dark" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconClassName?: string;
  fullWidth?: boolean;
  loading?: boolean;
  to?: string;
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
  loading = false,
  to,
  className,
  children,
  type = "button",
  disabled,
  ...rest
}: ButtonProps) => {
  const classes = `inline-flex items-center justify-center gap-1.5 font-bold transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? "w-full" : ""} ${className || ""}`;

  const inner = (
    <>
      {loading ? (
        <Icon name="loader" className="text-base animate-spin" />
      ) : icon ? (
        <Icon name={icon} className={iconClassName || "text-base"} />
      ) : null}
      {children}
    </>
  );

  if (to) {
    // The shared onClick/aria/title props are compatible with a link; the
    // button-specific ones (form, etc.) are harmless on an anchor.
    return (
      <Link to={to} className={classes} {...(rest as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled || loading} className={classes} {...rest}>
      {inner}
    </button>
  );
};
