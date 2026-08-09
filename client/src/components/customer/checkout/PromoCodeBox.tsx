import type { FormEvent } from "react";
import type { CouponMessage } from "../../../hooks/useCheckoutForm";
import { Card } from "../../ui/Card";

interface PromoCodeBoxProps {
  couponCode: string;
  onCouponChange: (value: string) => void;
  onApply: (e: FormEvent) => void;
  message: CouponMessage;
}

export const PromoCodeBox = ({ couponCode, onCouponChange, onApply, message }: PromoCodeBoxProps) => {
  return (
    <Card className="p-3.5 sm:p-4 space-y-2">
      <label className="block text-xs font-bold text-on-surface">Have a Discount Code?</label>
      <form onSubmit={onApply} className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => onCouponChange(e.target.value)}
          placeholder="Try 'LUMEN10'"
          className="flex-grow bg-surface dark:bg-slate-700/60 text-on-surface text-xs rounded-xl px-3 py-2 border border-outline-variant/40 focus:ring-2 focus:ring-secondary focus:outline-none uppercase font-mono"
        />
        <button
          type="submit"
          className="bg-primary dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition"
        >
          Apply
        </button>
      </form>
      {message && (
        <p
          className={`text-[11px] font-bold mt-1 ${
            message.isError ? "text-red-500" : "text-emerald-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </Card>
  );
};
