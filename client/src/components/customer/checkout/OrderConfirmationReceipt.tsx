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
    <main className="w-full max-w-2xl mx-auto px-3 sm:px-6 py-6 md:py-10">
      <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-3xl p-5 md:p-8 shadow-2xl border border-outline-variant/30 text-center space-y-5 animate-fade-up">
        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
          <Icon name="check_circle" className="text-2xl" />
        </div>

        <h2 className="text-xl md:text-3xl font-black text-on-surface">Thank You For Your Order!</h2>
        <p className="text-sm text-outline">
          Order Reference:{" "}
          <strong className="text-secondary dark:text-secondary-fixed font-mono text-base">
            #{order.orderNumber}
          </strong>
        </p>

        <div className="bg-surface dark:bg-slate-700/50 rounded-2xl p-5 text-left text-sm space-y-3 border border-outline-variant/20">
          <div className="flex justify-between gap-4">
            <span className="text-outline shrink-0">Customer:</span>
            <span className="font-bold text-on-surface text-right">{order.customer.name}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-outline shrink-0">Email:</span>
            <span className="font-bold text-on-surface text-right break-all">{order.email || order.customer.email}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-outline shrink-0">Phone:</span>
            <span className="font-bold text-on-surface text-right">{order.phone || phone}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-outline shrink-0">Address:</span>
            <span className="font-bold text-on-surface text-right">{order.address}</span>
          </div>
          <div className="flex justify-between gap-4 pt-2 border-t border-outline-variant/10">
            <span className="text-outline shrink-0">Payment Method:</span>
            <span className="font-bold text-secondary text-right">{order.paymentMethod}</span>
          </div>
        </div>

        <div className="text-left space-y-2">
          <h4 className="text-sm font-extrabold text-on-surface uppercase tracking-wider">Order Summary Items</h4>
          <div className="space-y-2.5 text-sm divide-y divide-outline-variant/10">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3 min-w-0">
                  <ProductImage src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-surface shrink-0 border border-outline-variant/30" />
                  <span className="font-bold text-on-surface text-left">{item.name}</span>
                </div>
                <span className="font-extrabold text-on-surface shrink-0">
                  {item.quantity} &times; {formatMoney(item.price)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-center gap-3">
          <span className="text-sm sm:text-base font-extrabold text-on-surface">Total Amount Paid:</span>
          <span className="text-xl sm:text-2xl font-black text-secondary dark:text-secondary-fixed">
            {formatMoney(order.total)}
          </span>
        </div>

        <Link
          to="/products"
          className="inline-block w-full bg-secondary hover:bg-secondary-container text-white py-3 rounded-2xl font-extrabold text-sm transition shadow-md"
        >
          Continue Shopping
        </Link>

        <Link
          to="/orders"
          className="inline-block w-full mt-2 text-secondary hover:underline text-sm font-bold py-2 text-center"
        >
          View My Orders
        </Link>
      </div>
    </main>
  );
};
