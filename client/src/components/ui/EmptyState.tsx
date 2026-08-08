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
  className?: string;
}

export const EmptyState = ({ icon, title, subtitle, action, message, colSpan, className }: EmptyStateProps) => {
  // plain text row inside a table (admin desktop lists)
  if (colSpan) {
    return (
      <tr>
        <td colSpan={colSpan} className={className || "py-12 text-center text-sm text-slate-500 dark:text-slate-400"}>
          {message}
        </td>
      </tr>
    );
  }

  // plain text block (admin mobile lists)
  if (message) {
    return <div className={className || "py-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium"}>{message}</div>;
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
