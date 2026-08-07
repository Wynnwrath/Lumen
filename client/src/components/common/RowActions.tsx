import { useRef, useState } from "react";
import { Icon } from "./Icon";
import { useClickOutside } from "../../hooks/useClickOutside";

export interface RowAction {
  label: string;
  icon: string;
  onClick: () => void;
  danger?: boolean;
}

// "⋯" menu for per-row actions (Edit / Activate / Delete, etc.). Keeps row
// actions consistent across admin tables instead of scattered icon buttons.
export const RowActions = ({ actions }: { actions: RowAction[] }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`p-1.5 rounded-lg transition text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 ${open ? "bg-slate-100 dark:bg-slate-800" : ""}`}
        aria-label="Row actions"
        title="Actions"
      >
        <Icon name="dots_three_vertical" className="text-base" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden py-1">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                setOpen(false);
                action.onClick();
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-left transition ${
                action.danger
                  ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Icon name={action.icon} className="text-sm" />
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
