import React from "react";
import { Icon } from "./Icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerIconClassName?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  headerIconClassName,
  headerActions,
  children,
  footer,
  className,
}: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full flex flex-col overflow-hidden max-h-[90vh] ${className || "max-w-lg"}`}>
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className={`w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 ${headerIconClassName || ""}`}>
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Icon name="close" className="text-xl" />
            </button>
          </div>
        </div>
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50/50 dark:bg-slate-800/40">{footer}</div>}
      </div>
    </div>
  );
};
