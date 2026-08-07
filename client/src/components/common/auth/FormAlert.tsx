import { Icon } from "../Icon";
import type { ReactNode } from "react";

interface FormAlertProps {
  type: "error" | "success";
  title?: string;
  children?: ReactNode;
}

export const FormAlert = ({ type, title, children }: FormAlertProps) => (
  <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-xs ${
    type === "error"
      ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
      : "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
  }`}>
    <Icon name={type === "error" ? "warning" : "check_circle"} className="text-base mt-0.5 shrink-0" />
    <div>
      {title && <p className="font-bold">{title}</p>}
      {children && <div>{children}</div>}
    </div>
  </div>
);
