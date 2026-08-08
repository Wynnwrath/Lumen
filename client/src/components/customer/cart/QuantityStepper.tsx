import { Icon } from "../../ui/Icon";

// +/- quantity control used in cart and checkout.
interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export const QuantityStepper = ({ value, onChange, min = 1, max, className }: QuantityStepperProps) => {
  const canDecrease = value > min;
  const canIncrease = max === undefined || value < max;

  return (
    <div className={`flex items-center gap-1 border border-outline-variant/40 rounded-xl bg-surface dark:bg-slate-700/50 p-0.5 sm:p-1 shrink-0 ${className || ""}`}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={!canDecrease}
        className="w-6 h-6 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-on-surface hover:bg-slate-200 dark:hover:bg-slate-600 transition disabled:opacity-40"
      >
        <Icon name="remove" className="text-[11px] sm:text-xs" />
      </button>
      <span className="w-6 text-center text-xs font-bold text-on-surface">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={!canIncrease}
        className="w-6 h-6 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-on-surface hover:bg-slate-200 dark:hover:bg-slate-600 transition disabled:opacity-40"
      >
        <Icon name="add" className="text-[11px] sm:text-xs" />
      </button>
    </div>
  );
};
