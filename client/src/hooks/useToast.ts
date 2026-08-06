import { useState, useRef, useEffect } from "react";
import type { ToastMessage } from "../types";

export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timer = useRef<number | null>(null);

  const showToast = (message: string, type: ToastMessage["type"] = "info") => {
    if (timer.current) window.clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = window.setTimeout(() => setToast(null), 3000);
  };

  // clear the timer when the page unmounts
  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return { toast, showToast };
}
