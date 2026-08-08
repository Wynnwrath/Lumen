import { Link } from "react-router-dom";
import { Icon } from "../../ui/Icon";
import { ProductImage } from "../../ui/ProductImage";
import { formatMoney } from "../../../utils/format";
import type { Order } from "../../../types";

interface OrderConfirmationReceiptProps {
  order: Order;
  phone: string;
}

export const OrderConfirmationReceipt = ({ order, phone }: OrderConfirmationReceiptProps) => {
  return (
    <main className="h-full overflow-y-auto w-full max-w-2xl mx-auto px-3 sm:px-6 py-6 md:py-10">
      <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-3xl p-5 md:p-8 shadow-2xl border border-outline-variant/30 text-center space-y-5 animate-fade-up">
        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
          <Icon name="check_circle" className="text-2xl" />
        </div>

        <h2 className="text-xl md:text-3xl font-black text-on-surface">Thank You For Your Order!</h2>
        <p className="text-xs text-outline">
          Order Reference:{" "}
          <strong className="text-secondary dark:text-secondary-fixed font-mono text-xs sm:text-sm">
            #{order.orderNumber}
          </strong>
        </p>

        <div className="bg-surface dark:bg-slate-700/50 rounded-2xl p-3.5 text-left text-xs space-y-1.5 border border-outline-variant/20">
          <div className="flex justify-between">
            <span className="text-outline">Customer:</span>
            <span className="font-bold text-on-surface">{order.customer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-outline">Email:</span>
            <span className="font-bold text-on-surface truncate max-w-[180px]">{order.email || order.customer.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-outline">Phone:</span>
            <span className="font-bold text-on-surface">{order.phone || phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-outline">Address:</span>
            <span className="font-bold text-on-surface truncate max-w-[180px]">{order.address}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-outline-variant/10">
            <span className="text-outline">Payment Method:</span>
            <span className="font-bold text-secondary">{order.paymentMethod}</span>
          </div>
        </div>

        <div className="text-left space-y-2">
          <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wider">Order Summary Items</h4>
          <div className="space-y-2 text-xs divide-y divide-outline-variant/10">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 min-w-0">
                  <ProductImage src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-surface shrink-0 border border-outline-variant/30" />
                  <span className="font-bold text-on-surface truncate max-w-[140px] sm:max-w-[220px]">{item.name}</span>
                </div>
                <span className="font-extrabold text-on-surface shrink-0">
                  {item.quantity} &times; {formatMoney(item.price)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-center">
          <span className="text-xs sm:text-sm font-extrabold text-on-surface">Total Amount Paid:</span>
          <span className="text-lg sm:text-xl font-black text-secondary dark:text-secondary-fixed">
            {formatMoney(order.total)}
          </span>
        </div>

        <Link
          to="/products"
          className="inline-block w-full bg-secondary hover:bg-secondary-container text-white py-3 rounded-2xl font-extrabold text-xs transition shadow-md"
        >
          Continue Shopping
        </Link>

        <Link
          to="/orders"
          className="inline-block w-full mt-2 text-secondary hover:underline text-xs font-bold py-2 text-center"
        >
          View My Orders
        </Link>
      </div>
    </main>
  );
};
