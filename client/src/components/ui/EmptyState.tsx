import React from "react";
import { Icon } from "./Icon";

// "Nothing here" placeholder in three flavors: full card, plain text, or a table row.
interface EmptyStateProps {
  icon?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  message?: string;   // plain text mode (admin lists)
  colSpan?: number;   // set this to render a <td colSpan> row inside a table
  card?: boolean;     // render the message in the admin card style (mobile lists)
  className?: string;
}

// Shared classes for admin empty states (mobile card + desktop table row).
export const ADMIN_EMPTY_CARD_CLASS =
  "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium rounded-none";
export const ADMIN_EMPTY_ROW_CLASS = "py-12 text-center text-sm text-slate-500 dark:text-slate-400";

export const EmptyState = ({ icon, title, subtitle, action, message, colSpan, card, className }: EmptyStateProps) => {
  // plain text row inside a table (admin desktop lists)
  if (colSpan) {
    return (
      <tr>
        <td colSpan={colSpan} className={className || ADMIN_EMPTY_ROW_CLASS}>
          {message}
        </td>
      </tr>
    );
  }

  // plain text block (admin mobile lists) — card style when `card` is set
  if (message) {
    const blockClass = card ? ADMIN_EMPTY_CARD_CLASS : "py-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium";
    return <div className={className || blockClass}>{message}</div>;
  }

  // full empty-state card
  return (
    <div className={`bg-surface-container-lowest dark:bg-slate-800 rounded-2xl border border-outline-variant/30 p-8 text-center space-y-3 shadow-sm ${className || ""}`}>
      {icon && (
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-outline">
          <Icon name={icon} className="text-2xl" />
        </div>
      )}
      {title && <h3 className="text-base font-bold text-on-surface">{title}</h3>}
      {subtitle && <p className="text-xs text-outline max-w-xs mx-auto">{subtitle}</p>}
      {action && <div className="pt-2.5 flex justify-center">{action}</div>}
    </div>
  );
};
