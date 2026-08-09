import React from "react";

// Minimal card container: picks one of the two design recipes (storefront vs
// admin) and lets the caller add padding/layout/hover via className. Kept thin
// on purpose — cards vary too much to parameterize every style as a prop.
type CardVariant = "storefront" | "admin";

const VARIANT_CLASSES: Record<CardVariant, string> = {
  // Storefront: rounded, surface tokens, subtle shadow.
  storefront:
    "bg-surface-container-lowest dark:bg-slate-800 rounded-2xl border border-outline-variant/30 shadow-xs",
  // Admin: square, white/slate tokens, stronger shadow.
  admin:
    "bg-white dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800/90 shadow-sm",
};

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children?: React.ReactNode;
}

export const Card = ({ variant = "storefront", className, children }: CardProps) => (
  <div className={`${VARIANT_CLASSES[variant]} ${className || ""}`}>{children}</div>
);
