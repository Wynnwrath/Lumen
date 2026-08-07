import { Icon } from "./Icon";

// Accessible on/off switch used for admin toggles (coupon active, product
// stock). Shows a spinner while a save is in flight.
interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const ToggleSwitch = ({ checked, onChange, disabled, loading }: ToggleSwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    disabled={disabled || loading}
    className={`relative inline-flex items-center h-5 w-10 rounded-full transition-colors shrink-0 ${checked ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"} ${disabled || loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
  >
    {loading ? (
      <span className="mx-auto">
        <Icon name="loader" className="text-xs animate-spin text-white" />
      </span>
    ) : (
      <span
        className={`inline-block w-4 h-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-[2px]"}`}
      />
    )}
  </button>
);
