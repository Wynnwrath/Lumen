import React from "react";
import { Icon } from "./Icon";

interface KpiCardProps {
  id?: string;
  label: string;
  value: React.ReactNode;
  subtext: string;
  chip?: string;
  chipClassName?: string;
  icon?: string;
  iconClassName?: string;
  valueClassName?: string;
  className?: string;
}

export const KpiCard = ({
  id,
  label,
  value,
  subtext,
  chip,
  chipClassName,
  icon,
  iconClassName,
  valueClassName,
  className,
}: KpiCardProps) => {
  return (
    <div className={`bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors duration-200 ${className || ""}`}>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{label}</span>
        {chip && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold border ${chipClassName || "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}>
            {chip}
          </span>
        )}
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <div id={id} className={`text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight ${valueClassName || ""}`}>
            {value}
          </div>
          {icon && <Icon name={icon} className={iconClassName || "text-sm sm:text-base font-bold text-slate-500 dark:text-slate-400"} />}
        </div>
        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{subtext}</p>
      </div>
    </div>
  );
};
