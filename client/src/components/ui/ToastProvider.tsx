import React, { createContext, useContext, useRef, useState } from "react";
import type { ToastMessage } from "../../types";
import { Toast } from "./Toast";

// Global toast notifications via context, so any component can call useToast().
interface ToastContextValue {
  showToast: (message: string, type?: ToastMessage["type"]) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

// any component can fire a toast from anywhere in the app
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timer = useRef<number | null>(null);

  const showToast = (message: string, type: ToastMessage["type"] = "info") => {
    if (timer.current) window.clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = window.setTimeout(() => setToast(null), 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast toast={toast} />
    </ToastContext.Provider>
  );
};
