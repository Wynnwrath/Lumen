import React from "react";

interface AdminFieldProps {
  label: string;
  children: React.ReactNode;
}

export const AdminField = ({ label, children }: AdminFieldProps) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
    {children}
  </div>
);
