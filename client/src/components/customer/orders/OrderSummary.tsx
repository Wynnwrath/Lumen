// Subtotal/discount/shipping/tax/total breakdown, shared by order views.
import { formatMoney } from "../../../utils/format";

interface OrderSummaryProps {
  subtotal: number;
  discount?: number;
  shipping: number;
  tax: number;
  total: number;
}

export const OrderSummary = ({ subtotal, discount = 0, shipping, tax, total }: OrderSummaryProps) => (
  <div className="space-y-1 border-t border-outline-variant/20 pt-2">
    <div className="flex justify-between text-on-surface-variant">
      <span>Subtotal</span>
      <span>{formatMoney(subtotal)}</span>
    </div>
    {discount > 0 && (
      <div className="flex justify-between text-emerald-600">
        <span>Discount</span>
        <span>-{formatMoney(discount)}</span>
      </div>
    )}
    <div className="flex justify-between text-on-surface-variant">
      <span>Shipping</span>
      <span>{shipping === 0 ? "FREE" : formatMoney(shipping)}</span>
    </div>
    <div className="flex justify-between text-on-surface-variant">
      <span>Tax</span>
      <span>{formatMoney(tax)}</span>
    </div>
    <div className="flex justify-between font-black text-on-surface text-sm">
      <span>Total</span>
      <span>{formatMoney(total)}</span>
    </div>
  </div>
);
