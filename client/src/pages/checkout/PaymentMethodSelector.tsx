import { Icon } from "../../components/common/Icon";
import type { PaymentMethod } from "../../hooks/useCheckoutForm";

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
}

export const PaymentMethodSelector = ({ value, onChange }: PaymentMethodSelectorProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        type="button"
        onClick={() => onChange("Cash on Delivery")}
        className={`flex flex-col justify-between p-2.5 rounded-xl border-2 cursor-pointer transition text-left ${
          value === "Cash on Delivery"
            ? "border-secondary bg-secondary/5 dark:bg-slate-700/60"
            : "border-outline-variant/30 hover:border-secondary/50 bg-surface dark:bg-slate-800"
        }`}
      >
        <Icon name="local_atm" className="text-secondary text-lg" />
        <span className="text-[10px] font-bold text-on-surface mt-1 block">COD</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("E-Wallet")}
        className={`flex flex-col justify-between p-2.5 rounded-xl border-2 cursor-pointer transition text-left ${
          value === "E-Wallet"
            ? "border-secondary bg-secondary/5 dark:bg-slate-700/60"
            : "border-outline-variant/30 hover:border-secondary/50 bg-surface dark:bg-slate-800"
        }`}
      >
        <Icon name="account_balance_wallet" className="text-blue-600 text-lg" />
        <span className="text-[10px] font-bold text-on-surface mt-1 block">E-Wallet</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("Bank Transfer")}
        className={`flex flex-col justify-between p-2.5 rounded-xl border-2 cursor-pointer transition text-left ${
          value === "Bank Transfer"
            ? "border-secondary bg-secondary/5 dark:bg-slate-700/60"
            : "border-outline-variant/30 hover:border-secondary/50 bg-surface dark:bg-slate-800"
        }`}
      >
        <Icon name="account_balance" className="text-emerald-600 text-lg" />
        <span className="text-[10px] font-bold text-on-surface mt-1 block">Bank</span>
      </button>
    </div>
  );
};
