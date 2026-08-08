import { formatMoney } from "../../../utils/format";

// Shared price breakdown used across cart + checkout so the numbers never drift.
interface PriceSummaryProps {
  subtotal: number;
  discountAmount: number;
  appliedDiscountRate: number;
  shippingFee: number;
  estimatedTax: number;
  grandTotal: number;
  // Omit to hide the heading (when nested inside a card that already has one).
  title?: string;
}

export const PriceSummary = ({
  subtotal,
  discountAmount,
  appliedDiscountRate,
  shippingFee,
  estimatedTax,
  grandTotal,
  title = "Price Details",
}: PriceSummaryProps) => (
  <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs border border-outline-variant/30 space-y-3">
    {title && (
      <h3 className="text-xs sm:text-sm font-extrabold text-on-surface border-b border-outline-variant/20 pb-2">
        {title}
      </h3>
    )}
    <div className="space-y-2 text-xs">
      <div className="flex justify-between text-on-surface-variant font-medium">
        <span>Subtotal</span>
        <span className="font-bold text-on-surface">{formatMoney(subtotal)}</span>
      </div>
      {appliedDiscountRate > 0 && (
        <div className="flex justify-between text-emerald-600 font-medium">
          <span>Coupon Savings ({Math.round(appliedDiscountRate * 100)}%)</span>
          <span className="font-bold">-{formatMoney(discountAmount)}</span>
        </div>
      )}
      <div className="flex justify-between text-on-surface-variant font-medium">
        <span>Estimated Shipping</span>
        <span className="font-bold text-emerald-600">
          {shippingFee === 0 ? "FREE" : formatMoney(shippingFee)}
        </span>
      </div>
      <div className="flex justify-between text-on-surface-variant font-medium">
        <span>Estimated Sales Tax (8%)</span>
        <span className="font-bold text-on-surface">{formatMoney(estimatedTax)}</span>
      </div>
      <div className="border-t border-outline-variant/30 pt-3 flex justify-between text-sm sm:text-base font-black text-on-surface">
        <span>Total Payable Amount</span>
        <span className="text-secondary dark:text-secondary-fixed">{formatMoney(grandTotal)}</span>
      </div>
    </div>
  </div>
);
