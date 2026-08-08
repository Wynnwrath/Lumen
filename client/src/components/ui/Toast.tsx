import type { ToastMessage } from "../../types";
import { Icon } from "./Icon";

// Style/icon/color per toast type. Rendered by ToastProvider.
const TOAST_STYLES: Record<ToastMessage["type"], string> = {
  info: "bg-slate-900 text-white border-slate-700",
  success: "bg-slate-900 text-white border-slate-700",
  error: "bg-slate-900 text-white border-slate-700",
  cart: "bg-secondary text-white border-secondary-container",
  wishlist: "bg-pink-600 text-white border-pink-700",
};

const TOAST_ICONS: Record<ToastMessage["type"], string> = {
  info: "info",
  success: "check_circle",
  error: "error",
  cart: "check_circle",
  wishlist: "favorite",
};

const TOAST_ICON_COLORS: Record<ToastMessage["type"], string> = {
  info: "text-blue-400",
  success: "text-emerald-400",
  error: "text-rose-400",
  cart: "text-white",
  wishlist: "text-white",
};

export const Toast = ({ toast }: { toast: ToastMessage | null }) => {
  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 z-[60] animate-fade-up">
      <div className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold max-w-sm border ${TOAST_STYLES[toast.type]}`}>
        <Icon name={TOAST_ICONS[toast.type]} className={`text-base ${TOAST_ICON_COLORS[toast.type]}`} />
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
